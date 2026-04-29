'use client';

import { IconBell, IconMapPin } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

import { useGeolocationTracker } from '@/hooks/use-geolocation-tracker';
import { useWebPush } from '@/hooks/use-web-push';
import { detectPushSupport, type PushSupportInfo } from '@/lib/push-support';

export function PushNotificationsToggle() {
  const t = useTranslations('pushSetup');
  const { permission, deviceId, isLoading, error, enable, disable } = useWebPush();
  const geo = useGeolocationTracker(deviceId);

  // Re-check on mount only; the result depends on UA + standalone PWA flag,
  // both stable for the lifetime of the page.
  const [pushSupport, setPushSupport] = useState<PushSupportInfo>({ supported: true });
  useEffect(() => {
    setPushSupport(detectPushSupport());
  }, []);

  // iOS Safari outside a PWA install: the Notification + serviceWorker APIs
  // exist, so `useWebPush` reports `permission='default'` and renders the
  // generic "enable" CTA — but `requestPermission()` resolves to `denied`
  // without UI. Surface the install hint instead.
  if (!pushSupport.supported && pushSupport.reason === 'ios-safari-not-pwa') {
    return (
      <div className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800">
        {t('iosAddToHomeScreen')}
      </div>
    );
  }

  if (permission === 'unsupported') {
    return (
      <div className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800">
        {t('unsupported')}
      </div>
    );
  }

  if (permission === 'unconfigured') {
    return (
      <div className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800">
        {t('unconfigured')}
      </div>
    );
  }

  const pushGranted = permission === 'granted' && deviceId !== null;
  const pushDenied = permission === 'denied';
  const geoGranted = geo.permission === 'granted';
  const geoDenied = geo.permission === 'denied';

  return (
    <div className="space-y-1">
      {/* Push notification row */}
      <div className="flex min-h-[56px] items-center gap-3 px-4 py-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent/10">
          <IconBell size={16} className="text-accent" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-text-primary">{t('stepPush')}</p>
          <p className="text-xs text-muted">
            {pushGranted
              ? t('enabledNoGps')
              : pushDenied
                ? t('pushDenied')
                : t('pushExplain')}
          </p>
        </div>
        {pushGranted ? (
          <button
            onClick={() => disable()}
            disabled={isLoading}
            className="shrink-0 rounded-lg bg-card px-3 py-1.5 text-xs font-medium text-text-secondary transition-colors hover:bg-border disabled:opacity-50"
          >
            {isLoading ? t('disabling') : t('disable')}
          </button>
        ) : pushDenied ? (
          <span className="shrink-0 rounded-lg bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-700">
            {t('denied')}
          </span>
        ) : (
          <button
            onClick={() => enable()}
            disabled={isLoading}
            className="shrink-0 rounded-lg bg-accent px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-accent/90 disabled:opacity-50"
          >
            {isLoading ? t('allowing') : t('enable')}
          </button>
        )}
      </div>

      {error && (
        <div className="mx-4 rounded-lg bg-danger/10 px-4 py-2 text-xs text-danger">{error}</div>
      )}

      {/* Divider */}
      <div className="mx-4 border-t border-border" />

      {/* Geolocation row */}
      <div className="flex min-h-[56px] items-center gap-3 px-4 py-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-success/10">
          <IconMapPin size={16} className="text-success" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-text-primary">{t('stepLocation')}</p>
          <p className="text-xs text-muted">
            {geoGranted
              ? t('geoEnabled')
              : geoDenied
                ? t('locationDenied')
                : t('locationExplain')}
          </p>
        </div>
        {geoGranted ? (
          <button
            onClick={() => geo.stop()}
            className="shrink-0 rounded-lg bg-card px-3 py-1.5 text-xs font-medium text-text-secondary transition-colors hover:bg-border"
          >
            {t('disable')}
          </button>
        ) : geoDenied ? (
          <span className="shrink-0 rounded-lg bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-700">
            {t('denied')}
          </span>
        ) : (
          <button
            onClick={() => geo.start()}
            className="shrink-0 rounded-lg bg-success px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-success/90"
          >
            {t('allowLocation')}
          </button>
        )}
      </div>

      {geo.error && (
        <div className="mx-4 rounded-lg bg-danger/10 px-4 py-2 text-xs text-danger">
          {geo.error}
        </div>
      )}
    </div>
  );
}
