'use client';

import { useTranslations } from 'next-intl';

import type { PollenResponse } from '@notifio/api-client';

interface Props {
  pollen: PollenResponse | null;
}

type Level = 'low' | 'moderate' | 'high' | 'veryHigh';

function aggregate(pollen: PollenResponse) {
  const c = pollen.components;
  return {
    tree: (c.birch ?? 0) + (c.alder ?? 0) + (c.olive ?? 0),
    grass: c.grass ?? 0,
    weed: (c.ragweed ?? 0) + (c.mugwort ?? 0),
  };
}

// Open-Meteo grains/m³ thresholds (rough European pollen-index bands).
function levelFromValue(value: number): Level {
  if (value >= 100) return 'veryHigh';
  if (value >= 50) return 'high';
  if (value >= 10) return 'moderate';
  return 'low';
}

const LEVEL_COLOR: Record<Level, string> = {
  low: '#1D9E75',
  moderate: '#FFD27F',
  high: '#FF7A2F',
  veryHigh: '#FF3B30',
};

// `pollen.recommendation.*` is not in shared 1.11.0 — inline English
// fallbacks (next shared bump adds proper SK/EN/CS/DE/HU/UK).
const RECOMMENDATION_FALLBACK: Record<Level, string> = {
  low: 'Low pollen levels — generally safe for sensitive individuals.',
  moderate: 'Moderate pollen — sensitive people may experience symptoms.',
  high: 'High pollen — consider limiting outdoor exposure if sensitive.',
  veryHigh: 'Very high pollen — minimise outdoor time, take precautions.',
};

export function PollenCard({ pollen }: Props) {
  const t = useTranslations('pollen');

  if (!pollen) {
    return <div className="h-32 animate-pulse rounded-2xl bg-card" />;
  }

  const buckets = aggregate(pollen);
  const items: Array<{ key: 'tree' | 'grass' | 'weed'; value: number }> = [
    { key: 'tree', value: buckets.tree },
    { key: 'grass', value: buckets.grass },
    { key: 'weed', value: buckets.weed },
  ];

  return (
    <section className="rounded-2xl border border-border bg-card p-4">
      <header className="pb-3">
        <h3 className="text-sm font-semibold text-text-primary">
          {t('species.tree')} · {t('species.grass')} · {t('species.weed')}
        </h3>
      </header>
      <div className="flex flex-col gap-2">
        {items.map(({ key, value }) => {
          const level = levelFromValue(value);
          const recommendation = t(`recommendation.${level}`, {
            defaultValue: RECOMMENDATION_FALLBACK[level],
          });
          return (
            <div key={key} className="flex items-center gap-3 text-sm">
              <span className="w-16 text-text-primary">{t(`species.${key}`)}</span>
              <strong className="text-text-primary">{Math.round(value)}</strong>
              <span className="text-xs text-muted">
                {t('unit', { defaultValue: 'grains/m³' })}
              </span>
              <span
                title={recommendation}
                aria-label={recommendation}
                className="ml-auto inline-block size-3 cursor-help rounded-full ring-1 ring-black/10"
                style={{ backgroundColor: LEVEL_COLOR[level] }}
              />
            </div>
          );
        })}
      </div>
    </section>
  );
}
