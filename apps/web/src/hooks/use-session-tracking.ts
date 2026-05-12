'use client';

import { useEffect, useRef } from 'react';

import { api } from '@/lib/api';
import { getOrCreateDeviceId } from '@/lib/device-id';

const HEARTBEAT_MS = 5 * 60 * 1000;

export function useSessionTracking(): void {
  const sessionIdRef = useRef<string | null>(null);
  const heartbeatTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let cancelled = false;

    const clearHeartbeat = () => {
      if (heartbeatTimerRef.current) {
        clearInterval(heartbeatTimerRef.current);
        heartbeatTimerRef.current = null;
      }
    };

    const start = async () => {
      const deviceId = getOrCreateDeviceId();
      if (!deviceId) return;
      const result = await api.startSession(deviceId);
      if (cancelled || !result) return;
      sessionIdRef.current = result.sessionId;
      heartbeatTimerRef.current = setInterval(() => {
        if (sessionIdRef.current) {
          void api.sessionHeartbeat(sessionIdRef.current);
        }
      }, HEARTBEAT_MS);
    };

    const stop = (endReason: 'background' | 'user_close') => {
      clearHeartbeat();
      const id = sessionIdRef.current;
      if (!id) return;
      sessionIdRef.current = null;

      const base = process.env.NEXT_PUBLIC_API_URL;
      const url = base ? `${base}/analytics/session/${id}/end` : null;
      const payload = JSON.stringify({ endReason });

      let sent = false;
      if (url && typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
        try {
          const blob = new Blob([payload], { type: 'application/json' });
          sent = navigator.sendBeacon(url, blob);
        } catch {
          sent = false;
        }
      }
      if (!sent) {
        void api.endSession(id, endReason);
      }
    };

    const handleVisibility = () => {
      if (document.visibilityState === 'hidden' && sessionIdRef.current) {
        stop('background');
      } else if (document.visibilityState === 'visible' && !sessionIdRef.current) {
        void start();
      }
    };

    const handlePageHide = () => stop('user_close');

    void start();
    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('pagehide', handlePageHide);

    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('pagehide', handlePageHide);
      stop('user_close');
    };
  }, []);
}
