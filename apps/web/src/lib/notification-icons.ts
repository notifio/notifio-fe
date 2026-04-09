import { ICON_PATHS } from './map-pin-config';

const CATEGORY_ICON_MAP: Record<string, { path: string; color: string }> = {
  'weather': { path: ICON_PATHS.weather, color: '#FF3B30' },
  'weather-warning': { path: ICON_PATHS.accident, color: '#FF3B30' },
  'traffic': { path: ICON_PATHS.congestion, color: '#8B5CF6' },
  'outage-electricity': { path: ICON_PATHS.electricity, color: '#EAB308' },
  'outage-water': { path: ICON_PATHS.water, color: '#3A86FF' },
  'outage-heat': { path: ICON_PATHS.heat, color: '#FF3B30' },
  'outage-gas': { path: ICON_PATHS.gas, color: '#FF7A2F' },
  'air-quality': { path: ICON_PATHS.weather, color: '#1D9E75' },
  'planned-events': { path: ICON_PATHS.event, color: '#3A86FF' },
  'name-day': { path: ICON_PATHS.event, color: '#D4537E' },
  'pollen': { path: ICON_PATHS.weather, color: '#639922' },
  'earthquake': { path: ICON_PATHS.accident, color: '#FF3B30' },
};

export function getNotificationIcon(category: string): { path: string; color: string } {
  return CATEGORY_ICON_MAP[category] ?? { path: ICON_PATHS.other, color: '#6B7A99' };
}
