import { useCallback, useEffect, useState } from 'react';

import type { AirQualityData } from '@notifio/shared/types';

import { api } from '../lib/api';
import { DEFAULT_LOCATION } from '../lib/location';

export function useAirQuality() {
  const [airQuality, setAirQuality] = useState<AirQualityData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getAirQuality(DEFAULT_LOCATION.lat, DEFAULT_LOCATION.lon);
      setAirQuality(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load air quality');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { airQuality, isLoading, error, refresh };
}
