'use client';

import type { WeatherWarning } from '@notifio/api-client';

import { api } from '@/lib/api';

import { useApiQuery } from './use-api-query';

export function useWeatherWarnings(center: { lat: number; lng: number } | null) {
  const lat = center?.lat ?? 0;
  const lng = center?.lng ?? 0;

  const { data, isLoading } = useApiQuery<WeatherWarning[]>(
    () => api.getWeatherWarnings(lat, lng),
    [lat, lng],
    { enabled: center !== null },
  );

  return { warnings: data ?? [], isLoading };
}
