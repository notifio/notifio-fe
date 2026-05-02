import {
  IconDroplet,
  IconGauge,
  IconTemperature,
  IconWind,
} from '@tabler/icons-react-native';

import type { TablerIcon } from '../../ui/icon';

export interface WeatherThresholdCodeConfig {
  code: string;
  icon: TablerIcon;
  unit: string;
  labelKey: string;
}

export const WEATHER_THRESHOLD_CODES: readonly WeatherThresholdCodeConfig[] = [
  { code: 'temp_high', icon: IconTemperature, unit: '°C', labelKey: 'tempHigh' },
  { code: 'temp_low', icon: IconTemperature, unit: '°C', labelKey: 'tempLow' },
  { code: 'wind_speed', icon: IconWind, unit: 'km/h', labelKey: 'windSpeed' },
  { code: 'humidity', icon: IconDroplet, unit: '%', labelKey: 'humidity' },
  { code: 'pressure', icon: IconGauge, unit: 'hPa', labelKey: 'pressure' },
] as const;

/**
 * Format a threshold value with its unit. Per design rules:
 * - `°C` and `%` are appended without a separating space (e.g. `32°C`, `80%`)
 * - All other units (`km/h`, `hPa`) include a separating space (e.g. `60 km/h`)
 */
export function formatThresholdValue(value: number, unit: string): string {
  if (unit === '°C' || unit === '%') return `${value}${unit}`;
  return `${value} ${unit}`;
}
