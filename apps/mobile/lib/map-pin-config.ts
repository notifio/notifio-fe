import type { Icon } from '@tabler/icons-react-native';
import {
  IconAlertTriangle,
  IconBarrierBlock,
  IconBolt,
  IconCalendarEvent,
  IconCampfire,
  IconCar,
  IconCarCrash,
  IconCloudBolt,
  IconCone2,
  IconDroplet,
  IconDropletFilled,
  IconFlame,
  IconFlameOff,
  IconFlower,
  IconInfoCircle,
  IconRipple,
  IconWifiOff,
  IconWindmill,
} from '@tabler/icons-react-native';

import { alertTypeColors } from '@notifio/ui';

import type { MapPin, MapPinSource } from './normalize-pins';

export interface PinStyle {
  /** Hex color for marker fill */
  color: string;
  /** i18n key for the human-readable label */
  label: string;
  /** Tabler icon component */
  icon: Icon;
}

// Per-incident-type colors (matches web exactly)
export const TRAFFIC_TYPE_COLORS: Record<string, string> = {
  accident: '#FF3B30',
  construction: '#FF7A2F',
  road_closure: '#991B1B',
  congestion: '#EAB308',
  flooding: '#3A86FF',
  event: '#3A86FF',
  other: '#6B7A99',
};

// Per-incident-type icons (matches web exactly)
export const TRAFFIC_ICON_MAP: Record<string, Icon> = {
  accident: IconCarCrash,
  construction: IconCone2,
  road_closure: IconBarrierBlock,
  congestion: IconCar,
  flooding: IconDropletFilled,
  event: IconCalendarEvent,
  other: IconInfoCircle,
};

// Source-level styles. Pin colors match web's map-pin-config exactly.
const SOURCE_STYLES: Record<MapPinSource, PinStyle> = {
  electricity: { color: '#EAB308', label: 'mapFilters.electricity', icon: IconBolt },
  water:       { color: '#3A86FF', label: 'mapFilters.water',       icon: IconDroplet },
  heat:        { color: '#FF3B30', label: 'mapFilters.heat',        icon: IconFlame },
  gas:         { color: '#FF7A2F', label: 'mapFilters.gas',         icon: IconFlameOff },
  traffic:     { color: '#8B5CF6', label: 'mapFilters.traffic',     icon: IconCarCrash },
  air_quality:      { color: '#1D9E75', label: 'mapFilters.air_quality',      icon: IconWindmill },
  pollen:           { color: '#A78BFA', label: 'mapFilters.pollen',           icon: IconFlower },
  hydrology:        { color: '#38BDF8', label: 'mapFilters.hydrology',        icon: IconRipple },
  wildfire:         { color: '#FB7121', label: 'mapFilters.wildfire',         icon: IconCampfire },
  outage_internet:  { color: '#8B9BB5', label: 'mapFilters.outage_internet',  icon: IconWifiOff },
  weather_alerts:   { color: '#F59E0B', label: 'mapFilters.weather_alerts',   icon: IconAlertTriangle },
  weather_forecast: { color: '#D97706', label: 'mapFilters.weather_forecast', icon: IconCloudBolt },
  event:       { color: alertTypeColors.event, label: 'mapFilters.events', icon: IconCalendarEvent },
};

/** Resolves the visual style for a pin, accounting for traffic incident subtype. */
export function getPinStyle(pin: MapPin): PinStyle {
  if (pin.source === 'traffic' && pin.incidentType) {
    const trafficColor = TRAFFIC_TYPE_COLORS[pin.incidentType];
    const TrafficIcon = TRAFFIC_ICON_MAP[pin.incidentType] ?? IconInfoCircle;
    if (trafficColor) {
      return { color: trafficColor, label: 'mapFilters.traffic', icon: TrafficIcon };
    }
  }
  return SOURCE_STYLES[pin.source];
}

export const MAP_PIN_STYLES = SOURCE_STYLES;
export const MAP_FILTER_SOURCES: MapPinSource[] = [
  'electricity',
  'water',
  'gas',
  'heat',
  'traffic',
  'air_quality',
  'pollen',
  'hydrology',
  'wildfire',
  'outage_internet',
  'weather_alerts',
  'weather_forecast',
];

export const TRAFFIC_SUBCATEGORIES = [
  'accident',
  'construction',
  'road_closure',
  'congestion',
  'event',
  'other',
] as const;

export type TrafficIncidentType = typeof TRAFFIC_SUBCATEGORIES[number];

// Step 8: gating tier per source. Mirrors web's map-pin-config + the BE
// catalogue: only `traffic`, `air_quality`, `pollen` require a paid
// tier. `event` is the generic teaser fallback so it stays FREE — the
// effective gating happens on the BE source code via the teaser shim.
export const SOURCE_REQUIRED_TIER: Record<MapPinSource, 'FREE' | 'PLUS' | 'PRO'> = {
  electricity: 'FREE',
  water: 'FREE',
  gas: 'FREE',
  heat: 'FREE',
  traffic: 'PLUS',
  air_quality: 'PLUS',
  pollen: 'PRO',
  hydrology: 'FREE',
  wildfire: 'FREE',
  outage_internet: 'FREE',
  weather_alerts: 'FREE',
  weather_forecast: 'FREE',
  event: 'FREE',
};
