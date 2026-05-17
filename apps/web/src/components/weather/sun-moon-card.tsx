'use client';

import { IconMoon, IconSunrise } from '@tabler/icons-react';
import { useLocale, useTranslations } from 'next-intl';

interface Props {
  sunrise?: string;
  sunset?: string;
}

export function SunMoonCard({ sunrise, sunset }: Props) {
  const t = useTranslations('weatherPage');
  const locale = useLocale();

  if (!sunrise && !sunset) return null;

  const fmt = (iso: string) =>
    new Date(iso).toLocaleTimeString(locale, {
      hour: '2-digit',
      minute: '2-digit',
    });

  return (
    <section className="rounded-2xl border border-border bg-card p-4">
      <h3 className="pb-3 text-sm font-semibold text-text-primary">{t('sunAndMoon')}</h3>
      <div className="flex items-center justify-around gap-4">
        {sunrise && (
          <div className="flex flex-col items-center gap-1">
            <IconSunrise size={20} className="text-amber-500" />
            <span className="text-xs text-muted">{t('sunrise')}</span>
            <span className="text-sm font-semibold text-text-primary">{fmt(sunrise)}</span>
          </div>
        )}
        {sunset && (
          <div className="flex flex-col items-center gap-1">
            <IconMoon size={20} className="text-blue-400" />
            <span className="text-xs text-muted">{t('sunset')}</span>
            <span className="text-sm font-semibold text-text-primary">{fmt(sunset)}</span>
          </div>
        )}
      </div>
    </section>
  );
}
