'use client';

import type { PollenResponse } from '@notifio/api-client';

import { api } from '@/lib/api';

import { useApiQuery } from './use-api-query';

export function usePollen(location: { lat: number; lng: number } | null) {
  const lat = location?.lat ?? 0;
  const lng = location?.lng ?? 0;

  const { data: pollen, isLoading, error, refetch: refresh } = useApiQuery<PollenResponse>(
    () => api.getPollen(lat, lng),
    [lat, lng],
    { enabled: location !== null },
  );

  return { pollen, isLoading, error, refresh };
}
