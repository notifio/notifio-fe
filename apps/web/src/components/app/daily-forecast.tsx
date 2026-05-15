'use client';

import {
  type Icon,
  IconCloud,
  IconCloudFog,
  IconCloudRain,
  IconCloudStorm,
  IconDroplet,
  IconMoon,
  IconSnowflake,
  IconSun,
  IconTemperature,
} from '@tabler/icons-react';
import { useLocale, useTranslations } from 'next-intl';

import type { ForecastDaily } from '@notifio/api-client';
import { formatTemp, getWeatherStyle } from '@notifio/shared';

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
  Moon: IconMoon,
};

function iconFor(condition: string): Icon {
  const style = getWeatherStyle(condition);
  return ICON_MAP[style.iconName] ?? IconTemperature;
}

interface DailyForecastProps {
  daily: ForecastDaily[];
}

export function DailyForecast({ daily }: DailyForecastProps) {
  const t = useTranslations('forecast');
  const locale = useLocale();

  if (daily.length === 0) return null;

  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="flex items-center justify-between pb-2">
        <h3 className="text-sm font-medium text-text-primary">{t('daily.section')}</h3>
        <span className="text-xs text-muted">{daily.length} {t('days')}</span>
      </div>
      <div className="divide-y divide-border">
        {daily.map((d, i) => {
          const DayIcon = iconFor(d.condition);
          const label =
            i === 0
              ? t('today')
              : i === 1
                ? t('tomorrow')
                : new Date(d.date).toLocaleDateString(locale, { weekday: 'short' });
          return (
            <div key={d.date} className="flex items-center gap-3 py-2">
              <span className="flex-1 text-sm font-medium text-text-primary">{label}</span>
              <DayIcon size={20} className="text-text-primary" strokeWidth={1.8} />
              <span className="inline-flex w-12 items-center gap-0.5 text-xs text-muted">
                <IconDroplet size={12} />
                {d.precipitationProbabilityPct}%
              </span>
              <span className="min-w-[80px] text-right text-sm font-semibold text-text-primary">
                {formatTemp(d.minC)} <span className="text-muted">·</span> {formatTemp(d.maxC)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
