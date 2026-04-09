/**
 * Firebase Web SDK initialization for Cloud Messaging (web push).
 *
 * All NEXT_PUBLIC_FIREBASE_* values are PUBLIC by design — Firebase Web config
 * is served to every browser. Security is enforced via Firebase Security Rules
 * and HTTP referrer restrictions on the API key in Google Cloud Console.
 */
import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getMessaging, isSupported, type Messaging } from 'firebase/messaging';

export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? '',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? '',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? '',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? '',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? '',
};

export const VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY ?? '';

let app: FirebaseApp | null = null;

export function getFirebaseApp(): FirebaseApp {
  if (!app) {
    app = getApps().length > 0 ? getApps()[0]! : initializeApp(firebaseConfig);
  }
  return app;
}

/**
 * Returns Firebase Messaging instance if the browser supports it,
 * or null otherwise (e.g. Safari without push support, incognito mode).
 */
export async function getFirebaseMessaging(): Promise<Messaging | null> {
  if (typeof window === 'undefined') return null;
  const supported = await isSupported();
  if (!supported) return null;
  return getMessaging(getFirebaseApp());
}

export function isFirebaseConfigured(): boolean {
  return Boolean(
    firebaseConfig.apiKey &&
      firebaseConfig.projectId &&
      firebaseConfig.messagingSenderId &&
      firebaseConfig.appId &&
      VAPID_KEY,
  );
}

/**
 * Suppress a known harmless Firebase Messaging SDK error that fires as an
 * uncaught promise rejection during background token management:
 *
 *   TypeError: Cannot read properties of undefined (reading 'pushManager')
 *     at token-manager.ts:102
 *
 * This error does NOT prevent getToken() from succeeding — the FCM token
 * is returned correctly and device registration works. It stems from an
 * internal Firebase background task whose ServiceWorkerRegistration state
 * hasn't been populated yet. Suppressing it prevents console noise for
 * end users.
 */
let handlerInstalled = false;
export function installFirebaseErrorSuppressor(): void {
  if (handlerInstalled || typeof window === 'undefined') return;
  handlerInstalled = true;
  const handler = (event: PromiseRejectionEvent): void => {
    const reason = event.reason;
    const msg = typeof reason === 'string' ? reason : (reason?.message ?? '');
    if (msg.includes('pushManager') || msg.includes("'pushManager'")) {
      event.preventDefault();
      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.debug('[firebase] suppressed background pushManager error (harmless)');
      }
    }
  };
  window.addEventListener('unhandledrejection', handler);
}
