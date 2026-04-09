'use client';

import { IconX } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';

import type { AirQualityData } from '@notifio/shared';
import { AQ_COMPONENT_INFO, getAqiStyle } from '@notifio/shared/air-quality';

const AQI_HEALTH_KEYS: Record<string, string> = {
  good: 'good',
  fair: 'fair',
  moderate: 'moderate',
  poor: 'poor',
  very_poor: 'very_poor',
};

interface AqiChipProps {
  airQuality: AirQualityData | null;
  isLoading: boolean;
  isExpanded: boolean;
  dimmed: boolean;
  onToggle: () => void;
}

export function AqiChip({ airQuality, isLoading, isExpanded, dimmed, onToggle }: AqiChipProps) {
  if (isLoading) {
    return <div className="h-7 w-32 animate-pulse rounded-full bg-white/10" />;
  }

  if (!airQuality) return null;

  const aqiStyle = getAqiStyle(airQuality.level);

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
      <span
        className="inline-block size-2 shrink-0 rounded-full"
        style={{ backgroundColor: aqiStyle.color }}
      />
      AQI {airQuality.aqi} {aqiStyle.label}
    </button>
  );
}

interface AqiDetailPanelProps {
  airQuality: AirQualityData;
  onClose: () => void;
}

export function AqiDetailPanel({ airQuality, onClose }: AqiDetailPanelProps) {
  const t = useTranslations('aqi');

  const healthKey = AQI_HEALTH_KEYS[airQuality.level] ?? 'moderate';

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
      <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1">
        {Object.entries(airQuality.components).map(([key, value]) => {
          const info = AQ_COMPONENT_INFO[key];
          if (!info) return null;
          return (
            <div key={key} className="flex items-center justify-between text-[11px] opacity-70">
              <span>{info.label}</span>
              <span className="tabular-nums">
                {(value as number).toFixed(1)} {info.unit}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
