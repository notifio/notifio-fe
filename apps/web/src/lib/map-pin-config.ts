import type { MapPin, MapPinSource } from './normalize-pins';

export interface PinStyle {
  color: string;
  label: string; // translation key
  iconPath: string; // SVG path data, designed for a 24×32 viewBox centered at (12, 12)
}

// Each path is drawn to fit within an ~10px circle centered at (12, 12)
const ICON_PATHS = {
  // Lightning bolt
  electricity:
    'M13.5 7L10 12.5h2.5L10.5 17l5-6h-2.5L14.5 7h-1z',
  // Water droplet
  water:
    'M12 7c0 0-3.5 4-3.5 5.8a3.5 3.5 0 0 0 7 0C15.5 11 12 7 12 7z',
  // Flame
  heat:
    'M12 6.5c0 0-3.5 3.5-3.5 6a3.5 3.5 0 0 0 7 0c0-1.2-.7-2.2-1.5-3.2.3 1.2-.2 2.5-2 2.5s-2-1.3-2-2.5c0-.8 2-2.8 2-2.8z',
  // Gas canister / flame variant
  gas:
    'M12 6.5c0 0-3.5 3.5-3.5 6a3.5 3.5 0 0 0 7 0c0-1.2-.7-2.2-1.5-3.2.3 1.2-.2 2.5-2 2.5s-2-1.3-2-2.5c0-.8 2-2.8 2-2.8z',
  // Warning triangle with exclamation mark
  accident:
    'M12 7L7.5 15.5h9L12 7zm-.5 3.5h1v2.5h-1v-2.5zm0 3.5h1v1h-1v-1z',
  // Construction barrier (two horizontal bars)
  construction:
    'M8 9.5h8v2H8v-2zm0 3.5h8v2H8v-2z',
  // X mark for road closure
  road_closure:
    'M9.17 8.17L12 11l2.83-2.83 1.17 1.17L13.17 12.17l2.83 2.83-1.17 1.17L12 13.34l-2.83 2.83-1.17-1.17 2.83-2.83-2.83-2.83 1.17-1.17z',
  // Car silhouette for congestion
  congestion:
    'M9 10h6l1 2.5h.5v2h-1.5v.5h-2v-.5h-2v.5H9v-.5H7.5v-2H8L9 10zm.75 1l-.75 1.5h6l-.75-1.5h-4.5zM9.5 13.5a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5zm5 0a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5z',
  // Calendar for events
  event:
    'M9.5 8v1H8.5v7h7V9h-1V8h-1.5v1h-2V8H9.5zM8.5 11h7v4h-7v-4z',
  // Cloud for weather
  weather:
    'M15.5 14.5H9a2.5 2.5 0 0 1-.4-4.97A3.5 3.5 0 0 1 15 11a2 2 0 0 1 .5 3.5z',
  // Info circle for other
  other:
    'M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm-.5 2.5h1V11h-1V9.5zm0 2.5h1v3h-1v-3z',
} as const;

const TRAFFIC_ICON_MAP: Record<string, keyof typeof ICON_PATHS> = {
  accident: 'accident',
  construction: 'construction',
  road_closure: 'road_closure',
  congestion: 'congestion',
  event: 'event',
  weather: 'weather',
  other: 'other',
};

const SOURCE_STYLES: Record<MapPinSource, PinStyle> = {
  electricity: { color: '#EAB308', label: 'outages.electricity', iconPath: ICON_PATHS.electricity },
  water: { color: '#3A86FF', label: 'outages.water', iconPath: ICON_PATHS.water },
  heat: { color: '#FF3B30', label: 'outages.heat', iconPath: ICON_PATHS.heat },
  gas: { color: '#FF7A2F', label: 'outages.gas', iconPath: ICON_PATHS.gas },
  traffic: { color: '#8B5CF6', label: 'traffic.title', iconPath: ICON_PATHS.accident },
};

const TRAFFIC_TYPE_COLORS: Record<string, string> = {
  accident: '#FF3B30',
  construction: '#FF7A2F',
  road_closure: '#991B1B',
  congestion: '#EAB308',
  event: '#3A86FF',
  weather: '#6B7A99',
  other: '#6B7A99',
};

export function getPinStyle(pin: MapPin): PinStyle {
  if (pin.source === 'traffic' && pin.incidentType) {
    const trafficColor = TRAFFIC_TYPE_COLORS[pin.incidentType];
    const iconKey = TRAFFIC_ICON_MAP[pin.incidentType] ?? 'other';
    if (trafficColor) {
      return { color: trafficColor, label: 'traffic.title', iconPath: ICON_PATHS[iconKey] };
    }
  }
  return SOURCE_STYLES[pin.source];
}

export const DEFAULT_PIN_STYLE: PinStyle = {
  color: '#6B7A99',
  label: 'other',
  iconPath: ICON_PATHS.other,
};

export const MAP_PIN_STYLES = SOURCE_STYLES;
export const MAP_FILTER_SOURCES: MapPinSource[] = ['electricity', 'water', 'heat', 'gas', 'traffic'];
export { ICON_PATHS, TRAFFIC_TYPE_COLORS, TRAFFIC_ICON_MAP };
