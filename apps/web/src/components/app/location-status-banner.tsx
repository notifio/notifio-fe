'use client';

import { IconAlertTriangle, IconX } from '@tabler/icons-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

import { usePermissionStatus } from '@/hooks/use-permission-status';

const DISMISSED_KEY = 'notifio_banner_dismissed';

export function LocationStatusBanner() {
  const t = useTranslations('locationBanner');
  const pathname = usePathname();
  const { pushGranted, pushDenied, geoGranted, geoDenied, loading } = usePermissionStatus();
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && sessionStorage.getItem(DISMISSED_KEY) === '1') {
      setDismissed(true);
    }
  }, []);

  const handleDismiss = (): void => {
    sessionStorage.setItem(DISMISSED_KEY, '1');
    setDismissed(true);
  };

  // Hide while loading, on settings page, if dismissed, or if fully configured
  if (loading || pathname?.startsWith('/settings') || dismissed) return null;
  if (pushGranted && geoGranted) return null;

  // Determine message key based on permission matrix
  let messageKey: string;
  if (pushDenied) {
    messageKey = 'pushDenied';
  } else if (geoDenied) {
    messageKey = 'geoDenied';
  } else if (!pushGranted && !geoGranted) {
    messageKey = 'bothOff';
  } else if (pushGranted && !geoGranted) {
    messageKey = 'pushOkGeoOff';
  } else {
    messageKey = 'pushOffGeoOk';
  }

  return (
    <div className="border-b border-amber-200 bg-amber-50">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-6 py-3 md:px-8">
        <IconAlertTriangle size={18} className="shrink-0 text-amber-600" />
        <p className="flex-1 text-sm text-amber-900">{t(messageKey)}</p>
        <Link
          href="/settings"
          className="shrink-0 rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-amber-700"
        >
          {t('openSettings')}
        </Link>
        <button
          onClick={handleDismiss}
          className="shrink-0 rounded p-1 text-amber-600 transition-colors hover:bg-amber-100"
          aria-label={t('close')}
        >
          <IconX size={16} />
        </button>
      </div>
    </div>
  );
}
