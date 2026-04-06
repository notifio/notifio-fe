import { useCallback, useEffect, useState } from 'react';

import type { UserPreferencesResponse, UpdatePreferencesRequest } from '@notifio/api-client';

import { api } from '../lib/api';

interface UsePreferencesResult {
  preferences: UserPreferencesResponse | null;
  isLoading: boolean;
  error: string | null;
  updatePreferences: (data: UpdatePreferencesRequest) => Promise<void>;
  refresh: () => void;
}

export function usePreferences(): UsePreferencesResult {
  const [preferences, setPreferences] = useState<UserPreferencesResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getPreferences();
      setPreferences(data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load preferences';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const updatePreferences = useCallback(async (data: UpdatePreferencesRequest) => {
    try {
      const updated = await api.updatePreferences(data);
      setPreferences(updated);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to update preferences';
      setError(msg);
    }
  }, []);

  return { preferences, isLoading, error, updatePreferences, refresh: fetch };
}
