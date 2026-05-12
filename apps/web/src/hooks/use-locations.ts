'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

import type {
  CreateLocationBody,
  UpdateLocationBody,
  UserLocationsResponse,
} from '@notifio/api-client';

import { api } from '@/lib/api';

const LOCATIONS_QUERY_KEY = ['locations'] as const;

export function useLocations() {
  const queryClient = useQueryClient();
  const query = useQuery<UserLocationsResponse>({
    queryKey: LOCATIONS_QUERY_KEY,
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

  const toggleMute = useCallback(
    async (locationId: string) => {
      const previous = queryClient.getQueryData<UserLocationsResponse>(LOCATIONS_QUERY_KEY);
      const current = previous?.locations.find((l) => l.locationId === locationId);
      if (!current) return;
      const next = !current.muted;

      queryClient.setQueryData<UserLocationsResponse>(LOCATIONS_QUERY_KEY, (data) =>
        data
          ? {
              ...data,
              locations: data.locations.map((l) =>
                l.locationId === locationId ? { ...l, muted: next } : l,
              ),
            }
          : data,
      );

      try {
        await api.updateLocation(locationId, { muted: next });
      } catch (err) {
        if (previous) queryClient.setQueryData(LOCATIONS_QUERY_KEY, previous);
        throw err;
      }
    },
    [queryClient],
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
    toggleMute,
    refetch,
  };
}
