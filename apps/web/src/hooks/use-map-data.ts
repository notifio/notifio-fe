'use client';

import { useCallback, useEffect, useState } from 'react';

import { api } from '@/lib/api';
import { DEFAULT_LOCATION } from '@/lib/location';
import { type MapPin, normalizeMapPins } from '@/lib/normalize-pins';

async function safeFetch<T>(fn: () => Promise<T>): Promise<T | null> {
  try {
    return await fn();
  } catch (err) {
    console.error('[useMapData] fetch failed:', err);
    return null;
  }
}

export function useMapData() {
  const [pins, setPins] = useState<MapPin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const [elec, water, heat, traffic] = await Promise.all([
      safeFetch(() => api.getOutages('electricity')),
      safeFetch(() => api.getOutages('water')),
      safeFetch(() => api.getOutages('heat')),
      safeFetch(() => api.getTraffic(DEFAULT_LOCATION.lat, DEFAULT_LOCATION.lng)),
    ]);

    if (!elec && !water && !heat && !traffic) {
      setError('Could not load data');
      setIsLoading(false);
      return;
    }

    const normalized = normalizeMapPins(
      elec ?? [],
      water ?? [],
      heat ?? [],
      traffic?.incidents ?? [],
    );

    setPins(normalized);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { pins, isLoading, error, refresh };
}
