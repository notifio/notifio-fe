import { ICON_PATHS } from './map-pin-config';

// Maps notification category codes to icon paths + colors.
// The API uses BOTH underscore (outage_electric) and hyphen (outage-electricity)
// variants depending on the source, so we register all known forms.
const CATEGORY_ICON_MAP: Record<string, { paths: string[]; color: string }> = {
  // Weather
  'weather': { paths: ICON_PATHS.weather, color: '#FF3B30' },
  'weather-warning': { paths: ICON_PATHS.accident, color: '#FF3B30' },
  'weather_warning': { paths: ICON_PATHS.accident, color: '#FF3B30' },
  // Traffic
  'traffic': { paths: ICON_PATHS.congestion, color: '#8B5CF6' },
  // Outages — hyphenated (legacy)
  'outage-electricity': { paths: ICON_PATHS.electricity, color: '#EAB308' },
  'outage-water': { paths: ICON_PATHS.water, color: '#3A86FF' },
  'outage-heat': { paths: ICON_PATHS.heat, color: '#FF3B30' },
  'outage-gas': { paths: ICON_PATHS.gas, color: '#FF7A2F' },
  // Outages — underscore (real API)
  'outage_electric': { paths: ICON_PATHS.electricity, color: '#EAB308' },
  'outage_electricity': { paths: ICON_PATHS.electricity, color: '#EAB308' },
  'outage_water': { paths: ICON_PATHS.water, color: '#3A86FF' },
  'outage_heat': { paths: ICON_PATHS.heat, color: '#FF3B30' },
  'outage_gas': { paths: ICON_PATHS.gas, color: '#FF7A2F' },
  // Other
  'air-quality': { paths: ICON_PATHS.weather, color: '#1D9E75' },
  'air_quality': { paths: ICON_PATHS.weather, color: '#1D9E75' },
  'planned-events': { paths: ICON_PATHS.event, color: '#3A86FF' },
  'planned_events': { paths: ICON_PATHS.event, color: '#3A86FF' },
  'name-day': { paths: ICON_PATHS.event, color: '#D4537E' },
  'name_day': { paths: ICON_PATHS.event, color: '#D4537E' },
  'pollen': { paths: ICON_PATHS.weather, color: '#639922' },
  'earthquake': { paths: ICON_PATHS.accident, color: '#FF3B30' },
};

export function getNotificationIcon(category: string): { paths: string[]; color: string } {
  return CATEGORY_ICON_MAP[category] ?? { paths: ICON_PATHS.other, color: '#6B7A99' };
}
