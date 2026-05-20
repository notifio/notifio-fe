import type { Icon } from '@tabler/icons-react';

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
  color: string;
  label: string;
  icon: Icon;
}

/**
 * Pin style for legend / filter rows / upsell modal. Built once from
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

export const DEFAULT_PIN_STYLE: PinStyle = {
  color: '#6B7A99',
  label: 'mapFilters.other',
  icon: ICON_BY_NAME.IconInfoCircle,
};

/**
 * Resolves pin styling at render time. Traffic pins with a known
 * `incidentType` get an incident-specific color + icon (driven by
 * shared `TRAFFIC_ICON_MAP` + `TRAFFIC_TYPE_COLORS`); everything else
 * falls back to the per-source style.
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
  return MAP_PIN_STYLES[pin.source] ?? DEFAULT_PIN_STYLE;
}
