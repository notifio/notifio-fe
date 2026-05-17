'use client';

import { useTranslations } from 'next-intl';

import type { AirQualityData } from '@notifio/shared';
import { AQ_COMPONENT_INFO, getAqiStyle } from '@notifio/shared/air-quality';

const AQI_LEVEL_KEY: Record<AirQualityData['level'], 'good' | 'fair' | 'moderate' | 'poor' | 'veryPoor'> = {
  good: 'good',
  fair: 'fair',
  moderate: 'moderate',
  poor: 'poor',
  very_poor: 'veryPoor',
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
  const aqiStyle = getAqiStyle(aqi.level);
  const color = aqiStyle.color;

  const componentEntries = Object.entries(aqi.components ?? {}).filter(
    ([, value]) => typeof value === 'number',
  );

  return (
    <section className="rounded-2xl border border-border bg-card p-4">
      <header className="flex items-center justify-between pb-2">
        <h3 className="text-sm font-semibold text-text-primary">{t('title')}</h3>
        <div className="flex items-center gap-2">
          <span
            className="inline-block size-2 shrink-0 rounded-full"
            style={{ backgroundColor: color }}
          />
          <span className="text-sm font-semibold" style={{ color }}>
            AQI {aqi.aqi} · {t(levelKey)}
          </span>
        </div>
      </header>

      <div className="flex gap-1 pb-3">
        {[1, 2, 3, 4, 5].map((seg) => (
          <span
            key={seg}
            className="h-1.5 flex-1 rounded-full"
            style={{ backgroundColor: seg <= aqi.aqi ? color : 'var(--color-border)' }}
          />
        ))}
      </div>

      <p className="text-xs text-text-secondary">{t(`recommendation.${levelKey}`)}</p>

      {componentEntries.length > 0 && (
        <div className="mt-3 rounded-xl bg-background/50 p-3">
          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
            {componentEntries.map(([key, value]) => {
              const info = AQ_COMPONENT_INFO[key];
              const label = info?.label ?? key.toUpperCase();
              const unit = info?.unit ?? 'μg/m³';
              return (
                <div
                  key={key}
                  className="flex items-baseline justify-between gap-2 text-xs"
                >
                  <span className="text-muted">{label}</span>
                  <span className="font-semibold tabular-nums text-text-primary">
                    {(value as number).toFixed(1)}{' '}
                    <span className="text-[10px] font-normal text-muted">{unit}</span>
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
