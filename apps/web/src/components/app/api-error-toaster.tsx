'use client';

import { useTranslations } from 'next-intl';
import { useEffect } from 'react';

import { useToast } from '@/components/ui/toast';
import { RATE_LIMITED_EVENT } from '@/lib/api';

/**
 * Bridges global API error events (rate-limit, etc.) into the toast system.
 * Rendered once inside the app layout.
 */
export function ApiErrorToaster() {
  const t = useTranslations('errors');
  const { error } = useToast();

  useEffect(() => {
    const handler = (e: Event) => {
      const seconds = (e as CustomEvent).detail?.seconds ?? 60;
      error(t('rateLimited', { seconds: String(seconds) }));
    };
    window.addEventListener(RATE_LIMITED_EVENT, handler);
    return () => window.removeEventListener(RATE_LIMITED_EVENT, handler);
  }, [error, t]);

  return null;
}
