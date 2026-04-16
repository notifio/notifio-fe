'use client';

import { useCallback, useEffect, useState } from 'react';

import type {
  UserLocation,
  UserLocationsResponse,
  CreateLocationBody,
  UpdateLocationBody,
} from '@notifio/api-client';

import { api } from '@/lib/api';

interface UseLocationsResult {
  locations: UserLocation[];
  limit: number;
  used: number;
  isLoading: boolean;
  error: string | null;
  create: (body: CreateLocationBody) => Promise<UserLocation>;
  update: (locationId: string, body: UpdateLocationBody) => Promise<UserLocation>;
  remove: (locationId: string) => Promise<void>;
  refetch: () => Promise<void>;
}

export function useLocations(): UseLocationsResult {
  const [data, setData] = useState<UserLocationsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLocations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getLocations();
      setData(res);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load locations';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLocations();
  }, [fetchLocations]);

  const create = useCallback(async (body: CreateLocationBody) => {
    const created = await api.createLocation(body);
    await fetchLocations();
    return created;
  }, [fetchLocations]);

  const update = useCallback(async (locationId: string, body: UpdateLocationBody) => {
    const updated = await api.updateLocation(locationId, body);
    setData((prev) =>
      prev
        ? {
            ...prev,
            locations: prev.locations.map((l) =>
              l.locationId === locationId ? updated : l,
            ),
          }
        : prev,
    );
    return updated;
  }, []);

  const remove = useCallback(async (locationId: string) => {
    await api.deleteLocation(locationId);
    setData((prev) =>
      prev
        ? {
            ...prev,
            locations: prev.locations.filter((l) => l.locationId !== locationId),
            used: prev.used - 1,
          }
        : prev,
    );
  }, []);

  return {
    locations: data?.locations ?? [],
    limit: data?.limit ?? 1,
    used: data?.used ?? 0,
    isLoading: loading,
    error,
    create,
    update,
    remove,
    refetch: fetchLocations,
  };
}
