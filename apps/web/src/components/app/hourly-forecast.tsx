'use client';

import {
  type Icon,
  IconCloud,
  IconCloudFog,
  IconCloudRain,
  IconCloudStorm,
  IconMoon,
  IconSnowflake,
  IconSun,
  IconTemperature,
} from '@tabler/icons-react';
import { useLocale, useTranslations } from 'next-intl';

import type { ForecastHourly } from '@notifio/api-client';
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

interface HourlyForecastProps {
  hourly: ForecastHourly[];
}

export function HourlyForecast({ hourly }: HourlyForecastProps) {
  const t = useTranslations('forecast');
  const locale = useLocale();

  if (hourly.length === 0) return null;

  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="flex items-center justify-between pb-3">
        <h3 className="text-sm font-medium text-text-primary">{t('hourly.section')}</h3>
        <span className="text-xs text-muted">{hourly.length} h</span>
      </div>
      <div className="-mx-2 flex gap-3 overflow-x-auto px-2 pb-1">
        {hourly.map((h, i) => {
          const HourIcon = iconFor(h.condition);
          const date = new Date(h.timestamp);
          const label =
            i === 0
              ? t('now')
              : date.toLocaleTimeString(locale, { hour: '2-digit', minute: undefined });
          return (
            <div
              key={h.timestamp}
              className="flex min-w-[44px] flex-col items-center gap-1"
            >
              <span className="text-xs text-muted">{label}</span>
              <HourIcon size={22} className="text-text-primary" strokeWidth={1.8} />
              <span className="text-sm font-semibold text-text-primary">
                {formatTemp(h.temperatureC)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
