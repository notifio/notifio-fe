'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import type { TrafficFlowResponse } from '@notifio/api-client';

import { api } from '@/lib/api';
import { type MapPin, normalizeMapPins } from '@/lib/normalize-pins';

import { safeFetch } from './use-map-data/fetch-utils';
import { REFETCH_THRESHOLD_KM, areaKey, distanceKm } from './use-map-data/geo-utils';
import type { ViewportCache } from './use-map-data/types';

const VIEWPORT_REFRESH_MS = 2 * 60 * 1000;

export function useMapData(center: { lat: number; lng: number } | null) {
  const [pins, setPins] = useState<MapPin[]>([]);
  const [flowSegments, setFlowSegments] = useState<TrafficFlowResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAutoRefreshing, setIsAutoRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

      const [traffic, flow, events] = await Promise.all([
        safeFetch(() => api.getTraffic(coords.lat, coords.lng)),
        safeFetch(() => api.getTrafficFlow(coords.lat, coords.lng)),
        safeFetch(() => api.getEvents({ lat: coords.lat, lng: coords.lng, radius: 20000 })),
      ]);

      // Stale response
      if (id !== viewportFetchId.current) {
        fetchingRef.current = false;
        return;
      }

      if (!traffic && !events) {
        setError('Could not load data');
        fetchingRef.current = false;
        setIsLoading(false);
        setIsAutoRefreshing(false);
        return;
      }

      const normalized = normalizeMapPins(traffic?.incidents ?? [], events ?? []);

      setPins(normalized);
      setFlowSegments(flow ?? null);
      viewportCache.current.set(key, { pins: normalized, flow: flow ?? null });
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

  return { pins, flowSegments, isLoading, isAutoRefreshing, error, refresh };
}
