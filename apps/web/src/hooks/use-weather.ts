'use client';

import type { WeatherData } from '@notifio/shared';
import { DEFAULT_LOCATION } from '@notifio/shared/geo';

import { api } from '@/lib/api';

import { useApiQuery } from './use-api-query';

export function useWeather() {
  const { data: weather, isLoading, error, refetch: refresh } = useApiQuery<WeatherData>(
    () => api.getWeather(DEFAULT_LOCATION.lat, DEFAULT_LOCATION.lng),
    [],
  );

  return { weather, isLoading, error, refresh };
}
