import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { CreateLocationBody, UpdateLocationBody, UserLocation, UserLocationsResponse } from '@notifio/api-client';

import { api } from '../lib/api';
import { extractApiErrorMessage } from '../lib/api-error';
import { showToast } from '../lib/toast';

interface UseLocationsResult {
  locations: UserLocation[];
  limit: number;
  used: number;
  isLoading: boolean;
  error: string | null;
  canAddMore: boolean;
  refetch: () => Promise<void>;
  addLocation: (data: CreateLocationBody) => Promise<boolean>;
  updateLocation: (id: string, data: UpdateLocationBody) => Promise<boolean>;
  removeLocation: (id: string) => Promise<boolean>;
}

export function useLocations(): UseLocationsResult {
  const { t } = useTranslation();
  const [data, setData] = useState<UserLocationsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.getLocations();
      setData(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load locations');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  // LOC-1: surface the BE's `error` string instead of a generic toast.
  // The previous catch-all swallowed "Location limit reached (1)" /
  // "Custom labels require a higher membership tier" / validation
  // errors — users could only see a vague "failed to save" message.
  const addLocation = useCallback(
    async (body: CreateLocationBody): Promise<boolean> => {
      try {
        await api.createLocation(body);
        await fetch();
        showToast.success(t('locations.saved'));
        return true;
      } catch (err) {
        showToast.error(extractApiErrorMessage(err, t('locations.error')));
        return false;
      }
    },
    [fetch, t],
  );

  const updateLocation = useCallback(
    async (id: string, body: UpdateLocationBody): Promise<boolean> => {
      try {
        await api.updateLocation(id, body);
        await fetch();
        showToast.success(t('locations.updated'));
        return true;
      } catch (err) {
        showToast.error(extractApiErrorMessage(err, t('locations.error')));
        return false;
      }
    },
    [fetch, t],
  );

  const removeLocation = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        await api.deleteLocation(id);
        await fetch();
        showToast.success(t('locations.deleted'));
        return true;
      } catch (err) {
        showToast.error(extractApiErrorMessage(err, t('locations.error')));
        return false;
      }
    },
    [fetch, t],
  );

  const locations = data?.locations ?? [];
  const limit = data?.limit ?? 1;
  const used = data?.used ?? locations.length;

  return {
    locations,
    limit,
    used,
    isLoading,
    error,
    canAddMore: used < limit,
    refetch: fetch,
    addLocation,
    updateLocation,
    removeLocation,
  };
}
