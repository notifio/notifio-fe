import { useQuery } from '@tanstack/react-query';

import { DEFAULT_LOCATION } from '@notifio/shared/geo';
import type { AirQualityData } from '@notifio/shared/types';

import { api } from '../lib/api';

export function useAirQuality() {
  const query = useQuery<AirQualityData>({
    queryKey: ['air-quality', DEFAULT_LOCATION.lat, DEFAULT_LOCATION.lng],
    queryFn: () => api.getAirQuality(DEFAULT_LOCATION.lat, DEFAULT_LOCATION.lng),
  });

  return {
    airQuality: query.data ?? null,
    isLoading: query.isPending,
    error: query.error ? (query.error.message || 'Failed to load air quality') : null,
    refresh: () => {
      void query.refetch();
    },
  };
}
