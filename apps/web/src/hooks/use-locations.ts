'use client';

import { useCallback } from 'react';

import type {
  UserLocationsResponse,
  CreateLocationBody,
  UpdateLocationBody,
} from '@notifio/api-client';

import { api } from '@/lib/api';

import { useApiQuery } from './use-api-query';

export function useLocations() {
  const { data, isLoading, error, refetch } = useApiQuery<UserLocationsResponse>(
    () => api.getLocations(),
    [],
  );

  const create = useCallback(async (body: CreateLocationBody) => {
    const created = await api.createLocation(body);
    await refetch();
    return created;
  }, [refetch]);

  const update = useCallback(async (locationId: string, body: UpdateLocationBody) => {
    const updated = await api.updateLocation(locationId, body);
    await refetch();
    return updated;
  }, [refetch]);

  const remove = useCallback(async (locationId: string) => {
    await api.deleteLocation(locationId);
    await refetch();
  }, [refetch]);

  return {
    locations: data?.locations ?? [],
    limit: data?.limit ?? 1,
    used: data?.used ?? 0,
    isLoading,
    error,
    create,
    update,
    remove,
    refetch,
  };
}
