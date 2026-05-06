import { useQuery } from '@tanstack/react-query';

import { DEFAULT_LOCATION } from '@notifio/shared/geo';
import type { WeatherData } from '@notifio/shared/types';

import { api } from '../lib/api';

/**
 * Pilot React Query migration (C-PREP-3 stage 3). Same 0-arg signature
 * and return shape as the prior `useState`/`useEffect` version so
 * consumers don't change. RQ adds:
 *   - in-memory + AsyncStorage persistence (last-known data shows
 *     instantly on cold relaunch)
 *   - automatic stale/fresh tracking via the global `staleTime: 5min`
 *     default in `lib/query-client.ts`
 *   - dedupe of concurrent calls with the same key
 *
 * `queryKey` is per-coords so the cache is correct if `DEFAULT_LOCATION`
 * ever becomes user-driven (today it's a fixed Bratislava constant).
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
    refresh: () => {
      void query.refetch();
    },
  };
}
