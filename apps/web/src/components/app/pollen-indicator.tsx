'use client';

import { IconPlant2, IconX } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';

import type { PollenData } from './weather-card';

// TODO: Replace with real pollen endpoint when BE adds GET /api/v1/pollen
const MOCK_ALLERGENS: { key: string; value: number }[] = [
  { key: 'birch', value: 85 },
  { key: 'grass', value: 12 },
  { key: 'alder', value: 5 },
  { key: 'ragweed', value: 0 },
];

const MAX_BAR_VALUE = 100;

const POLLEN_HEALTH_KEYS: Record<string, string> = {
  High: 'high',
  Moderate: 'moderate',
  Low: 'low',
};

interface PollenChipProps {
  pollen: PollenData;
  isExpanded: boolean;
  dimmed: boolean;
  onToggle: () => void;
}

export function PollenChip({ pollen, isExpanded, dimmed, onToggle }: PollenChipProps) {
  return (
    <button
      onClick={onToggle}
      style={{
        background: isExpanded ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.1)',
        border: `1px solid ${isExpanded ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.12)'}`,
        borderRadius: '20px',
        padding: '5px 12px',
        fontSize: '12px',
        color: 'inherit',
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        transition: 'background 200ms, border-color 200ms, opacity 200ms',
        opacity: dimmed ? 0.7 : 1,
      }}
    >
      <IconPlant2 size={14} />
      {pollen.dominant} {pollen.value} {pollen.unit}
    </button>
  );
}

interface PollenDetailPanelProps {
  pollen: PollenData;
  onClose: () => void;
}

export function PollenDetailPanel({ pollen, onClose }: PollenDetailPanelProps) {
  const t = useTranslations('pollen');

  const healthKey = POLLEN_HEALTH_KEYS[pollen.level] ?? 'moderate';

  return (
    <div
      style={{
        background: 'rgba(255,255,255,0.08)',
        borderRadius: '10px',
        padding: '10px 12px',
      }}
    >
      <div className="flex items-start justify-between">
        <p className="text-[11px] opacity-65">{t(healthKey)}</p>
        <button
          onClick={onClose}
          className="shrink-0 cursor-pointer opacity-50 transition-opacity hover:opacity-80"
          style={{ background: 'none', border: 'none', color: 'inherit', padding: 0 }}
        >
          <IconX size={14} />
        </button>
      </div>
      <div className="mt-2 space-y-1.5">
        {MOCK_ALLERGENS.filter((a) => a.value > 0).map((allergen) => {
          const pct = Math.min((allergen.value / MAX_BAR_VALUE) * 100, 100);
          const barColor = allergen.value >= 50 ? '#F59E0B' : '#22C55E';
          return (
            <div key={allergen.key} className="flex items-center gap-2 text-[11px]">
              <span className="w-[50px] shrink-0 opacity-70">{t(allergen.key)}</span>
              <div
                className="h-1.5 flex-1 overflow-hidden rounded-full"
                style={{ background: 'rgba(255,255,255,0.1)' }}
              >
                <div
                  className="h-full rounded-full"
                  style={{ width: `${pct}%`, backgroundColor: barColor }}
                />
              </div>
              <span className="w-[28px] shrink-0 text-right tabular-nums opacity-60">
                {allergen.value}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
