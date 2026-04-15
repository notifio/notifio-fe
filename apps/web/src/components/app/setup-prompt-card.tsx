'use client';

import { IconBellOff } from '@tabler/icons-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

import { usePermissionStatus } from '@/hooks/use-permission-status';

interface SetupPromptCardProps {
  variant: 'compact' | 'full';
}

export function SetupPromptCard({ variant }: SetupPromptCardProps) {
  const t = useTranslations('setupPrompt');
  const { pushGranted, geoGranted, loading, fullyConfigured } = usePermissionStatus();

  if (loading || fullyConfigured) return null;

  const needsBoth = !pushGranted && !geoGranted;
  const needsPushOnly = !pushGranted && geoGranted;

  if (variant === 'compact') {
    const message = needsBoth
      ? t('compactBoth')
      : needsPushOnly
        ? t('compactPushOnly')
        : t('compactGeoOnly');

    return (
      <div className="rounded-xl bg-card/50 p-6 text-center">
        <IconBellOff size={28} className="mx-auto text-muted" />
        <p className="mt-2 text-sm text-muted">{message}</p>
        <Link
          href="/settings"
          className="mt-3 inline-block rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent/90"
        >
          {t('setup')}
        </Link>
      </div>
    );
  }

  const description = needsBoth
    ? t('descriptionBoth')
    : needsPushOnly
      ? t('descriptionPushOnly')
      : t('descriptionGeoOnly');

  return (
    <div className="rounded-2xl border border-dashed border-border bg-card/50 p-10 text-center">
      <IconBellOff size={36} className="mx-auto text-muted" />
      <h3 className="mt-3 text-sm font-semibold text-text-primary">{t('title')}</h3>
      <p className="mt-1.5 text-sm text-muted">{description}</p>
      <div className="mt-5 flex flex-col items-center gap-2 sm:flex-row sm:justify-center">
        {(needsBoth || needsPushOnly) && (
          <Link
            href="/settings"
            className="inline-block rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent/90"
          >
            {t('enablePush')}
          </Link>
        )}
        {(needsBoth || (!needsPushOnly && !needsBoth)) && (
          <Link
            href="/settings"
            className="inline-block rounded-lg border border-border px-4 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-card"
          >
            {t('addLocation')}
          </Link>
        )}
      </div>
    </div>
  );
}
