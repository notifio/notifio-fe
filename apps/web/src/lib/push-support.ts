/**
 * Web Push capability detection.
 *
 * iOS Safari (since 16.4) supports Web Push, but only when the page is
 * launched from a PWA installed via "Add to Home Screen" — never inside
 * a regular Safari tab. From a tab, `Notification` and `serviceWorker`
 * both exist, so the existing `'Notification' in window` check passes,
 * yet `Notification.requestPermission()` ultimately resolves to
 * `'denied'` without any prompt UI. Surfacing that as a generic
 * "permissions off" warning misleads the user — there is no permission
 * to grant from this context. We detect the situation up front and
 * show installation guidance instead.
 *
 * The reason is exposed alongside the boolean so UI copy can branch on
 * it (e.g. show an "Add to Home Screen" hint vs. a generic
 * "browser doesn't support push" message).
 */
export type PushUnsupportedReason =
  | 'no-notification-api'
  | 'no-service-worker'
  | 'ios-safari-not-pwa';

export interface PushSupportInfo {
  supported: boolean;
  reason?: PushUnsupportedReason;
}

function isIos(): boolean {
  // iPadOS 13+ reports as "MacIntel" with maxTouchPoints > 1; cover both UAs.
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent;
  if (/iPad|iPhone|iPod/.test(ua)) return true;
  return navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1;
}

function isStandalonePwa(): boolean {
  if (typeof window === 'undefined') return false;
  // iOS-specific flag — the standardized `display-mode: standalone` media
  // query also returns true once installed, but the legacy flag is the
  // only thing iOS Safari historically exposed.
  type IosNavigator = Navigator & { standalone?: boolean };
  if ((navigator as IosNavigator).standalone === true) return true;
  return window.matchMedia?.('(display-mode: standalone)').matches ?? false;
}

export function detectPushSupport(): PushSupportInfo {
  if (typeof window === 'undefined') {
    // SSR — assume supported so we don't render the unsupported branch
    // until the client takes over and we can read navigator.
    return { supported: true };
  }
  if (!('Notification' in window)) {
    return { supported: false, reason: 'no-notification-api' };
  }
  if (!('serviceWorker' in navigator)) {
    return { supported: false, reason: 'no-service-worker' };
  }
  if (isIos() && !isStandalonePwa()) {
    return { supported: false, reason: 'ios-safari-not-pwa' };
  }
  return { supported: true };
}
