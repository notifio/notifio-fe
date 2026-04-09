'use client';

import { IconBell, IconCheck, IconMapPin, IconX } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { useGeolocationTracker } from '@/hooks/use-geolocation-tracker';
import { useWebPush } from '@/hooks/use-web-push';

export function PushNotificationsToggle() {
  const t = useTranslations('pushSetup');
  const ts = useTranslations('settings');
  const { permission, deviceId, isLoading, error, enable, disable } = useWebPush();
  const geo = useGeolocationTracker(deviceId);
  const [showModal, setShowModal] = useState(false);
  const [geoError, setGeoError] = useState(false);

  const handleEnableClick = () => {
    setGeoError(false);
    setShowModal(true);
  };

  const handleGrantGeo = async () => {
    setGeoError(false);
    const ok = await geo.start();
    if (!ok) setGeoError(true);
  };

  const handleGrantPush = async () => {
    await enable();
  };

  const handleDisable = async () => {
    geo.stop();
    await disable();
    setShowModal(false);
  };

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
  const geoGranted = geo.permission === 'granted';

  return (
    <div className="space-y-3">
      {/* Status row */}
      <div className="flex items-center gap-3 rounded-lg px-4 py-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent/10">
          <IconBell size={16} className="text-accent" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-text-primary">{ts('pushNotifications')}</p>
          <p className="text-xs text-muted">
            {pushGranted && geoGranted
              ? t('enabledWithGps')
              : pushGranted
                ? t('enabledNoGps')
                : t('disabled')}
          </p>
        </div>
        {pushGranted ? (
          <button
            onClick={handleDisable}
            disabled={isLoading}
            className="rounded-lg bg-card px-3 py-1.5 text-xs font-medium text-text-secondary transition-colors hover:bg-border disabled:opacity-50"
          >
            {isLoading ? t('disabling') : t('disable')}
          </button>
        ) : (
          <button
            onClick={handleEnableClick}
            disabled={isLoading}
            className="rounded-lg bg-accent px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-accent/90 disabled:opacity-50"
          >
            {t('enable')}
          </button>
        )}
      </div>

      {error && (
        <div className="rounded-lg bg-danger/10 px-4 py-3 text-sm text-danger">
          {error}
        </div>
      )}

      {/* Unified permissions modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-w-md rounded-xl bg-background shadow-2xl">
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <h3 className="text-lg font-semibold text-text-primary">{t('title')}</h3>
              <button
                onClick={() => setShowModal(false)}
                className="rounded p-1 text-muted transition-colors hover:bg-card hover:text-text-secondary"
                aria-label={t('close')}
              >
                <IconX size={18} />
              </button>
            </div>

            <div className="space-y-4 px-6 py-4">
              {/* GEOLOCATION section */}
              <div className="rounded-lg border border-border p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-success/10">
                    {geoGranted ? (
                      <IconCheck size={16} className="text-success" />
                    ) : (
                      <IconMapPin size={16} className="text-success" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-text-primary">1. {t('stepLocation')}</p>
                    <p className="mt-1 text-xs text-text-secondary">
                      {t('locationExplain')} <strong>&quot;{t('allowOnVisit')}&quot;</strong>.
                    </p>
                    {geoGranted ? (
                      <p className="mt-2 text-xs font-medium text-success">✓ {t('allowed')}</p>
                    ) : geo.permission === 'denied' || geoError ? (
                      <div className="mt-2 rounded-lg bg-amber-50 p-2 text-xs text-amber-800">
                        {t('locationDenied')}
                      </div>
                    ) : (
                      <button
                        onClick={handleGrantGeo}
                        className="mt-2 rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-green-700"
                      >
                        {t('allowLocation')}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* PUSH section */}
              <div className="rounded-lg border border-border p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent/10">
                    {pushGranted ? (
                      <IconCheck size={16} className="text-accent" />
                    ) : (
                      <IconBell size={16} className="text-accent" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-text-primary">2. {t('stepPush')}</p>
                    <p className="mt-1 text-xs text-text-secondary">
                      {t('pushExplain')} <strong>&quot;{t('allowOnVisit')}&quot;</strong>.
                    </p>
                    {pushGranted ? (
                      <p className="mt-2 text-xs font-medium text-accent">✓ {t('allowed')}</p>
                    ) : permission === 'denied' ? (
                      <div className="mt-2 rounded-lg bg-amber-50 p-2 text-xs text-amber-800">
                        {t('pushDenied')}
                      </div>
                    ) : (
                      <button
                        onClick={handleGrantPush}
                        disabled={isLoading}
                        className="mt-2 rounded-lg bg-accent px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-accent/90 disabled:opacity-50"
                      >
                        {isLoading ? t('allowing') : t('allowNotifications')}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-border px-6 py-3">
              <button
                onClick={() => setShowModal(false)}
                className="w-full rounded-lg bg-card px-4 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-border"
              >
                {pushGranted ? t('done') : t('close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
