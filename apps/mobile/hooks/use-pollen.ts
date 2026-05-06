import { useQuery } from '@tanstack/react-query';

import type { PollenResponse } from '@notifio/api-client';
import { DEFAULT_LOCATION } from '@notifio/shared/geo';

import { api } from '../lib/api';

interface UsePollenResult {
  pollen: PollenResponse | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function usePollen(): UsePollenResult {
  const query = useQuery<PollenResponse>({
    queryKey: ['pollen', DEFAULT_LOCATION.lat, DEFAULT_LOCATION.lng],
    queryFn: () => api.getPollen(DEFAULT_LOCATION.lat, DEFAULT_LOCATION.lng),
  });

  return {
    pollen: query.data ?? null,
    isLoading: query.isPending,
    error: query.error ? (query.error.message || 'Failed to load pollen data') : null,
    refetch: () => {
      void query.refetch();
    },
  };
}
