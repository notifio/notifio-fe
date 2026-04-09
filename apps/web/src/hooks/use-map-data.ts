'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { ApiError } from '@notifio/api-client';
import type { TrafficFlowResponse } from '@notifio/api-client';
import type { OutageRecord } from '@notifio/shared';

import { api } from '@/lib/api';
import { type MapPin, normalizeMapPins } from '@/lib/normalize-pins';

// ── Helpers ──────────────────────────────────────────────────────────

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Fetch with a single 429 retry after 2 s. */
async function safeFetch<T>(fn: () => Promise<T>): Promise<T | null> {
  try {
    return await fn();
  } catch (err) {
    if (err instanceof ApiError && err.status === 429) {
      await delay(2000);
      try {
        return await fn();
      } catch (retryErr) {
        console.error('[useMapData] retry failed:', retryErr);
        return null;
      }
    }
    console.error('[useMapData] fetch failed:', err);
    return null;
  }
}

function distanceKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const sinLat = Math.sin(dLat / 2);
  const sinLng = Math.sin(dLng / 2);
  const a2 =
    sinLat * sinLat +
    Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * sinLng * sinLng;
  return R * 2 * Math.atan2(Math.sqrt(a2), Math.sqrt(1 - a2));
}

function areaKey(lat: number, lng: number): string {
  return `${Math.round(lat * 100) / 100}:${Math.round(lng * 100) / 100}`;
}

const REFETCH_THRESHOLD_KM = 5;

// ── Types ────────────────────────────────────────────────────────────

interface StaticData {
  elec: OutageRecord[];
  water: OutageRecord[];
  heat: OutageRecord[];
}

interface ViewportCache {
  pins: MapPin[];
  flow: TrafficFlowResponse | null;
}

// ── Hook ─────────────────────────────────────────────────────────────

export function useMapData(center: { lat: number; lng: number } | null) {
  const [pins, setPins] = useState<MapPin[]>([]);
  const [flowSegments, setFlowSegments] = useState<TrafficFlowResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const staticData = useRef<StaticData | null>(null);
  const staticFetched = useRef(false);
  const lastFetchCenter = useRef<{ lat: number; lng: number } | null>(null);
  const fetchingRef = useRef(false);
  const viewportFetchId = useRef(0);
  const viewportCache = useRef<Map<string, ViewportCache>>(new Map());

  // ── Static data: outages (fetch once on mount) ─────────────────────
  const fetchStatic = useCallback(async () => {
    if (staticFetched.current) return;
    staticFetched.current = true;

    const [elec, water, heat] = await Promise.all([
      safeFetch(() => api.getOutages('electricity')),
      safeFetch(() => api.getOutages('water')),
      safeFetch(() => api.getOutages('heat')),
    ]);

    staticData.current = {
      elec: elec ?? [],
      water: water ?? [],
      heat: heat ?? [],
    };
  }, []);

  // ── Viewport data: traffic + flow (refetch on significant pan) ─────
  const fetchViewport = useCallback(
    async (coords: { lat: number; lng: number }) => {
      // Check viewport cache
      const key = areaKey(coords.lat, coords.lng);
      const cached = viewportCache.current.get(key);
      if (cached) {
        setPins(cached.pins);
        setFlowSegments(cached.flow);
        lastFetchCenter.current = coords;
        return;
      }

      const id = ++viewportFetchId.current;

      fetchingRef.current = true;
      setIsLoading(true);
      setError(null);

      // Ensure static data is loaded
      await fetchStatic();

      const [traffic, flow] = await Promise.all([
        safeFetch(() => api.getTraffic(coords.lat, coords.lng)),
        safeFetch(() => api.getTrafficFlow(coords.lat, coords.lng)),
      ]);

      // Stale response — a newer fetch was triggered while this one was in-flight
      if (id !== viewportFetchId.current) {
        fetchingRef.current = false;
        return;
      }

      const sd = staticData.current;
      if (!sd && !traffic) {
        setError('Could not load data');
        fetchingRef.current = false;
        setIsLoading(false);
        return;
      }

      const normalized = normalizeMapPins(
        sd?.elec ?? [],
        sd?.water ?? [],
        sd?.heat ?? [],
        traffic?.incidents ?? [],
      );

      setPins(normalized);
      setFlowSegments(flow ?? null);
      viewportCache.current.set(key, { pins: normalized, flow: flow ?? null });
      lastFetchCenter.current = coords;
      fetchingRef.current = false;
      setIsLoading(false);
    },
    [fetchStatic],
  );

  // Fetch when center changes and exceeds distance threshold
  useEffect(() => {
    if (!center) return;
    if (fetchingRef.current) return;

    const last = lastFetchCenter.current;
    if (last && distanceKm(last, center) < REFETCH_THRESHOLD_KM) return;

    fetchViewport(center);
  }, [center, fetchViewport]);

  const refresh = useCallback(() => {
    if (center) {
      lastFetchCenter.current = null;
      staticFetched.current = false;
      staticData.current = null;
      fetchViewport(center);
    }
  }, [center, fetchViewport]);

  return { pins, flowSegments, isLoading, error, refresh };
}
