'use client';

import { useCallback, useEffect, useState } from 'react';

import type { WeatherData } from '@notifio/shared';

import { api } from '@/lib/api';
import { DEFAULT_LOCATION } from '@/lib/location';

export function useWeather() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getWeather(DEFAULT_LOCATION.lat, DEFAULT_LOCATION.lng);
      setWeather(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load weather');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { weather, isLoading, error, refresh };
}
