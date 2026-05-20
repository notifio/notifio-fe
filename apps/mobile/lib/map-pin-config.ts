import type { Icon } from '@tabler/icons-react-native';

import {
  MAP_PIN_SOURCE_COLORS,
  MAP_PIN_SOURCE_ICONS,
  MAP_PIN_SOURCE_LABEL_KEYS,
  TRAFFIC_ICON_MAP,
  TRAFFIC_TYPE_COLORS,
  type MapPin,
  type MapPinSource,
} from '@notifio/shared/map';

import { getIconByName, ICON_BY_NAME } from './icon-registry';

export interface PinStyle {
  /** Hex color for marker fill */
  color: string;
  /** i18n key for the human-readable label */
  label: string;
  /** Tabler icon component */
  icon: Icon;
}

/**
 * Pin style for legend / filter rows / upsell sheet. Built once from
 * shared color+label+icon-name data + the local icon registry.
 */
export const MAP_PIN_STYLES: Record<MapPinSource, PinStyle> = Object.fromEntries(
  (Object.keys(MAP_PIN_SOURCE_COLORS) as MapPinSource[]).map((src) => [
    src,
    {
      color: MAP_PIN_SOURCE_COLORS[src],
      label: MAP_PIN_SOURCE_LABEL_KEYS[src],
      icon: getIconByName(MAP_PIN_SOURCE_ICONS[src]),
    },
  ]),
) as Record<MapPinSource, PinStyle>;

/**
 * Resolves the visual style for a pin, accounting for traffic incident
 * subtype. Traffic pins with a known `incidentType` get an
 * incident-specific color + icon (driven by shared `TRAFFIC_ICON_MAP`
 * + `TRAFFIC_TYPE_COLORS`); everything else falls back to the
 * per-source style.
 */
export function getPinStyle(pin: MapPin): PinStyle {
  if (pin.source === 'traffic' && pin.incidentType) {
    const trafficColor = TRAFFIC_TYPE_COLORS[pin.incidentType];
    const trafficIconName = TRAFFIC_ICON_MAP[pin.incidentType];
    if (trafficColor) {
      return {
        color: trafficColor,
        label: MAP_PIN_SOURCE_LABEL_KEYS.traffic,
        icon: trafficIconName ? getIconByName(trafficIconName) : ICON_BY_NAME.IconInfoCircle,
      };
    }
  }
  return MAP_PIN_STYLES[pin.source];
}
