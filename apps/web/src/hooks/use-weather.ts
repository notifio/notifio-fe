'use client';

import { useQuery } from '@tanstack/react-query';

import type { WeatherData } from '@notifio/shared';
import { DEFAULT_LOCATION } from '@notifio/shared/geo';

import { api } from '@/lib/api';

/**
 * Pilot React Query migration (C-PREP-4 Stage 3). Replaces the prior
 * `useApiQuery` shim with a direct `useQuery` call. Same return shape
 * so callers don't change. Locale-driven refetch now flows through the
 * `LocaleInvalidator` mounted in `components/providers.tsx`.
 *
 * `queryKey` includes the coordinates so the cache stays correct if
 * `DEFAULT_LOCATION` ever becomes user-driven (today it's a fixed
 * Bratislava constant).
 */
export function useWeather() {
  const query = useQuery<WeatherData>({
    queryKey: ['weather', DEFAULT_LOCATION.lat, DEFAULT_LOCATION.lng],
    queryFn: () => api.getWeather(DEFAULT_LOCATION.lat, DEFAULT_LOCATION.lng),
  });

  return {
    weather: query.data ?? null,
    isLoading: query.isPending,
    error: query.error ? (query.error.message || 'Failed to load weather') : null,
    refresh: async () => {
      await query.refetch();
    },
  };
}
