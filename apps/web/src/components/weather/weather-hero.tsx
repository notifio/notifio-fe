'use client';

import { IconMapPin } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';

import { WEATHER_HERO_COLORS } from '@notifio/shared';
import type { WeatherData } from '@notifio/shared';

interface Props {
  weather: WeatherData | null;
  locationLabel: string;
  isLoading: boolean;
}

export function WeatherHero({ weather, locationLabel, isLoading }: Props) {
  const t = useTranslations('weather');
  const tcond = useTranslations('weatherConditions');

  if (isLoading || !weather) {
    return (
      <div className="h-56 animate-pulse rounded-2xl bg-card" />
    );
  }

  const bg = WEATHER_HERO_COLORS[weather.condition] ?? WEATHER_HERO_COLORS.unknown;
  const conditionLabel = tcond.has(weather.condition)
    ? tcond(weather.condition)
    : weather.description;

  return (
    <div
      className="overflow-hidden rounded-2xl p-8 text-white"
      style={{ backgroundColor: bg }}
    >
      <div className="flex items-center gap-1.5 text-sm opacity-90">
        <IconMapPin size={16} />
        <span>{locationLabel}</span>
      </div>
      <p className="mt-1 text-sm opacity-80">{conditionLabel}</p>
      <p className="mt-4 text-7xl font-bold leading-none">
        {Math.round(weather.temperature)}°
      </p>
      <p className="mt-2 text-sm opacity-80">
        {t('feelsLike')} {Math.round(weather.feelsLike)}°
      </p>
    </div>
  );
}
