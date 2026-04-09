'use client';

import { IconAlertTriangle, IconX } from '@tabler/icons-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

const DISMISSED_KEY = 'notifio_banner_dismissed';
const DEVICE_ID_KEY = 'notifio_device_id';
const FCM_TOKEN_KEY = 'notifio_fcm_token';

interface PermissionStatus {
  pushGranted: boolean;
  pushDenied: boolean;
  geoGranted: boolean;
  geoDenied: boolean;
}

export function LocationStatusBanner() {
  const t = useTranslations('locationBanner');
  const pathname = usePathname();
  const [status, setStatus] = useState<PermissionStatus | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (pathname?.startsWith('/settings')) {
      setStatus(null);
      return;
    }

    if (sessionStorage.getItem(DISMISSED_KEY) === '1') {
      setDismissed(true);
      return;
    }

    const hasDevice = localStorage.getItem(DEVICE_ID_KEY) !== null;
    const hasToken = localStorage.getItem(FCM_TOKEN_KEY) !== null;
    const notifPerm = 'Notification' in window ? Notification.permission : 'default';
    const pushGranted = hasDevice && hasToken && notifPerm === 'granted';
    const pushDenied = notifPerm === 'denied';

    let cancelled = false;
    const checkGeo = async (): Promise<void> => {
      let geoGranted = false;
      let geoDenied = false;
      if ('permissions' in navigator) {
        try {
          const result = await navigator.permissions.query({ name: 'geolocation' as PermissionName });
          geoGranted = result.state === 'granted';
          geoDenied = result.state === 'denied';
        } catch {
          // Safari may throw — ignore
        }
      }
      if (!cancelled) {
        setStatus({ pushGranted, pushDenied, geoGranted, geoDenied });
      }
    };
    void checkGeo();

    return () => {
      cancelled = true;
    };
  }, [pathname]);

  const handleDismiss = (): void => {
    sessionStorage.setItem(DISMISSED_KEY, '1');
    setDismissed(true);
  };

  if (!status || dismissed) return null;

  // Both OK — no banner
  if (status.pushGranted && status.geoGranted) return null;

  // Determine message key based on permission matrix
  let messageKey: string;
  if (status.pushDenied) {
    messageKey = 'pushDenied';
  } else if (status.geoDenied) {
    messageKey = 'geoDenied';
  } else if (!status.pushGranted && !status.geoGranted) {
    messageKey = 'bothOff';
  } else if (status.pushGranted && !status.geoGranted) {
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
