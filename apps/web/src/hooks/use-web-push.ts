'use client';

import { getToken } from 'firebase/messaging';
import { useCallback, useEffect, useState } from 'react';

import { api } from '@/lib/api';
import { getFirebaseMessaging, installFirebaseErrorSuppressor, isFirebaseConfigured, VAPID_KEY } from '@/lib/firebase';

const DEVICE_ID_KEY = 'notifio_device_id';
const FCM_TOKEN_KEY = 'notifio_fcm_token';

export type PushPermissionState = 'default' | 'granted' | 'denied' | 'unsupported' | 'unconfigured';

export interface UseWebPushResult {
  permission: PushPermissionState;
  deviceId: string | null;
  isLoading: boolean;
  error: string | null;
  enable: () => Promise<boolean>;
  disable: () => Promise<void>;
}

export function useWebPush(): UseWebPushResult {
  const [permission, setPermission] = useState<PushPermissionState>('default');
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize permission state and load persisted deviceId
  useEffect(() => {
    if (typeof window === 'undefined') return;
    installFirebaseErrorSuppressor();
    if (!isFirebaseConfigured()) {
      setPermission('unconfigured');
      return;
    }
    if (!('Notification' in window) || !('serviceWorker' in navigator)) {
      setPermission('unsupported');
      return;
    }
    setPermission(Notification.permission as PushPermissionState);
    const storedId = localStorage.getItem(DEVICE_ID_KEY);
    if (storedId) setDeviceId(storedId);
  }, []);

  // Note: foreground messages are intentionally NOT handled via onMessage()
  // here. onMessage() internally calls Firebase's SW registration logic which
  // can race with our own getToken() call. Background notifications work via
  // firebase-messaging-sw.js onBackgroundMessage() handler regardless.

  const enable = useCallback(async (): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      if (!isFirebaseConfigured()) {
        throw new Error('Firebase nie je nakonfigurovaný');
      }

      // 1. Request notification permission
      //    Don't call setPermission yet — setting React state triggers a
      //    re-render which can cause useEffects to race with getToken().
      const result = await Notification.requestPermission();
      if (result !== 'granted') {
        setPermission(result as PushPermissionState);
        return false;
      }

      // 2. Unregister any stale firebase-messaging service workers from previous
      //    attempts (may be at wrong scope or stuck in a bad state).
      const existing = await navigator.serviceWorker.getRegistrations();
      for (const reg of existing) {
        const scriptUrl = reg.active?.scriptURL ?? reg.installing?.scriptURL ?? reg.waiting?.scriptURL ?? '';
        if (scriptUrl.includes('firebase-messaging-sw.js')) {
          await reg.unregister();
        }
      }

      // 3. Register the SW at Firebase's expected scope and wait for activation.
      const swScope = '/firebase-cloud-messaging-push-scope';
      const swRegistration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', { scope: swScope });

      // Wait for the SW to become active. We can't use navigator.serviceWorker.ready
      // because it resolves for the page's scope (/), not the Firebase scope.
      if (!swRegistration.active) {
        await new Promise<void>((resolve) => {
          const sw = swRegistration.installing ?? swRegistration.waiting;
          if (!sw) {
            resolve();
            return;
          }
          sw.addEventListener('statechange', () => {
            if (sw.state === 'activated') resolve();
          });
        });
      }

      const activeRegistration = await navigator.serviceWorker.getRegistration(swScope);
      if (!activeRegistration?.active) {
        throw new Error('Service worker sa nepodarilo aktivovať');
      }

      // 4. Get FCM token using the fully activated registration
      const messaging = await getFirebaseMessaging();
      if (!messaging) {
        throw new Error('Prehliadač nepodporuje push notifikácie');
      }
      const fcmToken = await getToken(messaging, {
        vapidKey: VAPID_KEY,
        serviceWorkerRegistration: activeRegistration,
      });
      if (!fcmToken) {
        throw new Error('Nepodarilo sa získať FCM token');
      }

      // 4. Register device on backend (or refresh token on existing device)
      const storedDeviceId = localStorage.getItem(DEVICE_ID_KEY);
      const storedToken = localStorage.getItem(FCM_TOKEN_KEY);

      if (storedDeviceId && storedToken === fcmToken) {
        // Same device, same token — nothing to do
        setDeviceId(storedDeviceId);
      } else if (storedDeviceId && storedToken !== fcmToken) {
        // Token refresh on existing device
        try {
          await api.refreshDeviceToken(storedDeviceId, fcmToken);
          localStorage.setItem(FCM_TOKEN_KEY, fcmToken);
          setDeviceId(storedDeviceId);
        } catch {
          // Device may have been deleted on BE — fall back to register
          const registered = await api.registerDevice({ platform: 'web', fcmToken });
          localStorage.setItem(DEVICE_ID_KEY, registered.deviceId);
          localStorage.setItem(FCM_TOKEN_KEY, fcmToken);
          setDeviceId(registered.deviceId);
        }
      } else {
        // Fresh registration
        const registered = await api.registerDevice({ platform: 'web', fcmToken });
        localStorage.setItem(DEVICE_ID_KEY, registered.deviceId);
        localStorage.setItem(FCM_TOKEN_KEY, fcmToken);
        setDeviceId(registered.deviceId);
      }

      // Everything succeeded — now safe to update permission state
      setPermission('granted');

      // Auto-save GPS as user location for notification targeting (non-blocking)
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          try {
            const locResponse = await api.getLocations();
            if (locResponse.locations.length === 0) {
              await api.createLocation({
                lat: pos.coords.latitude,
                lng: pos.coords.longitude,
                label: 'home',
              });
            }
          } catch {
            // Non-critical — don't block the notification flow
          }
        },
        () => { /* GPS denied/unavailable — skip */ },
        { enableHighAccuracy: false, timeout: 10_000, maximumAge: 300_000 },
      );

      return true;
    } catch (err) {
      console.error('[use-web-push] enable failed:', err);
      const msg = err instanceof Error ? err.message : 'Neznáma chyba';
      setError(msg);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const disable = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const storedDeviceId = localStorage.getItem(DEVICE_ID_KEY);
      if (storedDeviceId) {
        try {
          await api.deactivateDevice(storedDeviceId);
        } catch {
          // Ignore — might already be deactivated
        }
      }
      localStorage.removeItem(DEVICE_ID_KEY);
      localStorage.removeItem(FCM_TOKEN_KEY);
      setDeviceId(null);
    } catch (err) {
      console.error('[use-web-push] disable failed:', err);
      const msg = err instanceof Error ? err.message : 'Neznáma chyba';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { permission, deviceId, isLoading, error, enable, disable };
}
