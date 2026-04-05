'use client';

import { getToken, onMessage } from 'firebase/messaging';
import { useCallback, useEffect, useState } from 'react';

import { api } from '@/lib/api';
import { getFirebaseMessaging, isFirebaseConfigured, VAPID_KEY } from '@/lib/firebase';

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

  // Foreground message handler
  useEffect(() => {
    if (permission !== 'granted') return;
    let unsub: (() => void) | null = null;

    (async () => {
      const messaging = await getFirebaseMessaging();
      if (!messaging) return;
      unsub = onMessage(messaging, (payload) => {
        // Show in-app toast/notification for foreground messages
        const title = payload.notification?.title || payload.data?.['title'] || 'Notifio';
        const body = payload.notification?.body || payload.data?.['body'] || '';
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(title, { body, icon: '/icon-192.png' });
        }
      });
    })();

    return () => {
      unsub?.();
    };
  }, [permission]);

  const enable = useCallback(async (): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      if (!isFirebaseConfigured()) {
        throw new Error('Firebase nie je nakonfigurovaný');
      }

      // 1. Request notification permission
      const result = await Notification.requestPermission();
      setPermission(result as PushPermissionState);
      if (result !== 'granted') {
        return false;
      }

      // 2. Register the service worker at Firebase's expected scope,
      //    then WAIT for it to fully activate (avoids race condition where
      //    registration.pushManager is undefined on first-time registration).
      const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
        scope: '/firebase-cloud-messaging-push-scope',
      });

      // Wait for the SW to reach 'activated' state before passing it to Firebase
      if (registration.installing || registration.waiting) {
        const worker = registration.installing ?? registration.waiting;
        await new Promise<void>((resolve) => {
          worker!.addEventListener('statechange', function onStateChange() {
            if (worker!.state === 'activated') {
              worker!.removeEventListener('statechange', onStateChange);
              resolve();
            }
          });
        });
      }

      // 3. Get FCM token
      const messaging = await getFirebaseMessaging();
      if (!messaging) {
        throw new Error('Prehliadač nepodporuje push notifikácie');
      }
      const fcmToken = await getToken(messaging, {
        vapidKey: VAPID_KEY,
        serviceWorkerRegistration: registration,
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

      return true;
    } catch (err) {
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
      const msg = err instanceof Error ? err.message : 'Neznáma chyba';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { permission, deviceId, isLoading, error, enable, disable };
}
