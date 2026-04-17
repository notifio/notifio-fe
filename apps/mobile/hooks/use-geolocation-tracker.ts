import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { useEffect, useRef } from 'react';

import { api } from '../lib/api';
import { getStoredDeviceId } from '../services/push-notifications';

const THROTTLE_MS = 5 * 60 * 1000; // 5 minutes
const LAST_SENT_KEY = 'notifio_last_location_sent';

const LOCATION_OPTIONS: Location.LocationOptions = {
  accuracy: Location.Accuracy.Balanced,
  distanceInterval: 100,
  timeInterval: 60_000,
};

async function submitIfThrottled(lat: number, lng: number): Promise<void> {
  const deviceId = await getStoredDeviceId();
  if (!deviceId) return;

  const now = Date.now();
  const stored = await AsyncStorage.getItem(LAST_SENT_KEY);
  const lastSent = stored ? parseInt(stored, 10) : 0;
  if (now - lastSent < THROTTLE_MS) return;

  try {
    await api.submitDeviceLocation(deviceId, lat, lng);
    await AsyncStorage.setItem(LAST_SENT_KEY, String(now));
  } catch {
    // Non-critical — will retry on next position update
  }
}

/**
 * Watches foreground GPS and submits position to backend with 5-minute throttle.
 * Only active when `enabled` is true (device is registered + location granted).
 */
export function useGeolocationTracker(enabled: boolean): void {
  const subRef = useRef<Location.LocationSubscription | null>(null);

  useEffect(() => {
    if (!enabled) {
      subRef.current?.remove();
      subRef.current = null;
      return;
    }

    let cancelled = false;

    (async () => {
      const { status } = await Location.getForegroundPermissionsAsync();
      if (status !== 'granted' || cancelled) return;

      const sub = await Location.watchPositionAsync(LOCATION_OPTIONS, (loc) => {
        submitIfThrottled(loc.coords.latitude, loc.coords.longitude);
      });

      if (cancelled) {
        sub.remove();
        return;
      }
      subRef.current = sub;
    })();

    return () => {
      cancelled = true;
      subRef.current?.remove();
      subRef.current = null;
    };
  }, [enabled]);
}
