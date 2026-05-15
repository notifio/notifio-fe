import { createNotifioClient } from '@notifio/api-client';
import { handleApiError } from '@notifio/shared/api';

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

// Global listener: intercept known API error statuses. Classification is
// shared (`@notifio/shared/api`); web wires the platform-specific sinks
// here. CustomEvent shapes are preserved exactly so existing listeners
// (ConsentGate, ApiErrorToaster) keep working unchanged.
//
// PLATFORM-SPECIFIC: `unhandledrejection` is the idiomatic browser-side
// hook — it catches every rejected Promise on the task queue, including
// errors thrown outside direct `api.x()` callsites. Mobile can't rely
// on this (RN's Hermes runtime doesn't reliably fire it), so mobile
// wraps `api` in a Proxy instead. Same goal, different mechanism.
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    handleApiError(event.reason, {
      onConsentRequired: dispatchConsentRequired,
      onRateLimited: (retryAfter) => dispatchRateLimited(retryAfter ?? 60),
    });
  });
}

export const api = createNotifioClient({
  baseUrl: process.env.NEXT_PUBLIC_API_URL!,
  apiKey: process.env.NEXT_PUBLIC_API_KEY,
  locale: getLocale,
  getToken: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return null;
    // Proactively refresh if the access token expires in <60s. Mirrors
    // mobile's race-prevention: requests fired right after a tab wake /
    // SSR-to-CSR handoff otherwise race the token expiry and surface
    // as 401 with a still-valid refresh token in hand.
    const expiresAtMs = (session.expires_at ?? 0) * 1000;
    if (expiresAtMs - Date.now() < 60_000) {
      const { data, error } = await supabase.auth.refreshSession();
      if (error) return null;
      return data.session?.access_token ?? null;
    }
    return session.access_token;
  },
  onUnauthorized: async () => {
    // Try to refresh first; only sign out + redirect on genuine
    // refresh failure. Previous implementation signed out
    // unconditionally, destroying recoverable sessions.
    const { data, error } = await supabase.auth.refreshSession();
    if (error || !data.session) {
      await supabase.auth.signOut();
      window.location.href = '/sign-in';
      return false;
    }
    return true;
  },
});
