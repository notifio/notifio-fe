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

      // DEBUG: inspect registration before passing to Firebase
      console.log('[web-push] SW registration:', activeRegistration);
      console.log('[web-push] SW scope:', activeRegistration.scope);
      console.log('[web-push] SW active:', activeRegistration.active?.state);
      console.log('[web-push] SW pushManager:', activeRegistration.pushManager);
      console.log('[web-push] pushManager.getSubscription type:', typeof activeRegistration.pushManager?.getSubscription);

      // Try to manually subscribe to push BEFORE Firebase does its thing
      // — this also confirms the SW + pushManager are working
      try {
        const existingSub = await activeRegistration.pushManager.getSubscription();
        console.log('[web-push] Existing subscription:', existingSub);
      } catch (e) {
        console.error('[web-push] getSubscription failed:', e);
      }

      // 4. Get FCM token using the fully activated registration
      const messaging = await getFirebaseMessaging();
      if (!messaging) {
        throw new Error('Prehliadač nepodporuje push notifikácie');
      }
      console.log('[web-push] Calling getToken with vapidKey length:', VAPID_KEY.length);
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
