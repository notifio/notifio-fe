'use client';

import { useTranslations } from 'next-intl';

import type { PollenResponse } from '@notifio/api-client';

interface Props {
  pollen: PollenResponse | null;
}

function aggregate(pollen: PollenResponse) {
  const c = pollen.components;
  return {
    tree: (c.birch ?? 0) + (c.alder ?? 0) + (c.olive ?? 0),
    grass: c.grass ?? 0,
    weed: (c.ragweed ?? 0) + (c.mugwort ?? 0),
  };
}

function levelFromValue(value: number): 'low' | 'moderate' | 'high' {
  if (value >= 50) return 'high';
  if (value >= 10) return 'moderate';
  return 'low';
}

const LEVEL_COLOR: Record<'low' | 'moderate' | 'high', string> = {
  low: '#22C55E',
  moderate: '#EAB308',
  high: '#EF4444',
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
        <h3 className="text-sm font-semibold text-text-primary">{t('species.tree')} · {t('species.grass')} · {t('species.weed')}</h3>
      </header>
      <div className="flex flex-col gap-2">
        {items.map(({ key, value }) => {
          const level = levelFromValue(value);
          return (
            <div key={key} className="flex items-center gap-2 text-sm">
              <span className="w-16 text-text-primary">{t(`species.${key}`)}</span>
              <span
                className="rounded-full px-2 py-0.5 text-xs font-medium text-white"
                style={{ backgroundColor: LEVEL_COLOR[level] }}
              >
                {t(level)}
              </span>
              <span className="ml-auto text-xs text-muted">
                {Math.round(value)}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
