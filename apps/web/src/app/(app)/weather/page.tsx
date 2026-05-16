'use client';

import { IconArrowLeft } from '@tabler/icons-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

import { DEFAULT_LOCATION } from '@notifio/shared/geo';
import { useAirQuality, usePollen, useWeather } from '@notifio/shared/hooks';

import { AqiCard } from '@/components/weather/aqi-card';
import { DailyForecast } from '@/components/weather/daily-forecast';
import { HourlyForecast } from '@/components/weather/hourly-forecast';
import { OtherStatsGrid } from '@/components/weather/other-stats-grid';
import { PollenCard } from '@/components/weather/pollen-card';
import { RadarMini } from '@/components/weather/radar-mini';
import { SunMoonCard } from '@/components/weather/sun-moon-card';
import { WeatherHero } from '@/components/weather/weather-hero';
import { useForecast } from '@/hooks/use-forecast';
import { useRadarConfig } from '@/hooks/use-radar-config';
import { useUserLocation } from '@/hooks/use-user-location';

export default function WeatherPage() {
  const tcommon = useTranslations('common');
  const twp = useTranslations('weatherPage');
  const tmap = useTranslations('map');
  const { location: userLocation, isGps } = useUserLocation();
  const center = userLocation ?? DEFAULT_LOCATION;

  // useWeather + useAirQuality from shared are currently locked to
  // DEFAULT_LOCATION (Bratislava). Follow-up to accept coords; for now
  // the hero will display DEFAULT_LOCATION's weather + AQI even if user
  // is elsewhere. usePollen + useForecast honor the resolved center.
  const { weather, isLoading: weatherLoading, error: weatherError } = useWeather();
  const { airQuality } = useAirQuality();
  const { pollen } = usePollen(center);
  const { forecast } = useForecast(center);
  const { config: radarConfig } = useRadarConfig();

  const locationLabel = isGps ? tmap('yourLocation') : tmap('defaultLocation');

  if (weatherError && !weather) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <BackLink label={tcommon('back')} />
        <div className="mt-6 rounded-2xl border border-danger/30 bg-danger/10 p-6 text-center">
          <h2 className="text-base font-semibold text-danger">{twp('error.title')}</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 md:py-10">
      <BackLink label={tcommon('back')} />

      <div className="mt-4">
        <WeatherHero
          weather={weather}
          locationLabel={locationLabel}
          isLoading={weatherLoading}
        />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-4">
          {forecast && <HourlyForecast hourly={forecast.hourly} />}
          {forecast && <DailyForecast daily={forecast.daily} />}
        </div>
        <div className="flex flex-col gap-4">
          <AqiCard aqi={airQuality} />
          <PollenCard pollen={pollen} />
          <SunMoonCard sunrise={weather?.sunrise} sunset={weather?.sunset} />
          {weather && <OtherStatsGrid weather={weather} />}
          {radarConfig && <RadarMini config={radarConfig} center={center} />}
        </div>
      </div>
    </div>
  );
}

function BackLink({ label }: { label: string }) {
  return (
    <Link
      href="/dashboard"
      className="inline-flex items-center gap-1 text-sm text-muted transition-colors hover:text-text-primary"
    >
      <IconArrowLeft size={16} />
      {label}
    </Link>
  );
}
