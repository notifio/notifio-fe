'use client';

import { useQuery } from '@tanstack/react-query';

import type { PollenResponse } from '@notifio/api-client';

import { api } from '@/lib/api';

export function usePollen(location: { lat: number; lng: number } | null) {
  const lat = location?.lat ?? 0;
  const lng = location?.lng ?? 0;

  const query = useQuery<PollenResponse>({
    queryKey: ['pollen', lat, lng],
    queryFn: () => api.getPollen(lat, lng),
    enabled: location !== null,
  });

  return {
    pollen: query.data ?? null,
    isLoading: query.isPending,
    error: query.error ? (query.error.message || 'Failed to load pollen') : null,
    refresh: async () => {
      await query.refetch();
    },
  };
}
