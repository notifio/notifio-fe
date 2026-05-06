'use client';

import { useQuery } from '@tanstack/react-query';
import { useCallback } from 'react';

import type {
  CreateLocationBody,
  UpdateLocationBody,
  UserLocationsResponse,
} from '@notifio/api-client';

import { api } from '@/lib/api';

export function useLocations() {
  const query = useQuery<UserLocationsResponse>({
    queryKey: ['locations'],
    queryFn: () => api.getLocations(),
  });

  const refetch = useCallback(async () => {
    await query.refetch();
  }, [query]);

  const create = useCallback(
    async (body: CreateLocationBody) => {
      const created = await api.createLocation(body);
      await query.refetch();
      return created;
    },
    [query],
  );

  const update = useCallback(
    async (locationId: string, body: UpdateLocationBody) => {
      const updated = await api.updateLocation(locationId, body);
      await query.refetch();
      return updated;
    },
    [query],
  );

  const remove = useCallback(
    async (locationId: string) => {
      await api.deleteLocation(locationId);
      await query.refetch();
    },
    [query],
  );

  return {
    locations: query.data?.locations ?? [],
    limit: query.data?.limit ?? 1,
    used: query.data?.used ?? 0,
    isLoading: query.isPending,
    error: query.error ? (query.error.message || 'Failed to load locations') : null,
    create,
    update,
    remove,
    refetch,
  };
}
