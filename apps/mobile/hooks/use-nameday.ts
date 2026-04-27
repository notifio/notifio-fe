import { useCallback, useEffect, useState } from 'react';

import type { NamedayResponse } from '@notifio/api-client';

import { api } from '../lib/api';
import { DEFAULT_LOCATION } from '../lib/location';

let cachedNameday: NamedayResponse | null = null;

interface UseNamedayResult {
  nameday: NamedayResponse | null;
  isLoading: boolean;
  error: string | null;
}

export function useNameday(): UseNamedayResult {
  const [nameday, setNameday] = useState<NamedayResponse | null>(cachedNameday);
  const [isLoading, setIsLoading] = useState(cachedNameday === null);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (cachedNameday) {
      setNameday(cachedNameday);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getNameday({
        lat: DEFAULT_LOCATION.lat,
        lng: DEFAULT_LOCATION.lng,
        upcoming: 1,
      });
      cachedNameday = data;
      setNameday(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load nameday');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { nameday, isLoading, error };
}
