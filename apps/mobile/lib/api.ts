import { createNotifioClient } from '@notifio/api-client';
import { handleApiError } from '@notifio/shared/api';

import i18n from './i18n';
import { supabase } from './supabase';
import { showToast } from './toast';

const rawApi = createNotifioClient({
  baseUrl: process.env.EXPO_PUBLIC_API_URL!,
  apiKey: process.env.EXPO_PUBLIC_API_KEY,
  // Read locale lazily on every request so it tracks i18next state.
  // Without this the BE never received `Accept-Language`, served the
  // SK default for everything (event titles, type names, materiality
  // labels), and users picking DE/CS/HU/UK/EN saw Slovak content
  // regardless. Web's `apps/web/src/lib/api.ts` has had the same wiring
  // since PR3; the mobile callsite was missed.
  locale: () => i18n.language || 'sk',
  getToken: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token ?? null;
  },
  onUnauthorized: () => {
    supabase.auth.signOut();
  },
});

// Module-level callback for 451 consent-required responses.
// ConsentProvider registers its handler on mount.
let onConsentRequired: (() => void) | null = null;

export function setConsentRequiredHandler(handler: (() => void) | null): void {
  onConsentRequired = handler;
}

// Proxy wraps every method to intercept errors after they're thrown,
// show global toasts, then re-throw so callers can still handle per-call.
// Classification (451/429) is shared (`@notifio/shared/api`); mobile wires
// the platform-specific sinks here — i18n-resolved toast strings + the
// deferred consent-required handler that ConsentProvider registers via
// `setConsentRequiredHandler` on mount.
export const api = new Proxy(rawApi, {
  get(target, prop, receiver) {
    const value = Reflect.get(target, prop, receiver);
    if (typeof value !== 'function') return value;
    return async (...args: unknown[]) => {
      try {
        return await (value as (...a: unknown[]) => Promise<unknown>).apply(target, args);
      } catch (error) {
        handleApiError(error, {
          onConsentRequired: () => onConsentRequired?.(),
          onRateLimited: (retryAfter) => {
            const title = i18n.t('toast.rateLimitTitle');
            const message = retryAfter !== null
              ? i18n.t('toast.rateLimitMessage', { seconds: retryAfter })
              : i18n.t('toast.rateLimitMessageGeneric');
            showToast.warning(title, message);
          },
        });
        throw error;
      }
    };
  },
}) as typeof rawApi;
