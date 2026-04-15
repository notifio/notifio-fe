'use client';

import { useEffect, useState } from 'react';

const DEVICE_ID_KEY = 'notifio_device_id';
const FCM_TOKEN_KEY = 'notifio_fcm_token';

interface PermissionStatus {
  pushGranted: boolean;
  pushDenied: boolean;
  geoGranted: boolean;
  geoDenied: boolean;
  /** True while checking permissions */
  loading: boolean;
  /** True if both push and geo are fully set up */
  fullyConfigured: boolean;
  /** True if neither push nor geo is set up */
  nothingConfigured: boolean;
}

export function usePermissionStatus(): PermissionStatus {
  const [status, setStatus] = useState<PermissionStatus>({
    pushGranted: false,
    pushDenied: false,
    geoGranted: false,
    geoDenied: false,
    loading: true,
    fullyConfigured: false,
    nothingConfigured: false,
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const hasDevice = localStorage.getItem(DEVICE_ID_KEY) !== null;
    const hasToken = localStorage.getItem(FCM_TOKEN_KEY) !== null;
    const notifPerm = 'Notification' in window ? Notification.permission : 'default';
    const pushGranted = hasDevice && hasToken && notifPerm === 'granted';
    const pushDenied = notifPerm === 'denied';

    let cancelled = false;

    const check = async () => {
      let geoGranted = false;
      let geoDenied = false;
      if ('permissions' in navigator) {
        try {
          const result = await navigator.permissions.query({
            name: 'geolocation' as PermissionName,
          });
          geoGranted = result.state === 'granted';
          geoDenied = result.state === 'denied';
        } catch {
          // Safari may throw — ignore
        }
      }
      if (!cancelled) {
        setStatus({
          pushGranted,
          pushDenied,
          geoGranted,
          geoDenied,
          loading: false,
          fullyConfigured: pushGranted && geoGranted,
          nothingConfigured: !pushGranted && !geoGranted,
        });
      }
    };

    void check();

    return () => {
      cancelled = true;
    };
  }, []);

  return status;
}
