'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { api } from '@/lib/api';

const MIN_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes
const LAST_SENT_KEY = 'notifio_last_location_sent';

export type GeoPermissionState = 'prompt' | 'granted' | 'denied' | 'unsupported';

export interface UseGeolocationTrackerResult {
  permission: GeoPermissionState;
  isTracking: boolean;
  lastSentAt: number | null;
  error: string | null;
  start: () => Promise<boolean>;
  stop: () => void;
}

/**
 * Tracks GPS position via watchPosition and throttles backend calls
 * to at most one every 5 minutes. Requires a deviceId (from useWebPush).
 */
export function useGeolocationTracker(deviceId: string | null): UseGeolocationTrackerResult {
  const [permission, setPermission] = useState<GeoPermissionState>('prompt');
  const [isTracking, setIsTracking] = useState(false);
  const [lastSentAt, setLastSentAt] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const deviceIdRef = useRef<string | null>(deviceId);

  useEffect(() => {
    deviceIdRef.current = deviceId;
  }, [deviceId]);

  useEffect(() => {
    if (typeof navigator === 'undefined') return;
    if (!('geolocation' in navigator)) {
      setPermission('unsupported');
      return;
    }
    // Check current permission state
    if ('permissions' in navigator) {
      navigator.permissions.query({ name: 'geolocation' as PermissionName }).then((status) => {
        setPermission(status.state as GeoPermissionState);
        status.onchange = () => setPermission(status.state as GeoPermissionState);
      }).catch(() => {
        // Safari fallback: permission status not queryable
      });
    }
    const stored = localStorage.getItem(LAST_SENT_KEY);
    if (stored) setLastSentAt(parseInt(stored, 10));
  }, []);

  const submitLocation = useCallback(async (lat: number, lng: number): Promise<void> => {
    const id = deviceIdRef.current;
    if (!id) return;
    const now = Date.now();
    const lastSent = parseInt(localStorage.getItem(LAST_SENT_KEY) ?? '0', 10);
    if (now - lastSent < MIN_INTERVAL_MS) {
      return; // Throttled
    }
    try {
      await api.submitDeviceLocation(id, lat, lng);
      localStorage.setItem(LAST_SENT_KEY, String(now));
      setLastSentAt(now);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Neznáma chyba';
      setError(msg);
    }
  }, []);

  // Auto-restart watchPosition when returning to page with previously granted permission
  useEffect(() => {
    if (permission !== 'granted' || !deviceId || isTracking) return;
    const watchId = navigator.geolocation.watchPosition(
      (p) => { void submitLocation(p.coords.latitude, p.coords.longitude); },
      () => { /* ignore errors on auto-restart */ },
      { enableHighAccuracy: false, maximumAge: MIN_INTERVAL_MS, timeout: 30_000 },
    );
    watchIdRef.current = watchId;
    setIsTracking(true);

    return () => {
      navigator.geolocation.clearWatch(watchId);
      watchIdRef.current = null;
      setIsTracking(false);
    };
  }, [permission, deviceId, isTracking, submitLocation]);

  const start = useCallback(async (): Promise<boolean> => {
    if (!('geolocation' in navigator)) {
      setPermission('unsupported');
      return false;
    }
    setError(null);

    return new Promise<boolean>((resolve) => {
      // Request initial position to trigger permission prompt
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setPermission('granted');
          void submitLocation(pos.coords.latitude, pos.coords.longitude);

          // Start watchPosition for ongoing tracking
          const watchId = navigator.geolocation.watchPosition(
            (p) => {
              void submitLocation(p.coords.latitude, p.coords.longitude);
            },
            (err) => {
              setError(err.message);
            },
            {
              enableHighAccuracy: false,
              maximumAge: MIN_INTERVAL_MS,
              timeout: 30_000,
            },
          );
          watchIdRef.current = watchId;
          setIsTracking(true);
          resolve(true);
        },
        (err) => {
          if (err.code === err.PERMISSION_DENIED) {
            setPermission('denied');
          } else {
            setError(err.message);
          }
          resolve(false);
        },
        {
          enableHighAccuracy: false,
          maximumAge: 0,
          timeout: 30_000,
        },
      );
    });
  }, [submitLocation]);

  const stop = useCallback((): void => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setIsTracking(false);
  }, []);

  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  return { permission, isTracking, lastSentAt, error, start, stop };
}
