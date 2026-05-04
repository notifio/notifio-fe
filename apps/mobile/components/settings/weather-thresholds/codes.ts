import { IconCloudRain, IconSnowflake, IconTemperature, IconWind } from '@tabler/icons-react-native';

import type { TablerIcon } from '../../ui/icon';

export type WeatherThresholdTier = 'warning' | 'severe';

export type WeatherMetric =
  | 'highTemperature'
  | 'lowTemperature'
  | 'windSpeed'
  | 'rainfall'
  | 'snowfall';

export interface WeatherThresholdMetricConfig {
  metric: WeatherMetric;
  icon: TablerIcon;
  unit: string;
  min: number;
  max: number;
  step: number;
  defaults: { warning: number; severe: number };
  tiers: {
    warning: { code: string; labelKey: string };
    severe: { code: string; labelKey: string };
  };
}

/**
 * Canonical Weather Intelligence subcategory codes confirmed against
 * notifio-api/src/services/user-weather-threshold.service.ts. BE
 * rejects anything outside this set with HTTP 400.
 *
 * Two tiers per metric: a softer "warning" + a sharper "severe" variant.
 * Severe tier uses metric-specific labels in i18n (Frost / Severe wind /
 * Extreme heat) rather than a generic "Severe" word.
 */
export const WEATHER_THRESHOLD_METRICS: readonly WeatherThresholdMetricConfig[] = [
  {
    metric: 'highTemperature',
    icon: IconTemperature,
    unit: '°C',
    min: 20,
    max: 45,
    step: 1,
    defaults: { warning: 28, severe: 35 },
    tiers: {
      warning: { code: 'heat_warning', labelKey: 'highTemperature.warning' },
      severe: { code: 'extreme_heat_warning', labelKey: 'highTemperature.severe' },
    },
  },
  {
    metric: 'lowTemperature',
    icon: IconTemperature,
    unit: '°C',
    min: -30,
    max: 5,
    step: 1,
    defaults: { warning: -5, severe: -15 },
    tiers: {
      warning: { code: 'low_temperature_warning', labelKey: 'lowTemperature.warning' },
      severe: { code: 'frost_warning', labelKey: 'lowTemperature.severe' },
    },
  },
  {
    metric: 'windSpeed',
    icon: IconWind,
    unit: 'km/h',
    min: 30,
    max: 130,
    step: 5,
    defaults: { warning: 50, severe: 80 },
    tiers: {
      warning: { code: 'wind_warning', labelKey: 'windSpeed.warning' },
      severe: { code: 'severe_wind_warning', labelKey: 'windSpeed.severe' },
    },
  },
  {
    metric: 'rainfall',
    icon: IconCloudRain,
    unit: 'mm/h',
    min: 1,
    max: 50,
    step: 1,
    defaults: { warning: 10, severe: 25 },
    tiers: {
      warning: { code: 'rain_warning', labelKey: 'rainfall.warning' },
      severe: { code: 'heavy_rain_warning', labelKey: 'rainfall.severe' },
    },
  },
  {
    metric: 'snowfall',
    icon: IconSnowflake,
    unit: 'cm/h',
    min: 1,
    max: 30,
    step: 1,
    defaults: { warning: 5, severe: 15 },
    tiers: {
      warning: { code: 'snow_warning', labelKey: 'snowfall.warning' },
      severe: { code: 'heavy_snow_warning', labelKey: 'snowfall.severe' },
    },
  },
] as const;

export const ALL_BE_CODES: readonly string[] = WEATHER_THRESHOLD_METRICS.flatMap(
  (m) => [m.tiers.warning.code, m.tiers.severe.code],
);

/**
 * Format a threshold value with its unit. Per design rules:
 * - `°C` and `%` are appended without a separating space (e.g. `32°C`, `80%`)
 * - Other units (`km/h`, `hPa`) include a separating space (e.g. `60 km/h`)
 */
export function formatThresholdValue(value: number, unit: string): string {
  if (unit === '°C' || unit === '%') return `${value}${unit}`;
  return `${value} ${unit}`;
}
