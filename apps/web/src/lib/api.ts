import { ApiError, createNotifioClient } from '@notifio/api-client';

import { createClient } from '@/lib/supabase/client';

// Single instance — avoids per-call allocation.
// Token is validated server-side by authResolve middleware, not here.
const supabase = createClient();

function getLocale(): string {
  const match = document.cookie.match(/(?:^|;\s*)locale=([^;]*)/);
  return match?.[1] ?? 'sk';
}

/**
 * Custom event dispatched when the API returns a consent-required response.
 * The ConsentGate component listens for this and re-shows the consent modal.
 */
export const CONSENT_REQUIRED_EVENT = 'notifio:consent-required';

/**
 * Custom event dispatched on 429 rate-limit responses.
 * Carries `detail.seconds` (Retry-After value).
 */
export const RATE_LIMITED_EVENT = 'notifio:rate-limited';

function dispatchConsentRequired() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(CONSENT_REQUIRED_EVENT));
  }
}

function dispatchRateLimited(seconds: number) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent(RATE_LIMITED_EVENT, { detail: { seconds } }),
    );
  }
}

// Global listener: intercept known API error statuses
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason;
    if (!(reason instanceof ApiError)) return;

    if (reason.status === 451) {
      dispatchConsentRequired();
    } else if (reason.status === 429) {
      // Try to parse Retry-After from the error body
      let seconds = 60;
      try {
        const parsed = JSON.parse(reason.body);
        if (typeof parsed.retryAfter === 'number') seconds = parsed.retryAfter;
      } catch {
        // fallback to default
      }
      dispatchRateLimited(seconds);
    }
  });
}

export const api = createNotifioClient({
  baseUrl: process.env.NEXT_PUBLIC_API_URL!,
  apiKey: process.env.NEXT_PUBLIC_API_KEY,
  locale: getLocale,
  getToken: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token ?? null;
  },
  onUnauthorized: () => {
    supabase.auth.signOut().then(() => {
      window.location.href = '/sign-in';
    });
  },
});
