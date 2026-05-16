'use client';

import {
  type Icon,
  IconCloud,
  IconCloudFog,
  IconCloudRain,
  IconCloudStorm,
  IconMapPin,
  IconMoon,
  IconSnowflake,
  IconSun,
  IconTemperature,
} from '@tabler/icons-react';
import { useTranslations } from 'next-intl';

import { WEATHER_HERO_COLORS, getWeatherStyle } from '@notifio/shared';
import type { WeatherData } from '@notifio/shared';

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

interface Props {
  weather: WeatherData | null;
  locationLabel: string;
  isLoading: boolean;
}

export function WeatherHero({ weather, locationLabel, isLoading }: Props) {
  const t = useTranslations('weather');
  const tcond = useTranslations('weatherConditions');

  if (isLoading || !weather) {
    return <div className="h-72 animate-pulse rounded-2xl bg-card" />;
  }

  const bg = WEATHER_HERO_COLORS[weather.condition] ?? WEATHER_HERO_COLORS.unknown;
  const conditionLabel = tcond.has(weather.condition)
    ? tcond(weather.condition)
    : weather.description;
  const HeroIcon = iconFor(weather.condition);

  return (
    <div
      className="weather-hero rounded-2xl p-8 text-white"
      data-condition={weather.condition}
      style={{ backgroundColor: bg }}
    >
      {/* `relative z-10` keeps content above the ::before particle layer. */}
      <div className="relative z-10 flex flex-col items-center text-center">
        <div className="flex items-center gap-1.5 self-start text-sm opacity-90">
          <IconMapPin size={16} />
          <span>{locationLabel}</span>
        </div>
        <HeroIcon size={72} strokeWidth={1.4} className="mt-4 text-white drop-shadow-md" />
        <p className="mt-2 text-sm opacity-80">{conditionLabel}</p>
        <p className="mt-3 text-7xl font-bold leading-none">
          {Math.round(weather.temperature)}°
        </p>
        <p className="mt-2 text-sm opacity-80">
          {t('feelsLike')} {Math.round(weather.feelsLike)}°
        </p>
      </div>
    </div>
  );
}
