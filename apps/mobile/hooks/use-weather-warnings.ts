import { useQuery } from '@tanstack/react-query';

import type { WeatherWarning } from '@notifio/api-client';

import { api } from '../lib/api';

export function useWeatherWarnings(center: { lat: number; lng: number } | null) {
  const lat = center?.lat ?? 0;
  const lng = center?.lng ?? 0;
  const query = useQuery<WeatherWarning[]>({
    queryKey: ['weather-warnings', lat, lng],
    queryFn: () => api.getWeatherWarnings(lat, lng),
    enabled: center !== null,
  });
  return {
    warnings: query.data ?? [],
    isLoading: query.isPending,
  };
}
