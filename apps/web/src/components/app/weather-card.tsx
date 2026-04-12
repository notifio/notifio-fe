'use client';

import {
  type Icon,
  IconCloud,
  IconCloudRain,
  IconCloudFog,
  IconCloudStorm,
  IconDroplet,
  IconEye,
  IconMoon,
  IconSnowflake,
  IconSun,
  IconTemperature,
  IconWind,
} from '@tabler/icons-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { formatTemp, formatTimeAgo, formatVisibility, formatWind, getWeatherStyle } from '@notifio/shared';
import type { AirQualityData, WeatherData } from '@notifio/shared';

import { AqiChip, AqiDetailPanel } from './aqi-indicator';
import { PollenChip, PollenDetailPanel } from './pollen-indicator';

// ── Icon mapping ─────────────────────────────────────────────────────

const WEATHER_ICON_MAP: Record<string, Icon> = {
  Sun: IconSun,
  Cloud: IconCloud,
  CloudRain: IconCloudRain,
  CloudDrizzle: IconCloudRain,
  CloudLightning: IconCloudStorm,
  Snowflake: IconSnowflake,
  CloudFog: IconCloudFog,
  Haze: IconCloudFog,
  Wind: IconWind,
  Thermometer: IconTemperature,
};

function getWeatherIcon(iconName: string, isNight: boolean): Icon {
  if (isNight && (iconName === 'Sun' || iconName === 'Cloud')) return IconMoon;
  return WEATHER_ICON_MAP[iconName] ?? IconTemperature;
}

// ── Night detection ──────────────────────────────────────────────────

function isNightTime(weather: WeatherData): boolean {
  if (weather.icon) return weather.icon.endsWith('n');
  if (weather.sunrise && weather.sunset) {
    const now = Date.now();
    const rise = new Date(weather.sunrise).getTime();
    const set = new Date(weather.sunset).getTime();
    return now < rise || now > set;
  }
  return false;
}

const NIGHT_GRADIENT: [string, string] = ['#1E293B', '#334155'];

// ── Pollen types ─────────────────────────────────────────────────────

export interface PollenData {
  level: string;
  dominant: string;
  value: number;
  unit: string;
  components?: { [key: string]: number | null };
}

// ── Component ────────────────────────────────────────────────────────

type ExpandedChip = 'aqi' | 'pollen' | null;

interface WeatherCardProps {
  weather: WeatherData | null;
  isLoading: boolean;
  error: string | null;
  locationLabel: string;
  onRetry?: () => void;
  airQuality?: AirQualityData | null;
  aqiLoading?: boolean;
  pollen?: PollenData | null;
}

export function WeatherCard({
  weather,
  isLoading,
  error,
  locationLabel,
  onRetry,
  airQuality,
  aqiLoading = false,
  pollen,
}: WeatherCardProps) {
  const t = useTranslations('weather');
  const [expandedChip, setExpandedChip] = useState<ExpandedChip>(null);

  const toggleChip = (chip: ExpandedChip) =>
    setExpandedChip((prev) => (prev === chip ? null : chip));

  if (isLoading) {
    return <div className="h-48 animate-pulse rounded-2xl bg-card" />;
  }

  if (error) {
    return (
      <div className="flex h-48 flex-col items-center justify-center gap-3 rounded-2xl bg-danger/10 p-6">
        <p className="text-sm text-danger">{error}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="rounded-lg bg-danger/15 px-4 py-2 text-sm font-medium text-danger transition-colors hover:bg-danger/25"
          >
            {t('feelsLike')}
          </button>
        )}
      </div>
    );
  }

  if (!weather) return null;

  const night = isNightTime(weather);
  const style = getWeatherStyle(weather.condition);
  const WeatherIcon = getWeatherIcon(style.iconName, night);

  const gradient = night ? NIGHT_GRADIENT : style.gradient;
  const textColor = night ? '#E2E8F0' : style.textColor;

  const muted80 = `${textColor}CC`;
  const muted60 = `${textColor}99`;
  const muted40 = `${textColor}66`;

  let weatherLabel = style.label;
  if (night) {
    const cond = weather.condition.toLowerCase();
    if (cond.includes('clear') || cond === 'sunny') {
      weatherLabel = t('clearNight');
    } else if (cond.includes('cloud') || cond.includes('overcast')) {
      weatherLabel = t('cloudyNight');
    }
  }

  const hasChips = airQuality || aqiLoading || pollen;

  return (
    <div
      className="overflow-hidden rounded-2xl p-6"
      style={{
        background: `linear-gradient(135deg, ${gradient[0]}, ${gradient[1]})`,
        color: textColor,
      }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="font-medium" style={{ color: muted80 }}>
            {locationLabel}
          </p>
          <p className="text-sm" style={{ color: muted60 }}>
            {weatherLabel}
          </p>
        </div>
        <WeatherIcon size={40} style={{ color: muted80 }} />
      </div>

      <div className="my-4">
        <p className="text-6xl font-bold">{formatTemp(weather.temperature)}</p>
        <p className="mt-1 text-sm" style={{ color: muted60 }}>
          {t('feelsLike')} {formatTemp(weather.feelsLike)}
        </p>
      </div>

      <div className="flex items-center gap-4 text-sm" style={{ color: muted80 }}>
        <span className="inline-flex items-center gap-1">
          <IconWind size={14} />
          {formatWind(weather.windSpeed, weather.windDirection)}
        </span>
        <span className="inline-flex items-center gap-1">
          <IconDroplet size={14} />
          {weather.humidity}%
        </span>
        <span className="inline-flex items-center gap-1">
          <IconEye size={14} />
          {formatVisibility(weather.visibility)}
        </span>
      </div>

      {/* AQI + Pollen chips */}
      {hasChips && (
        <div className="mt-3 space-y-2">
          <div className="flex items-center gap-2">
            {(airQuality || aqiLoading) && (
              <AqiChip
                airQuality={airQuality ?? null}
                isLoading={aqiLoading}
                isExpanded={expandedChip === 'aqi'}
                dimmed={expandedChip !== null && expandedChip !== 'aqi'}
                onToggle={() => toggleChip('aqi')}
              />
            )}
            {pollen && (
              <PollenChip
                pollen={pollen}
                isExpanded={expandedChip === 'pollen'}
                dimmed={expandedChip !== null && expandedChip !== 'pollen'}
                onToggle={() => toggleChip('pollen')}
              />
            )}
          </div>
          {expandedChip === 'aqi' && airQuality && (
            <AqiDetailPanel airQuality={airQuality} onClose={() => setExpandedChip(null)} />
          )}
          {expandedChip === 'pollen' && pollen && (
            <PollenDetailPanel pollen={pollen} onClose={() => setExpandedChip(null)} />
          )}
        </div>
      )}

      <div className="mt-3 text-right">
        <span className="text-xs" style={{ color: muted40 }}>
          {formatTimeAgo(weather.updatedAt)}
        </span>
      </div>
    </div>
  );
}
