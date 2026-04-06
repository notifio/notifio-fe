'use client';

import { onMessage } from 'firebase/messaging';
import { useEffect, useRef } from 'react';

import { useSupabaseUser } from '@/hooks/use-supabase-user';
import { api } from '@/lib/api';
import { getFirebaseMessaging, requestWebPushToken } from '@/lib/firebase';

const VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY ?? '';

export function NotificationInitializer() {
  const { user } = useSupabaseUser();
  const registeredRef = useRef(false);

  useEffect(() => {
    if (!user || registeredRef.current) return;

    let unsubMessage: (() => void) | null = null;

    async function init() {
      const token = await requestWebPushToken(VAPID_KEY);
      if (!token) return;

      try {
        await api.registerDevice({ fcmToken: token, platform: 'web' });
        registeredRef.current = true;
      } catch {
        return;
      }

      const messaging = await getFirebaseMessaging();
      if (!messaging) return;

      unsubMessage = onMessage(messaging, (payload) => {
        const data = payload.data ?? {};
        const title = data.title ?? 'Notifio';
        const body = data.body ?? '';

        if (Notification.permission === 'granted') {
          new Notification(title, {
            body,
            icon: '/icons/notifio-192.png',
          });
        }
      });
    }

    init();

    return () => {
      unsubMessage?.();
    };
  }, [user]);

  return null;
}
