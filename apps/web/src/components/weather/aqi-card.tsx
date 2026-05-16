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

// Display labels for known OWM components. Falls back to the raw key for
// anything new the BE adds — render is dynamic over Object.entries().
const COMPONENT_LABEL: Record<string, string> = {
  pm2_5: 'PM₂.₅',
  pm10: 'PM₁₀',
  o3: 'O₃',
  no2: 'NO₂',
  no: 'NO',
  so2: 'SO₂',
  co: 'CO',
  nh3: 'NH₃',
};
const COMPONENT_UNIT = 'μg/m³';

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

  // Dynamic pollutant entries — every numeric field on `components`.
  // Future-proof: new BE fields appear automatically.
  const componentEntries = Object.entries(aqi.components ?? {}).filter(
    ([, value]) => typeof value === 'number',
  );

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
            style={{ backgroundColor: seg <= aqi.aqi ? color : 'var(--color-border)' }}
          />
        ))}
      </div>
      <p className="text-xs text-text-secondary">{t(`recommendation.${levelKey}`)}</p>

      {componentEntries.length > 0 && (
        <div className="mt-3 grid grid-cols-2 gap-2 border-t border-border pt-3 sm:grid-cols-3">
          {componentEntries.map(([key, value]) => (
            <div
              key={key}
              className="flex items-baseline justify-between gap-1 text-xs"
            >
              <span className="text-muted">{COMPONENT_LABEL[key] ?? key.toUpperCase()}</span>
              <span className="font-semibold text-text-primary">
                {(value as number).toFixed(1)}
              </span>
            </div>
          ))}
          <div className="col-span-full text-right text-[10px] text-muted">{COMPONENT_UNIT}</div>
        </div>
      )}
    </section>
  );
}
