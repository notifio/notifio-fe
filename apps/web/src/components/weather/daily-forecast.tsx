'use client';

import {
  type Icon,
  IconCloud,
  IconCloudFog,
  IconCloudRain,
  IconCloudStorm,
  IconDroplet,
  IconSnowflake,
  IconSun,
  IconTemperature,
} from '@tabler/icons-react';
import { useLocale, useTranslations } from 'next-intl';

import type { ForecastDaily } from '@notifio/api-client';
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
  daily: ForecastDaily[];
}

export function DailyForecast({ daily }: Props) {
  const t = useTranslations('forecast');
  const locale = useLocale();

  if (daily.length === 0) return null;

  const labelForDay = (date: string, index: number) => {
    if (index === 0) return t('today');
    if (index === 1) return t('tomorrow');
    if (index === 2 && t.has('dayAfter')) return t('dayAfter');
    return new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(new Date(date));
  };

  return (
    <section className="rounded-2xl border border-border bg-card p-4">
      <header className="flex items-center justify-between pb-2">
        <h3 className="text-sm font-semibold text-text-primary">{t('daily.section')}</h3>
        <span className="text-xs text-muted">
          {daily.length} {t.has('days') ? t('days') : 'd'}
        </span>
      </header>
      <div className="divide-y divide-border">
        {daily.map((d, i) => {
          const DayIcon = iconFor(d.condition);
          return (
            <div key={d.date} className="flex items-center gap-3 py-2">
              <span className="flex-1 text-sm font-medium text-text-primary">
                {labelForDay(d.date, i)}
              </span>
              <DayIcon size={20} className="text-text-primary" strokeWidth={1.8} />
              <span className="inline-flex w-12 items-center gap-0.5 text-xs text-muted">
                <IconDroplet size={12} />
                {d.precipitationProbabilityPct}%
              </span>
              <span className="min-w-[80px] text-right text-sm font-semibold text-text-primary">
                {Math.round(d.minC)}° <span className="text-muted">·</span> {Math.round(d.maxC)}°
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
