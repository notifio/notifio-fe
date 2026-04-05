'use client';

import { getToken } from 'firebase/messaging';
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

      // 3. Register the SW at Firebase's expected scope and poll for activation.
      //    This is more reliable than navigator.serviceWorker.ready which can
      //    return the wrong registration when multiple SWs exist.
      const swScope = '/firebase-cloud-messaging-push-scope';
      await navigator.serviceWorker.register('/firebase-messaging-sw.js', { scope: swScope });

      let activeRegistration: ServiceWorkerRegistration | undefined;
      const deadline = Date.now() + 15_000;
      while (Date.now() < deadline) {
        const reg = await navigator.serviceWorker.getRegistration(swScope);
        if (reg?.active) {
          activeRegistration = reg;
          break;
        }
        await new Promise<void>((r) => setTimeout(r, 200));
      }
      if (!activeRegistration) {
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
