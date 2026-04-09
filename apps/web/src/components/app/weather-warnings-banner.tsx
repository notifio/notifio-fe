'use client';

import { IconAlertTriangle, IconChevronDown, IconChevronUp } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import type { WeatherWarning, WeatherWarningSeverity } from '@notifio/api-client';

const SEVERITY_ORDER: Record<WeatherWarningSeverity, number> = {
  red: 3,
  orange: 2,
  yellow: 1,
};

const SEVERITY_BG: Record<WeatherWarningSeverity, string> = {
  red: 'linear-gradient(135deg, #DC2626, #EF4444)',
  orange: 'linear-gradient(135deg, #EA580C, #F97316)',
  yellow: 'linear-gradient(135deg, #D97706, #F59E0B)',
};

const SEVERITY_TEXT: Record<WeatherWarningSeverity, string> = {
  red: '#FFFFFF',
  orange: '#FFFFFF',
  yellow: '#78350F',
};

function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
}

interface WeatherWarningsBannerProps {
  warnings: WeatherWarning[];
}

export function WeatherWarningsBanner({ warnings }: WeatherWarningsBannerProps) {
  const t = useTranslations('weatherWarnings');
  const [expanded, setExpanded] = useState(false);

  if (warnings.length === 0) return null;

  const sorted = [...warnings].sort(
    (a, b) => (SEVERITY_ORDER[b.severity] ?? 0) - (SEVERITY_ORDER[a.severity] ?? 0)
  );

  const top = sorted[0];
  if (!top) return null;
  const severity = top.severity as WeatherWarningSeverity;
  const Chevron = expanded ? IconChevronUp : IconChevronDown;

  return (
    <button
      onClick={() => setExpanded((v) => !v)}
      className="w-full rounded-xl text-left"
      style={{
        background: SEVERITY_BG[severity] ?? SEVERITY_BG.yellow,
        color: SEVERITY_TEXT[severity] ?? SEVERITY_TEXT.yellow,
      }}
    >
      {/* Collapsed row — always visible */}
      <div className="flex items-center gap-2.5 px-3.5 py-2.5">
        <IconAlertTriangle size={16} className="shrink-0" />
        <p className={`min-w-0 flex-1 text-sm font-medium ${expanded ? '' : 'truncate'}`}>
          {top.headline}
        </p>
        <span className="shrink-0 text-xs opacity-80">
          {formatTime(top.validUntil)}
        </span>
        {sorted.length > 1 && (
          <span className="shrink-0 rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-medium">
            +{sorted.length - 1}
          </span>
        )}
        <Chevron size={14} className="shrink-0 opacity-60" />
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div className="border-t px-3.5 pb-3 pt-2" style={{ borderColor: 'rgba(255,255,255,0.15)' }}>
          {top.description && (
            <p className="text-xs opacity-80">{top.description}</p>
          )}
          <p className="mt-2 text-[11px] opacity-60">
            {top.provider} · {t('validUntil')} {formatTime(top.validUntil)}
          </p>
        </div>
      )}
    </button>
  );
}
