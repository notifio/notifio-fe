'use client';

import type { AirQualityData } from '@notifio/shared';

import { api } from '@/lib/api';
import { DEFAULT_LOCATION } from '@/lib/location';

import { useApiQuery } from './use-api-query';

export function useAirQuality() {
  const { data: airQuality, isLoading, error, refetch: refresh } = useApiQuery<AirQualityData>(
    () => api.getAirQuality(DEFAULT_LOCATION.lat, DEFAULT_LOCATION.lng),
    [],
  );

  return { airQuality, isLoading, error, refresh };
}
