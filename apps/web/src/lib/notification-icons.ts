import type { Icon } from '@tabler/icons-react';
import {
  IconBolt,
  IconCalendarEvent,
  IconCar,
  IconCarCrash,
  IconCloud,
  IconDroplet,
  IconFlame,
  IconFlameOff,
  IconInfoCircle,
} from '@tabler/icons-react';

// Maps notification category codes to icon components + colors.
// The API uses BOTH underscore (outage_electric) and hyphen (outage-electricity)
// variants depending on the source, so we register all known forms.
const CATEGORY_ICON_MAP: Record<string, { icon: Icon; color: string }> = {
  // Weather
  'weather': { icon: IconCloud, color: '#FF3B30' },
  'weather-warning': { icon: IconCarCrash, color: '#FF3B30' },
  'weather_warning': { icon: IconCarCrash, color: '#FF3B30' },
  // Traffic
  'traffic': { icon: IconCar, color: '#8B5CF6' },
  // Outages — hyphenated (legacy)
  'outage-electricity': { icon: IconBolt, color: '#EAB308' },
  'outage-water': { icon: IconDroplet, color: '#3A86FF' },
  'outage-heat': { icon: IconFlame, color: '#FF3B30' },
  'outage-gas': { icon: IconFlameOff, color: '#FF7A2F' },
  // Outages — underscore (real API)
  'outage_electric': { icon: IconBolt, color: '#EAB308' },
  'outage_electricity': { icon: IconBolt, color: '#EAB308' },
  'outage_water': { icon: IconDroplet, color: '#3A86FF' },
  'outage_heat': { icon: IconFlame, color: '#FF3B30' },
  'outage_gas': { icon: IconFlameOff, color: '#FF7A2F' },
  // Other
  'air-quality': { icon: IconCloud, color: '#1D9E75' },
  'air_quality': { icon: IconCloud, color: '#1D9E75' },
  'planned-events': { icon: IconCalendarEvent, color: '#3A86FF' },
  'planned_events': { icon: IconCalendarEvent, color: '#3A86FF' },
  'name-day': { icon: IconCalendarEvent, color: '#D4537E' },
  'name_day': { icon: IconCalendarEvent, color: '#D4537E' },
  'pollen': { icon: IconCloud, color: '#639922' },
  'earthquake': { icon: IconCarCrash, color: '#FF3B30' },
};

export function getNotificationIcon(category: string): { icon: Icon; color: string } {
  return CATEGORY_ICON_MAP[category] ?? { icon: IconInfoCircle, color: '#6B7A99' };
}
