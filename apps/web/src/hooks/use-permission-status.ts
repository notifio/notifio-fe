'use client';

import { useEffect, useState } from 'react';

import { detectPushSupport, type PushUnsupportedReason } from '@/lib/push-support';

const DEVICE_ID_KEY = 'notifio_device_id';
const FCM_TOKEN_KEY = 'notifio_fcm_token';

interface PermissionStatus {
  pushGranted: boolean;
  pushDenied: boolean;
  /**
   * True when the current runtime can actually use Web Push. False on iOS
   * Safari outside a PWA install — UI should suppress "enable push" CTAs and
   * either hide the prompt entirely or surface an "Add to Home Screen" hint.
   */
  pushSupported: boolean;
  pushUnsupportedReason?: PushUnsupportedReason;
  geoGranted: boolean;
  geoDenied: boolean;
  /** True while checking permissions */
  loading: boolean;
  /** True if both push and geo are fully set up (or push is unsupported and geo is granted) */
  fullyConfigured: boolean;
  /** True if neither push nor geo is set up (push only counts when supported) */
  nothingConfigured: boolean;
}

export function usePermissionStatus(): PermissionStatus {
  const [status, setStatus] = useState<PermissionStatus>({
    pushGranted: false,
    pushDenied: false,
    pushSupported: true,
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
    const pushSupport = detectPushSupport();

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
        // When push is unsupported (iOS Safari outside PWA), treat it as a
        // non-issue for the "fully configured" / "nothing configured" flags
        // so the warning banner doesn't badger the user about a permission
        // they have no way to grant.
        const pushOk = pushSupport.supported ? pushGranted : true;
        setStatus({
          pushGranted,
          pushDenied,
          pushSupported: pushSupport.supported,
          pushUnsupportedReason: pushSupport.reason,
          geoGranted,
          geoDenied,
          loading: false,
          fullyConfigured: pushOk && geoGranted,
          nothingConfigured: !pushOk && !geoGranted,
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
