import { useCallback, useEffect, useState } from 'react';

import type { PollenResponse } from '@notifio/api-client';

import { api } from '../lib/api';
import { DEFAULT_LOCATION } from '../lib/location';

interface UsePollenResult {
  pollen: PollenResponse | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function usePollen(): UsePollenResult {
  const [pollen, setPollen] = useState<PollenResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getPollen(DEFAULT_LOCATION.lat, DEFAULT_LOCATION.lng);
      setPollen(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load pollen data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { pollen, isLoading, error, refetch: fetch };
}
