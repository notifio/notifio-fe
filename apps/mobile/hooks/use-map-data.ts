import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import type { TrafficFlowSegment, UserPreferencesResponse } from '@notifio/api-client';

import { usePreferences } from './use-preferences';
import { api } from '../lib/api';
import { REFETCH_THRESHOLD_KM, areaKey, distanceKm } from '../lib/geo-utils';
import { type MapPin, type MapPinSource, normalizeMapPins } from '../lib/normalize-pins';

/**
 * Filip BUG-2 (4.5.2026, Sprint 1 #5): user reported that disabling
 * "Doprava" in Settings → Notifications still showed traffic pins on the
 * map and still delivered push notifications. The audit found two
 * separate bugs:
 *   - BE side (Sprint 1 #1): notification-targeting defaulted missing
 *     pref rows to 'send', overriding category preferences.
 *   - FE side (this PR): `useMapData` rendered every pin returned by
 *     `getEvents` / `getTraffic` regardless of user preferences.
 *
 * This hook now consults `usePreferences()` and hides pins whose source
 * maps to a category the user explicitly disabled (every item in that
 * category toggled off). Categories the user hasn't touched stay
 * visible — we only act on explicit opt-outs to avoid hiding pins from
 * users who haven't gone through onboarding yet.
 *
 * Sprint 2 (B3, schema split) will replace this single-toggle filter
 * with a `flg_show_on_map` field that's independent of `flg_send_
 * notifications` per the team workflow header in BACKLOG.md.
 */
function mapCategoryToSources(categoryCode: string): MapPinSource[] {
  // weather_warning splits into two FE pin types — alerts (MeteoAlarm)
  // and forecast (Weather Intelligence). User toggles the BE category;
  // both pin sources should hide together until Sprint 2 adds explicit
  // sub-category toggles for weather only.
  if (categoryCode === 'weather_warning') return ['weather_alerts', 'weather_forecast'];
  if (categoryCode === 'traffic') return ['traffic'];

  // BE category code → FE pin source. Mirrors EVENT_CATEGORY_TO_SOURCE
  // in normalize-pins.ts but inlined here so we avoid coupling the
  // hook to an internal of the normalize layer.
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

const VIEWPORT_REFRESH_MS = 2 * 60 * 1000;
const EVENT_RADIUS = 20_000; // 20km

async function safeFetch<T>(fn: () => Promise<T>): Promise<T | null> {
  try {
    return await fn();
  } catch {
    return null;
  }
}

interface ViewportCacheEntry {
  pins: MapPin[];
}

export function useMapData(center: { lat: number; lng: number } | null) {
  const [pins, setPins] = useState<MapPin[]>([]);
  const [flowSegments, setFlowSegments] = useState<TrafficFlowSegment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAutoRefreshing, setIsAutoRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { preferences } = usePreferences();
  const disabledSources = useMemo(() => buildDisabledSources(preferences), [preferences]);

  const lastFetchCenter = useRef<{ lat: number; lng: number } | null>(null);
  const fetchingRef = useRef(false);
  const viewportFetchId = useRef(0);
  const viewportCache = useRef<Map<string, ViewportCacheEntry>>(new Map());

  // ── Viewport data: traffic + events (location-specific) ──────────
  const fetchViewport = useCallback(
    async (coords: { lat: number; lng: number }, auto = false) => {
      const key = areaKey(coords.lat, coords.lng);
      const cached = viewportCache.current.get(key);
      if (cached && !auto) {
        setPins(cached.pins);
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

      const [traffic, eventsResp, flow] = await Promise.all([
        safeFetch(() => api.getTraffic(coords.lat, coords.lng)),
        safeFetch(() => api.getEvents({ lat: coords.lat, lng: coords.lng, radius: EVENT_RADIUS })),
        safeFetch(() => api.getTrafficFlow(coords.lat, coords.lng)),
      ]);

      // Stale response — a newer fetch superseded this one
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
      const normalized = normalizeMapPins(
        traffic?.incidents ?? [],
        eventsResp?.events ?? [],
        allTeasers,
      );

      setPins(normalized);
      setFlowSegments(flow?.segments ?? []);
      viewportCache.current.set(key, { pins: normalized });
      lastFetchCenter.current = coords;
      fetchingRef.current = false;
      setIsLoading(false);
      setIsAutoRefreshing(false);
    },
    [],
  );

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
    () => (disabledSources.has('traffic') ? [] : flowSegments),
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
