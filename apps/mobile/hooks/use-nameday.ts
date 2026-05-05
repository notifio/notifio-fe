import { useQuery } from '@tanstack/react-query';

import type { NamedayResponse } from '@notifio/api-client';
import { DEFAULT_LOCATION } from '@notifio/shared/geo';

import { api } from '../lib/api';

interface UseNamedayResult {
  nameday: NamedayResponse | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * Fetches today + N upcoming nameday entries. Previously cached in a
 * module-level `cachedNameday` variable to dedupe across remounts; React
 * Query's in-memory + AsyncStorage cache replaces that pattern with no
 * loss of behaviour.
 */
export function useNameday(): UseNamedayResult {
  const query = useQuery<NamedayResponse>({
    queryKey: ['nameday', DEFAULT_LOCATION.lat, DEFAULT_LOCATION.lng],
    queryFn: () =>
      api.getNameday({
        lat: DEFAULT_LOCATION.lat,
        lng: DEFAULT_LOCATION.lng,
        upcoming: 1,
      }),
  });

  return {
    nameday: query.data ?? null,
    isLoading: query.isPending,
    error: query.error ? (query.error.message || 'Failed to load nameday') : null,
  };
}
