import { useCallback, useEffect, useState } from 'react';

import type { WeatherWarning } from '@notifio/api-client';

import { api } from '../lib/api';

interface Coords {
  lat: number;
  lng: number;
}

export function useWeatherWarnings(location: Coords | null) {
  const [warnings, setWarnings] = useState<WeatherWarning[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const refresh = useCallback(async (coords: Coords) => {
    setIsLoading(true);
    try {
      const data = await api.getWeatherWarnings(coords.lat, coords.lng);
      setWarnings(data);
    } catch (err) {
      console.error('[useWeatherWarnings] fetch failed:', err);
      setWarnings([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (location) refresh(location);
  }, [location, refresh]);

  return { warnings, isLoading };
}
