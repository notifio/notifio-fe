import type { Icon } from '@tabler/icons-react';
import {
  IconAlertTriangle,
  IconBarrierBlock,
  IconBolt,
  IconCalendarEvent,
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
} from '@tabler/icons-react';

import type { MapPin, MapPinSource } from './normalize-pins';

export interface PinStyle {
  color: string;
  label: string;
  icon: Icon;
}

const TRAFFIC_ICON_MAP: Record<string, Icon> = {
  accident: IconCarCrash,
  construction: IconCone2,
  road_closure: IconBarrierBlock,
  congestion: IconCar,
  flooding: IconDropletFilled,
  event: IconCalendarEvent,
  other: IconInfoCircle,
};

// FE-P1.2: five categories used to render as the grey fallback
// "event" pin even though the BE serves them with a stable category
// code. Each gets its own colour + Tabler icon now so users can tell
// them apart on the map without opening the popup.
const SOURCE_STYLES: Record<MapPinSource, PinStyle> = {
  electricity: { color: '#EAB308', label: 'outages.electricity', icon: IconBolt },
  water: { color: '#3A86FF', label: 'outages.water', icon: IconDroplet },
  heat: { color: '#FF3B30', label: 'outages.heat', icon: IconFlame },
  gas: { color: '#FF7A2F', label: 'outages.gas', icon: IconFlameOff },
  traffic: { color: '#8B5CF6', label: 'traffic.title', icon: IconCarCrash },
  air_quality: { color: '#1D9E75', label: 'mapFilters.air_quality', icon: IconWindmill },
  pollen: { color: '#A78BFA', label: 'mapFilters.pollen', icon: IconFlower },
  hydrology: { color: '#38BDF8', label: 'mapFilters.hydrology', icon: IconRipple },
  wildfire: { color: '#FB7121', label: 'mapFilters.wildfire', icon: IconFlame },
  outage_internet: { color: '#8B9BB5', label: 'mapFilters.outage_internet', icon: IconWifiOff },
  weather_alerts: { color: '#F59E0B', label: 'mapFilters.weather_alerts', icon: IconAlertTriangle },
  weather_forecast: { color: '#D97706', label: 'mapFilters.weather_forecast', icon: IconCloudBolt },
  // Step 8: generic teaser fallback for BE source codes without a
  // dedicated FE pin (earthquake, community). Not surfaced in
  // MAP_FILTER_SOURCES — these only ever come through as teasers.
  event: { color: '#6B7A99', label: 'mapFilters.events', icon: IconCalendarEvent },
};

const TRAFFIC_TYPE_COLORS: Record<string, string> = {
  accident: '#FF3B30',
  construction: '#FF7A2F',
  road_closure: '#991B1B',
  congestion: '#EAB308',
  flooding: '#3A86FF',
  event: '#3A86FF',
  other: '#6B7A99',
};

export function getPinStyle(pin: MapPin): PinStyle {
  if (pin.source === 'traffic' && pin.incidentType) {
    const trafficColor = TRAFFIC_TYPE_COLORS[pin.incidentType];
    const TrafficIcon = TRAFFIC_ICON_MAP[pin.incidentType] ?? IconInfoCircle;
    if (trafficColor) {
      return { color: trafficColor, label: 'traffic.title', icon: TrafficIcon };
    }
  }
  return SOURCE_STYLES[pin.source];
}

export const DEFAULT_PIN_STYLE: PinStyle = {
  color: '#6B7A99',
  label: 'other',
  icon: IconInfoCircle,
};

export const MAP_PIN_STYLES = SOURCE_STYLES;
// FE-P1.2: surface the new sources in the filter legend so users can
// toggle them on/off. Order roughly matches Notifio's information
// hierarchy (utilities → environmental → infra).
export const MAP_FILTER_SOURCES: MapPinSource[] = [
  'electricity',
  'water',
  'heat',
  'gas',
  'traffic',
  'air_quality',
  'pollen',
  'hydrology',
  'wildfire',
  'outage_internet',
  'weather_alerts',
  'weather_forecast',
];
export { TRAFFIC_TYPE_COLORS, TRAFFIC_ICON_MAP };

// Step 8: gating tier per source. Mirrors the BE catalogue: only
// `traffic`, `air_quality`, `pollen` are paid; everything else is
// FREE. `event` is the generic teaser fallback so it's effectively
// never gated on its own — gating happens via the underlying BE
// `source` code, not the FE pin source.
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
