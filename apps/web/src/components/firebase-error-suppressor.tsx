'use client';

import { useEffect } from 'react';

import { installFirebaseErrorSuppressor } from '@/lib/firebase';

/**
 * Installs a global unhandledrejection handler on mount to suppress
 * a harmless Firebase Messaging SDK background error. Rendered from
 * the root layout so it's active on every page before any Firebase
 * code runs.
 */
export function FirebaseErrorSuppressor(): null {
  useEffect(() => {
    installFirebaseErrorSuppressor();
  }, []);
  return null;
}
