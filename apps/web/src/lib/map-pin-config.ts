import type { Icon } from '@tabler/icons-react';
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
} from '@tabler/icons-react';

import {
  MAP_PIN_SOURCE_COLORS,
  MAP_PIN_SOURCE_LABEL_KEYS,
  TRAFFIC_TYPE_COLORS,
  type MapPin,
  type MapPinSource,
} from '@notifio/shared/map';

export interface PinStyle {
  color: string;
  label: string;
  icon: Icon;
}

/**
 * Per-platform icon resolver. Cross-platform color + label data live in
 * `@notifio/shared/map` (`MAP_PIN_SOURCE_COLORS`, `MAP_PIN_SOURCE_LABEL_KEYS`).
 * Web maps each pin source to a `@tabler/icons-react` component here;
 * mobile keeps an equivalent map against `@tabler/icons-react-native`.
 */
const MAP_PIN_SOURCE_ICONS: Record<MapPinSource, Icon> = {
  electricity: IconBolt,
  water: IconDroplet,
  heat: IconFlame,
  gas: IconFlameOff,
  traffic: IconCarCrash,
  air_quality: IconWindmill,
  pollen: IconFlower,
  hydrology: IconRipple,
  wildfire: IconCampfire,
  outage_internet: IconWifiOff,
  weather_alerts: IconAlertTriangle,
  weather_forecast: IconCloudBolt,
  event: IconCalendarEvent,
};

const TRAFFIC_ICON_MAP: Record<string, Icon> = {
  accident: IconCarCrash,
  construction: IconCone2,
  road_closure: IconBarrierBlock,
  congestion: IconCar,
  flooding: IconDropletFilled,
  event: IconCalendarEvent,
  other: IconInfoCircle,
};

export { TRAFFIC_ICON_MAP };

/**
 * Pin style for legend / filter rows / upsell modal. Built once from
 * shared color+label data + local icon components — same shape the
 * legacy local `MAP_PIN_STYLES` produced, so call sites don't change.
 */
export const MAP_PIN_STYLES: Record<MapPinSource, PinStyle> = Object.fromEntries(
  (Object.keys(MAP_PIN_SOURCE_COLORS) as MapPinSource[]).map((src) => [
    src,
    {
      color: MAP_PIN_SOURCE_COLORS[src],
      label: MAP_PIN_SOURCE_LABEL_KEYS[src],
      icon: MAP_PIN_SOURCE_ICONS[src],
    },
  ]),
) as Record<MapPinSource, PinStyle>;

export const DEFAULT_PIN_STYLE: PinStyle = {
  color: '#6B7A99',
  label: 'mapFilters.other',
  icon: IconInfoCircle,
};

/**
 * Resolves pin styling at render time. Traffic pins with a known
 * `incidentType` get an incident-specific color + icon; everything else
 * falls back to the per-source style.
 */
export function getPinStyle(pin: MapPin): PinStyle {
  if (pin.source === 'traffic' && pin.incidentType) {
    const trafficColor = TRAFFIC_TYPE_COLORS[pin.incidentType];
    const trafficIcon = TRAFFIC_ICON_MAP[pin.incidentType] ?? IconInfoCircle;
    if (trafficColor) {
      return {
        color: trafficColor,
        label: MAP_PIN_SOURCE_LABEL_KEYS.traffic,
        icon: trafficIcon,
      };
    }
  }
  return MAP_PIN_STYLES[pin.source] ?? DEFAULT_PIN_STYLE;
}
