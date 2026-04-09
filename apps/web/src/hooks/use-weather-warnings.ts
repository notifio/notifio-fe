'use client';

import { useCallback, useEffect, useState } from 'react';

import type { WeatherWarning } from '@notifio/api-client';

import { api } from '@/lib/api';

export function useWeatherWarnings(center: { lat: number; lng: number } | null) {
  const [warnings, setWarnings] = useState<WeatherWarning[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const refresh = useCallback(async (coords: { lat: number; lng: number }) => {
    setIsLoading(true);
    try {
      const data = await api.getWeatherWarnings(coords.lat, coords.lng);
      setWarnings(data);
    } catch (err) {
      console.error('[useWeatherWarnings] fetch failed:', err);
      setWarnings([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (center) refresh(center);
  }, [center, refresh]);

  return { warnings, isLoading };
}
