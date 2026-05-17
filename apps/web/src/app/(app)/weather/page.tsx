'use client';

import { IconArrowLeft } from '@tabler/icons-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

import { DEFAULT_LOCATION } from '@notifio/shared/geo';
import { useAirQuality, usePollen, useWeather } from '@notifio/shared/hooks';

import { WeatherCard } from '@/components/app/weather-card';
import { AqiCard } from '@/components/weather/aqi-card';
import { DailyForecast } from '@/components/weather/daily-forecast';
import { HourlyForecast } from '@/components/weather/hourly-forecast';
import { OtherStatsGrid } from '@/components/weather/other-stats-grid';
import { PollenCard } from '@/components/weather/pollen-card';
import { RadarMini } from '@/components/weather/radar-mini';
import { SunMoonCard } from '@/components/weather/sun-moon-card';
import { useForecast } from '@/hooks/use-forecast';
import { useLocations } from '@/hooks/use-locations';
import { useRadarConfig } from '@/hooks/use-radar-config';
import { useUserLocation } from '@/hooks/use-user-location';

/**
 * Resolve a human-readable label for the location strip:
 *   1. User saved location matching center (within ~1.5km)
 *   2. GPS — "GPS · {lat.toFixed(2)}, {lng.toFixed(2)}" so it's informative
 *      vs the generic "Tvoja poloha"
 *   3. Non-GPS default — the translated default-location string
 *
 * Web doesn't have reverse-geocoding (mobile uses expo-location's native
 * API; no equivalent here). Closest-saved-match is a cheap stand-in;
 * proper reverse-geocode via Nominatim/BE is a follow-up.
 */
function resolveLocationLabel(
  center: { lat: number; lng: number },
  isGps: boolean,
  savedLocations: Array<{ lat: number; lng: number; customLabel: string | null; label: { name: string } }>,
  fallback: string,
): string {
  const nearby = savedLocations.find(
    (l) => Math.abs(l.lat - center.lat) < 0.015 && Math.abs(l.lng - center.lng) < 0.025,
  );
  if (nearby) {
    const base = nearby.customLabel ?? nearby.label.name;
    return isGps ? `${base} (GPS)` : base;
  }
  if (isGps) {
    return `GPS · ${center.lat.toFixed(2)}, ${center.lng.toFixed(2)}`;
  }
  return fallback;
}

export default function WeatherPage() {
  const tcommon = useTranslations('common');
  const twp = useTranslations('weatherPage');
  const tmap = useTranslations('map');
  const { location: userLocation, isGps } = useUserLocation();
  const center = userLocation ?? DEFAULT_LOCATION;
  const { locations } = useLocations();

  const { weather, isLoading: weatherLoading, error: weatherError, refresh } = useWeather();
  const { airQuality } = useAirQuality();
  const { pollen: pollenData } = usePollen(center);
  const { forecast } = useForecast(center);
  const { config: radarConfig } = useRadarConfig();

  const locationLabel = resolveLocationLabel(
    center,
    isGps,
    locations,
    tmap('defaultLocation'),
  );

  if (weatherError && !weather) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8">
        <BackLink label={tcommon('back')} />
        <div className="mt-6 rounded-2xl border border-danger/30 bg-danger/10 p-6 text-center">
          <h2 className="text-base font-semibold text-danger">{twp('error.title')}</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 md:py-10">
      <BackLink label={tcommon('back')} />

      <div className="mt-4">
        {/* Same WeatherCard as the dashboard but simplified — only
            location + condition + temp + feels-like + icon. AQI and
            pollen render as separate cards below. */}
        <WeatherCard
          weather={weather}
          isLoading={weatherLoading}
          error={weatherError}
          locationLabel={locationLabel}
          onRetry={refresh}
          variant="simplified"
        />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-4">
          {forecast && <HourlyForecast hourly={forecast.hourly} />}
          {forecast && <DailyForecast daily={forecast.daily} />}
          {radarConfig && <RadarMini config={radarConfig} center={center} />}
        </div>
        <div className="flex flex-col gap-4">
          <AqiCard aqi={airQuality} />
          <PollenCard pollen={pollenData} />
          <SunMoonCard sunrise={weather?.sunrise} sunset={weather?.sunset} />
          {weather && <OtherStatsGrid weather={weather} />}
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
