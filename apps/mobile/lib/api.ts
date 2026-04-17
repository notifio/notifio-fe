import { ApiError, createNotifioClient } from '@notifio/api-client';

import i18n from './i18n';
import { supabase } from './supabase';
import { showToast } from './toast';

const rawApi = createNotifioClient({
  baseUrl: process.env.EXPO_PUBLIC_API_URL!,
  apiKey: process.env.EXPO_PUBLIC_API_KEY,
  getToken: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token ?? null;
  },
  onUnauthorized: () => {
    supabase.auth.signOut();
  },
});

function handleApiError(error: unknown): void {
  if (!(error instanceof ApiError)) return;

  if (error.status === 429) {
    let retrySeconds: number | null = null;
    try {
      const parsed = JSON.parse(error.body) as { retryAfter?: number };
      if (typeof parsed.retryAfter === 'number') {
        retrySeconds = parsed.retryAfter;
      }
    } catch {
      // body isn't JSON or doesn't have retryAfter
    }

    const title = i18n.t('toast.rateLimitTitle');
    const message = retrySeconds
      ? i18n.t('toast.rateLimitMessage', { seconds: retrySeconds })
      : i18n.t('toast.rateLimitMessageGeneric');

    showToast.warning(title, message);
  }
}

// Proxy wraps every method to intercept errors after they're thrown,
// show global toasts, then re-throw so callers can still handle per-call.
export const api = new Proxy(rawApi, {
  get(target, prop, receiver) {
    const value = Reflect.get(target, prop, receiver);
    if (typeof value !== 'function') return value;
    return async (...args: unknown[]) => {
      try {
        return await (value as (...a: unknown[]) => Promise<unknown>).apply(target, args);
      } catch (error) {
        handleApiError(error);
        throw error;
      }
    };
  },
}) as typeof rawApi;
