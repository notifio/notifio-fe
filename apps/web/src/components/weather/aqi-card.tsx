'use client';

import { useTranslations } from 'next-intl';

import type { AirQualityData } from '@notifio/shared';

const AQI_LEVEL_KEY: Record<AirQualityData['level'], 'good' | 'fair' | 'moderate' | 'poor' | 'veryPoor'> = {
  good: 'good',
  fair: 'fair',
  moderate: 'moderate',
  poor: 'poor',
  very_poor: 'veryPoor',
};

const AQI_COLOR: Record<string, string> = {
  good: '#22C55E',
  fair: '#84CC16',
  moderate: '#EAB308',
  poor: '#F97316',
  veryPoor: '#EF4444',
};

interface Props {
  aqi: AirQualityData | null;
}

export function AqiCard({ aqi }: Props) {
  const t = useTranslations('airQuality');

  if (!aqi) {
    return <div className="h-32 animate-pulse rounded-2xl bg-card" />;
  }

  const levelKey = AQI_LEVEL_KEY[aqi.level];
  const color = AQI_COLOR[levelKey] ?? AQI_COLOR.moderate;
  // aqi.aqi is 1-5 per OWM scale
  const filled = aqi.aqi;

  return (
    <section className="rounded-2xl border border-border bg-card p-4">
      <header className="flex items-center justify-between pb-2">
        <h3 className="text-sm font-semibold text-text-primary">{t('title')}</h3>
        <span className="text-sm font-semibold" style={{ color }}>
          {t(levelKey)}
        </span>
      </header>
      <div className="flex gap-1 pb-3">
        {[1, 2, 3, 4, 5].map((seg) => (
          <span
            key={seg}
            className="h-1.5 flex-1 rounded-full"
            style={{ backgroundColor: seg <= filled ? color : 'var(--color-border)' }}
          />
        ))}
      </div>
      <p className="text-xs text-text-secondary">{t(`recommendation.${levelKey}`)}</p>
    </section>
  );
}
