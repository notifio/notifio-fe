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
  const {
    pushGranted,
    pushDenied,
    pushSupported,
    geoGranted,
    geoDenied,
    loading,
  } = usePermissionStatus();
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

  // When push isn't available in this runtime (iOS Safari outside PWA), treat
  // it as effectively granted for the banner — there is no actionable prompt
  // we could surface and the user otherwise sees a permanent warning they
  // cannot dismiss by changing a setting.
  const pushEffectivelyOk = pushSupported ? pushGranted : true;
  const pushEffectivelyDenied = pushSupported && pushDenied;

  // Hide while loading, on settings page, if dismissed, or if fully configured
  if (loading || pathname?.startsWith('/settings') || dismissed) return null;
  if (pushEffectivelyOk && geoGranted) return null;

  // Determine message key based on permission matrix
  let messageKey: string;
  if (pushEffectivelyDenied) {
    messageKey = 'pushDenied';
  } else if (geoDenied) {
    messageKey = 'geoDenied';
  } else if (!pushEffectivelyOk && !geoGranted) {
    messageKey = 'bothOff';
  } else if (pushEffectivelyOk && !geoGranted) {
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
