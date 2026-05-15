// Keep in sync with `useWebPush` (apps/web/src/hooks/use-web-push.ts) and
// `error-reporter.ts` — they all read/write the same underscore-keyed entry.
// The id is set by `POST /devices/register`; until that has happened there
// is no row in `d_device` to satisfy the `f_app_session.key_device` FK,
// and `/analytics/session/start` returns 404 ("Device not registered").
const REGISTERED_DEVICE_ID_KEY = 'notifio_device_id';

/**
 * Returns the BE-registered device id from localStorage, or null if push
 * registration has not happened yet. Use this when calling endpoints that
 * require a `d_device` row to exist (e.g. /analytics/session/start).
 *
 * Callers should silently no-op on null — the registration flow lives in
 * `useWebPush` and runs when the user enables notifications.
 */
export function getRegisteredDeviceId(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(REGISTERED_DEVICE_ID_KEY);
  } catch {
    return null;
  }
}
