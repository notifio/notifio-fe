'use client';

import {
  type Icon,
  IconCloud,
  IconCloudFog,
  IconCloudRain,
  IconCloudStorm,
  IconSnowflake,
  IconSun,
  IconTemperature,
} from '@tabler/icons-react';
import { useLocale, useTranslations } from 'next-intl';
import { useMemo } from 'react';

import type { ForecastHourly } from '@notifio/api-client';
import { getWeatherStyle } from '@notifio/shared';

const ICON_MAP: Record<string, Icon> = {
  Sun: IconSun,
  Cloud: IconCloud,
  CloudRain: IconCloudRain,
  CloudDrizzle: IconCloudRain,
  CloudLightning: IconCloudStorm,
  Snowflake: IconSnowflake,
  CloudFog: IconCloudFog,
  Haze: IconCloudFog,
  Thermometer: IconTemperature,
};

function iconFor(condition: string): Icon {
  const style = getWeatherStyle(condition);
  return ICON_MAP[style.iconName] ?? IconTemperature;
}

interface Props {
  hourly: ForecastHourly[];
}

export function HourlyForecast({ hourly }: Props) {
  const t = useTranslations('forecast');
  const locale = useLocale();

  // BUG FIX: slice from current hour forward. BE returns 24h from the
  // forecast-window start (often midnight); show only what's actually
  // upcoming. 30-min slack so the "now" tile shows even if its timestamp
  // is in the very recent past.
  const fromNow = useMemo(() => {
    const cutoff = Date.now() - 30 * 60_000;
    return hourly.filter((h) => new Date(h.timestamp).getTime() >= cutoff);
  }, [hourly]);

  if (fromNow.length === 0) return null;

  return (
    <section className="rounded-2xl border border-border bg-card p-4">
      <header className="flex items-center justify-between pb-3">
        <h3 className="text-sm font-semibold text-text-primary">{t('hourly.section')}</h3>
        <span className="text-xs text-muted">{fromNow.length} h</span>
      </header>
      <div className="-mx-2 flex gap-3 overflow-x-auto px-2 pb-1">
        {fromNow.map((h, i) => {
          const HourIcon = iconFor(h.condition);
          const label =
            i === 0
              ? t('now')
              : new Date(h.timestamp).toLocaleTimeString(locale, {
                  hour: 'numeric',
                  hour12: false,
                });
          return (
            <div
              key={h.timestamp}
              className="flex min-w-[48px] flex-col items-center gap-1"
            >
              <span className="text-xs text-muted">{label}</span>
              <HourIcon size={22} className="text-text-primary" strokeWidth={1.8} />
              <span className="text-sm font-semibold text-text-primary">
                {Math.round(h.temperatureC)}°
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
