import { useCallback, useEffect, useRef, useState } from 'react';

import type { TrafficFlowSegment } from '@notifio/api-client';
import { REFETCH_THRESHOLD_KM, areaKey, distanceKm } from '@notifio/shared/geo';
import { normalizeMapPins, type MapPin } from '@notifio/shared/map';

import { api } from '../lib/api';

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

  return {
    pins,
    flowSegments,
    isLoading,
    isAutoRefreshing,
    error,
    refresh,
  };
}
