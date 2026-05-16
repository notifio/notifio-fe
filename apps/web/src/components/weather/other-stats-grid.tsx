'use client';

import {
  IconDroplet,
  IconEye,
  IconGauge,
  IconSun,
  IconTemperature,
  IconWind,
} from '@tabler/icons-react';
import { useTranslations } from 'next-intl';

import { formatVisibility, formatWind } from '@notifio/shared';
import type { WeatherData } from '@notifio/shared';

interface Props {
  weather: WeatherData;
}

/**
 * 6-cell stats grid for the /weather page. WeatherData currently has
 * `pressure` required; `dewPointC` and `uvIndex` are NOT in the schema
 * yet, so those cells are hidden until shared types add them (tracked
 * follow-up). Renders 4 cells today.
 */
export function OtherStatsGrid({ weather }: Props) {
  const t = useTranslations('weather');
  const tp = useTranslations('weatherPage');

  type Cell = { Icon: typeof IconWind; label: string; value: string };
  const cells: Cell[] = [
    {
      Icon: IconWind,
      label: t('wind'),
      value: formatWind(weather.windSpeed, weather.windDirection),
    },
    {
      Icon: IconDroplet,
      label: t('humidity'),
      value: `${weather.humidity}%`,
    },
    {
      Icon: IconEye,
      label: t('visibility'),
      value: formatVisibility(weather.visibility),
    },
    {
      Icon: IconGauge,
      label: t('pressure'),
      value: `${weather.pressure} hPa`,
    },
  ];

  // Optional cells gated on schema presence — these aren't in WeatherData
  // 1.11.0 but the keys are reserved for future:
  const w = weather as WeatherData & { dewPointC?: number; uvIndex?: number };
  if (typeof w.dewPointC === 'number') {
    cells.push({
      Icon: IconTemperature,
      label: tp('dewPoint'),
      value: `${Math.round(w.dewPointC)}°`,
    });
  }
  if (typeof w.uvIndex === 'number') {
    const lvl = uvLevel(w.uvIndex);
    cells.push({
      Icon: IconSun,
      label: tp('uv'),
      value: `${Math.round(w.uvIndex)} · ${tp(`uv.level.${lvl}`)}`,
    });
  }

  return (
    <section className="rounded-2xl border border-border bg-card p-4">
      <h3 className="pb-3 text-sm font-semibold text-text-primary">{tp('otherStats')}</h3>
      <div className="grid grid-cols-2 gap-3">
        {cells.map((c) => (
          <div key={c.label} className="flex items-center gap-2">
            <c.Icon size={18} className="shrink-0 text-muted" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs text-muted">{c.label}</p>
              <p className="truncate text-sm font-semibold text-text-primary">{c.value}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function uvLevel(uv: number): 'low' | 'moderate' | 'high' | 'veryHigh' | 'extreme' {
  if (uv < 3) return 'low';
  if (uv < 6) return 'moderate';
  if (uv < 8) return 'high';
  if (uv < 11) return 'veryHigh';
  return 'extreme';
}
