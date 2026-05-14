import { useEffect } from 'react';

import { DEFAULT_LOCATION } from '@notifio/shared/geo';

import { useCurrentPosition } from './use-current-position';
import { useLocations } from './use-locations';

export interface ResolvedLocation {
  lat: number;
  lng: number;
  source: 'gps' | 'saved' | 'default';
  label: string | null;
}

interface UseResolvedLocationResult {
  location: ResolvedLocation;
  isResolving: boolean;
}

/**
 * Resolution chain for the dashboard's "near me" context:
 *   1. GPS fix from useCurrentPosition (one-shot foreground permission)
 *   2. First saved location (useLocations)
 *   3. DEFAULT_LOCATION (Bratislava)
 *
 * GPS prompt fires on mount; deny/unavailable falls through to the next
 * tier silently. Caller never gets a null location.
 */
export function useResolvedLocation(): UseResolvedLocationResult {
  const { position, status, refresh } = useCurrentPosition();
  const { locations } = useLocations();

  useEffect(() => {
    if (status === 'idle') {
      void refresh();
    }
  }, [status, refresh]);

  if (position && status === 'ready') {
    return {
      location: {
        lat: position.lat,
        lng: position.lng,
        source: 'gps',
        label: position.label,
      },
      isResolving: false,
    };
  }

  const firstSaved = locations[0];
  if (firstSaved) {
    return {
      location: {
        lat: firstSaved.lat,
        lng: firstSaved.lng,
        source: 'saved',
        label: firstSaved.customLabel ?? firstSaved.label.name,
      },
      isResolving: false,
    };
  }

  return {
    location: {
      lat: DEFAULT_LOCATION.lat,
      lng: DEFAULT_LOCATION.lng,
      source: 'default',
      label: DEFAULT_LOCATION.label,
    },
    isResolving: status === 'requesting',
  };
}
