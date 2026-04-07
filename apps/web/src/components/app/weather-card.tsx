'use client';

import {
  type Icon,
  IconCloud,
  IconCloudRain,
  IconCloudFog,
  IconCloudStorm,
  IconDroplet,
  IconEye,
  IconSnowflake,
  IconSun,
  IconTemperature,
  IconWind,
} from '@tabler/icons-react';

import { formatTemp, formatTimeAgo, formatVisibility, formatWind, getWeatherStyle } from '@notifio/shared';
import type { AirQualityData, WeatherData } from '@notifio/shared';

import { AqiIndicator } from './aqi-indicator';

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

function getWeatherIcon(iconName: string): Icon {
  return WEATHER_ICON_MAP[iconName] ?? IconTemperature;
}

interface WeatherCardProps {
  weather: WeatherData | null;
  isLoading: boolean;
  error: string | null;
  locationLabel: string;
  onRetry?: () => void;
  airQuality?: AirQualityData | null;
  aqiLoading?: boolean;
}

export function WeatherCard({ weather, isLoading, error, locationLabel, onRetry, airQuality, aqiLoading = false }: WeatherCardProps) {
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
            Try again
          </button>
        )}
      </div>
    );
  }

  if (!weather) return null;

  const style = getWeatherStyle(weather.condition);
  const WeatherIcon = getWeatherIcon(style.iconName);

  const muted80 = `${style.textColor}CC`;
  const muted60 = `${style.textColor}99`;
  const muted40 = `${style.textColor}66`;

  return (
    <div
      className="overflow-hidden rounded-2xl p-6"
      style={{
        background: `linear-gradient(135deg, ${style.gradient[0]}, ${style.gradient[1]})`,
        color: style.textColor,
      }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="font-medium" style={{ color: muted80 }}>
            {locationLabel}
          </p>
          <p className="text-sm" style={{ color: muted60 }}>
            {style.label}
          </p>
        </div>
        <WeatherIcon size={40} style={{ color: muted80 }} />
      </div>

      <div className="my-4">
        <p className="text-6xl font-bold">{formatTemp(weather.temperature)}</p>
        <p className="mt-1 text-sm" style={{ color: muted60 }}>
          Feels like {formatTemp(weather.feelsLike)}
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

      {(airQuality || aqiLoading) && (
        <div className="mt-3 border-t pt-3" style={{ borderColor: `${style.textColor}1A` }}>
          <AqiIndicator airQuality={airQuality ?? null} isLoading={aqiLoading} />
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
