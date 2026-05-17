import { useQuery } from '@tanstack/react-query';

import type { RadarConfig } from '@notifio/api-client';

import { api } from '../lib/api';

export function useRadarConfig() {
  const query = useQuery<RadarConfig>({
    queryKey: ['radar-config'],
    queryFn: () => api.getRadarConfig(),
    staleTime: 5 * 60_000,
    refetchInterval: (q) =>
      q.state.data ? q.state.data.refreshIntervalSec * 1000 : false,
  });

  return {
    config: query.data ?? null,
    isLoading: query.isPending,
    isError: query.isError,
  };
}
