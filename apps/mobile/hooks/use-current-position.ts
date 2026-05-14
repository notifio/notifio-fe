import AsyncStorage from '@react-native-async-storage/async-storage';
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
  /**
   * Reverse-geocoded human-readable city/region name. `null` while
   * resolving, on geocoder failure, or when the OS returns no result.
   * Quantized-coord cached in AsyncStorage so a re-mount in the same
   * neighbourhood avoids re-hitting the geocoder.
   */
  label: string | null;
}

interface UseCurrentPositionResult {
  position: CurrentPosition | null;
  status: PositionStatus;
  refresh: () => Promise<void>;
}

const GEOCODE_CACHE_PREFIX = 'geocode:';

function geocodeCacheKey(lat: number, lng: number): string {
  // 3 decimals ≈ 111 m precision — fine for city-level reverse lookup.
  return `${GEOCODE_CACHE_PREFIX}${lat.toFixed(3)},${lng.toFixed(3)}`;
}

async function resolveLabel(lat: number, lng: number): Promise<string | null> {
  const key = geocodeCacheKey(lat, lng);
  try {
    const cached = await AsyncStorage.getItem(key);
    if (cached) return cached;
  } catch {
    // Cache miss is fine — fall through to geocoder.
  }
  try {
    const results = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
    const addr = results[0];
    const resolved = addr?.city ?? addr?.subregion ?? addr?.region ?? null;
    if (resolved) {
      void AsyncStorage.setItem(key, resolved).catch(() => undefined);
    }
    return resolved;
  } catch {
    return null;
  }
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
      const lat = fix.coords.latitude;
      const lng = fix.coords.longitude;
      setPosition({
        lat,
        lng,
        accuracyM: fix.coords.accuracy,
        capturedAt: new Date(fix.timestamp),
        label: null,
      });
      setStatus('ready');

      // Fire-and-forget reverse-geocode; updates label once it returns.
      void resolveLabel(lat, lng).then((label) => {
        setPosition((prev) =>
          prev && prev.lat === lat && prev.lng === lng ? { ...prev, label } : prev,
        );
      });
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
