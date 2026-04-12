'use client';

import { useCallback, useEffect, useState } from 'react';

import type { PollenResponse } from '@notifio/api-client';

import { api } from '@/lib/api';

interface UsePollenResult {
  pollen: PollenResponse | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function usePollen(location: { lat: number; lng: number } | null): UsePollenResult {
  const [pollen, setPollen] = useState<PollenResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!location) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getPollen(location.lat, location.lng);
      setPollen(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load pollen data');
    } finally {
      setIsLoading(false);
    }
  }, [location?.lat, location?.lng]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { pollen, isLoading, error, refresh };
}
