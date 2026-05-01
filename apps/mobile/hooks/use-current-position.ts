import * as Location from 'expo-location';
import { useCallback, useEffect, useState } from 'react';

/**
 * One-shot current-position hook for UI display.
 *
 * The Locations screen now has two sections (LOC-2): a live "current
 * position" block on top, and the saved-locations list below. This
 * hook backs the top block with a single permission check + one
 * `getCurrentPositionAsync` call. It is NOT a tracker — for active
 * push targeting see `useGeolocationTracker`. Calling `refresh()`
 * re-asks for the current fix.
 */

export type PositionStatus = 'idle' | 'requesting' | 'denied' | 'unavailable' | 'ready';

export interface CurrentPosition {
  lat: number;
  lng: number;
  /** Horizontal accuracy in meters (Expo provides null when unknown). */
  accuracyM: number | null;
  /** When the fix was acquired. */
  capturedAt: Date;
}

interface UseCurrentPositionResult {
  position: CurrentPosition | null;
  status: PositionStatus;
  refresh: () => Promise<void>;
}

export function useCurrentPosition(): UseCurrentPositionResult {
  const [position, setPosition] = useState<CurrentPosition | null>(null);
  const [status, setStatus] = useState<PositionStatus>('idle');

  const refresh = useCallback(async () => {
    setStatus('requesting');
    try {
      const { status: permissionStatus } = await Location.getForegroundPermissionsAsync();
      let granted = permissionStatus === 'granted';
      if (!granted) {
        const req = await Location.requestForegroundPermissionsAsync();
        granted = req.status === 'granted';
      }
      if (!granted) {
        setStatus('denied');
        return;
      }

      const fix = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      setPosition({
        lat: fix.coords.latitude,
        lng: fix.coords.longitude,
        accuracyM: fix.coords.accuracy,
        capturedAt: new Date(fix.timestamp),
      });
      setStatus('ready');
    } catch {
      // Most common: location services off, no last-known fix, or
      // hardware unavailable. Keep it soft — the UI shows the
      // "unavailable" state with a manual retry.
      setStatus('unavailable');
    }
  }, []);

  useEffect(() => {
    // Fire once on mount; the user can retry via the refresh button.
    void refresh();
  }, [refresh]);

  return { position, status, refresh };
}
