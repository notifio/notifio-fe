'use client';

import { useTranslations } from 'next-intl';

import type { PollenResponse } from '@notifio/api-client';

type Level = 'low' | 'moderate' | 'high' | 'veryHigh';

// Open-Meteo grains/m³ thresholds (European pollen-index bands).
function levelFromValue(value: number): Level {
  if (value >= 200) return 'veryHigh';
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

// Scale so a full bar = 200 grains/m³ (top of the very-high band).
const FULL_SCALE = 200;

interface Props {
  pollen: PollenResponse | null;
}

export function PollenCard({ pollen }: Props) {
  const t = useTranslations('pollen');

  if (!pollen) {
    return <div className="h-32 animate-pulse rounded-2xl bg-card" />;
  }

  // Dynamic — render every numeric field BE returns, in stable order.
  // Null fields (BE absent-this-region) are skipped.
  const entries = Object.entries(pollen.components ?? {}).filter(
    ([, value]) => typeof value === 'number',
  ) as Array<[string, number]>;

  if (entries.length === 0) {
    return null;
  }

  return (
    <section className="rounded-2xl border border-border bg-card p-4">
      <header className="pb-3">
        <h3 className="text-sm font-semibold text-text-primary">
          {t('title')}
        </h3>
      </header>
      <div className="flex flex-col gap-2">
        {entries.map(([species, value]) => {
          const level = levelFromValue(value);
          const percent = Math.min(100, (value / FULL_SCALE) * 100);
          const label = t.has(species) ? t(species) : species;
          return (
            <div key={species} className="flex items-center gap-3 text-sm">
              <span className="w-16 shrink-0 text-text-primary">{label}</span>
              <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-border">
                <span
                  className="absolute inset-y-0 left-0 rounded-full transition-all"
                  style={{
                    width: `${percent}%`,
                    backgroundColor: LEVEL_COLOR[level],
                  }}
                />
              </div>
              <span className="w-16 shrink-0 text-right text-xs text-muted">
                {Math.round(value)} {pollen.unit}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
