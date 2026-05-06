'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import type { MembershipTier, TrafficFlowResponse, UserPreferencesResponse } from '@notifio/api-client';
import { REFETCH_THRESHOLD_KM, areaKey, distanceKm } from '@notifio/shared/geo';
import { normalizeMapPins, type MapPin, type MapPinSource } from '@notifio/shared/map';

import { api } from '@/lib/api';

import { safeFetch } from './use-map-data/fetch-utils';
import type { ViewportCache } from './use-map-data/types';
import { usePreferences } from './use-preferences';

const VIEWPORT_REFRESH_MS = 2 * 60 * 1000;

/**
 * Filip BUG-2 (4.5.2026, Sprint 1 #6): user disabled "Doprava" in
 * Settings → Notifications, but traffic pins kept appearing on the map
 * and push notifications kept arriving. Mirrors the mobile fix in
 * fix/fe-mobile-map-respect-prefs — same logic, same category→source
 * mapping. Web map renderer (MapLibre) consumes `pins` from this hook
 * directly, so filtering at the hook boundary handles all callers.
 *
 * Sprint 2 (B3 schema split) will replace this single-toggle filter
 * with a separate flg_show_on_map field per the team workflow header
 * in BACKLOG.md (notifio-api repo). Until then, "vypnem Dopravu"
 * hides pins AND blocks push in lockstep — one toggle, both effects.
 */
function mapCategoryToSources(categoryCode: string): MapPinSource[] {
  if (categoryCode === 'weather_warning') return ['weather_alerts', 'weather_forecast'];
  if (categoryCode === 'traffic') return ['traffic'];

  switch (categoryCode) {
    case 'outage_electric':
      return ['electricity'];
    case 'outage_water':
      return ['water'];
    case 'outage_gas':
      return ['gas'];
    case 'outage_heat':
      return ['heat'];
    case 'air_quality':
      return ['air_quality'];
    case 'pollen':
      return ['pollen'];
    case 'hydrology':
      return ['hydrology'];
    case 'wildfire':
      return ['wildfire'];
    case 'outage_internet':
      return ['outage_internet'];
    default:
      return [];
  }
}

function buildDisabledSources(prefs: UserPreferencesResponse | null): Set<MapPinSource> {
  const disabled = new Set<MapPinSource>();
  if (!prefs) return disabled;
  for (const cat of prefs.notifications) {
    if (cat.items.length === 0) continue;
    const allDisabled = cat.items.every((i) => !i.showOnMap);
    if (!allDisabled) continue;
    for (const src of mapCategoryToSources(cat.categoryCode)) {
      disabled.add(src);
    }
  }
  return disabled;
}

interface UseMapDataOptions {
  showUpcoming?: boolean;
  tier?: MembershipTier | null;
}

export function useMapData(
  center: { lat: number; lng: number } | null,
  opts: UseMapDataOptions = {},
) {
  const { showUpcoming = false, tier = null } = opts;
  const [pins, setPins] = useState<MapPin[]>([]);
  const [flowSegments, setFlowSegments] = useState<TrafficFlowResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAutoRefreshing, setIsAutoRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { preferences } = usePreferences();
  const disabledSources = useMemo(() => buildDisabledSources(preferences), [preferences]);

  const lastFetchCenter = useRef<{ lat: number; lng: number } | null>(null);
  const fetchingRef = useRef(false);
  const viewportFetchId = useRef(0);
  const viewportCache = useRef<Map<string, ViewportCache>>(new Map());

  // ── Viewport data: traffic + flow + events ────────────────────────
  const fetchViewport = useCallback(
    async (coords: { lat: number; lng: number }, auto = false) => {
      // Check viewport cache
      const key = areaKey(coords.lat, coords.lng);
      const cached = viewportCache.current.get(key);
      if (cached && !auto) {
        setPins(cached.pins);
        setFlowSegments(cached.flow);
        lastFetchCenter.current = coords;
        return;
      }

      const id = ++viewportFetchId.current;

      fetchingRef.current = true;
      if (auto) {
        setIsAutoRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      const [traffic, flow, eventsResp] = await Promise.all([
        safeFetch(() => api.getTraffic(coords.lat, coords.lng)),
        safeFetch(() => api.getTrafficFlow(coords.lat, coords.lng)),
        safeFetch(() => api.getEvents({ lat: coords.lat, lng: coords.lng, radius: 20000 })),
      ]);

      // Stale response
      if (id !== viewportFetchId.current) {
        fetchingRef.current = false;
        return;
      }

      if (!traffic && !eventsResp) {
        setError('Could not load data');
        fetchingRef.current = false;
        setIsLoading(false);
        setIsAutoRefreshing(false);
        return;
      }

      const allTeasers = [
        ...(eventsResp?.teasers ?? []),
        ...(traffic?.teasers ?? []),
      ];
      // Cross-repo audit (M3): TomTom incidents now live in `f_event` with
      // proper UUIDs and surface through `/events`. Feeding `/traffic`'s
      // raw TomTom-id incidents into the normalizer too caused duplicate
      // pins (same incident, two ID namespaces). Pass [] here; keep the
      // /traffic call only for `teasers` (off-tier upsell).
      const normalized = normalizeMapPins(
        [],
        eventsResp?.events ?? [],
        allTeasers,
        { showUpcoming, tier },
      );

      setPins(normalized);
      setFlowSegments(flow ?? null);
      viewportCache.current.set(key, { pins: normalized, flow: flow ?? null });
      lastFetchCenter.current = coords;
      fetchingRef.current = false;
      setIsLoading(false);
      setIsAutoRefreshing(false);
    },
    [showUpcoming, tier],
  );

  // Invalidate cache + force re-fetch when filter opts change. Cached
  // pins were normalized under previous showUpcoming/tier and would
  // render stale; the threshold-based effect below skips the re-fetch
  // because the center hasn't moved, so we have to nudge it by clearing
  // lastFetchCenter as well. Ref-based comparator avoids duplicate fires.
  const prevOptsKey = useRef<string>(`${showUpcoming}|${tier ?? ''}`);
  const optsKey = `${showUpcoming}|${tier ?? ''}`;
  if (prevOptsKey.current !== optsKey) {
    prevOptsKey.current = optsKey;
    viewportCache.current.clear();
    lastFetchCenter.current = null;
  }

  // Fetch when center changes and exceeds distance threshold
  useEffect(() => {
    if (!center) return;
    if (fetchingRef.current) return;

    const last = lastFetchCenter.current;
    if (last && distanceKm(last, center) < REFETCH_THRESHOLD_KM) return;

    fetchViewport(center);
  }, [center, fetchViewport]);

  // Auto-refresh viewport data every 2 minutes
  useEffect(() => {
    if (!center) return;
    const interval = setInterval(() => {
      viewportCache.current.clear();
      lastFetchCenter.current = null;
      fetchViewport(center, true);
    }, VIEWPORT_REFRESH_MS);
    return () => clearInterval(interval);
  }, [center, fetchViewport]);

  const refresh = useCallback(() => {
    if (center) {
      lastFetchCenter.current = null;
      viewportCache.current.clear();
      fetchViewport(center);
    }
  }, [center, fetchViewport]);

  // Pref-aware filtering — see header note. Cheap memoised filter; the
  // hook still caches raw pins per viewport so toggling preferences
  // doesn't trigger a refetch.
  const filteredPins = useMemo(
    () => (disabledSources.size === 0 ? pins : pins.filter((p) => !disabledSources.has(p.source))),
    [pins, disabledSources],
  );
  const filteredFlowSegments = useMemo(
    () => (disabledSources.has('traffic') ? null : flowSegments),
    [flowSegments, disabledSources],
  );

  return {
    pins: filteredPins,
    flowSegments: filteredFlowSegments,
    isLoading,
    isAutoRefreshing,
    error,
    refresh,
  };
}
