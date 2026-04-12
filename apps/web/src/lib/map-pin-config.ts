import type { MapPin, MapPinSource } from './normalize-pins';

export interface PinStyle {
  color: string;
  label: string;
  iconPaths: string[];
}

// Tabler icon SVG paths (24x24 viewBox, stroke-based).
// Rendered inside TeardropSvg with scale(0.5) + translate to center in teardrop.
const ICON_PATHS = {
  // IconBolt — lightning bolt
  electricity: ['M13 3l0 7l6 0l-8 11l0 -7l-6 0l8 -11'],
  // IconDroplet — water droplet
  water: [
    'M7.502 19.423c2.602 2.105 6.395 2.105 8.996 0c2.602 -2.105 3.262 -5.708 1.566 -8.546l-4.89 -7.26c-.42 -.625 -1.287 -.803 -1.936 -.397a1.376 1.376 0 0 0 -.41 .397l-4.893 7.26c-1.695 2.838 -1.035 6.441 1.567 8.546',
  ],
  // IconFlame — flame
  heat: [
    'M12 10.941c2.333 -3.308 .167 -7.823 -1 -8.941c0 3.395 -2.235 5.299 -3.667 6.706c-1.43 1.408 -2.333 3.294 -2.333 5.588c0 3.704 3.134 6.706 7 6.706c3.866 0 7 -3.002 7 -6.706c0 -1.712 -1.232 -4.403 -2.333 -5.588c-2.084 3.353 -3.257 3.353 -4.667 2.235',
  ],
  // IconGasStation — gas pump
  gas: [
    'M14 11h1a2 2 0 0 1 2 2v3a1.5 1.5 0 0 0 3 0v-7l-3 -3',
    'M4 20v-14a2 2 0 0 1 2 -2h6a2 2 0 0 1 2 2v14',
    'M3 20l12 0',
    'M18 7v1a1 1 0 0 0 1 1h1',
    'M4 11l10 0',
  ],
  // IconCarCrash — car accident
  accident: [
    'M8 17a2 2 0 1 0 4 0a2 2 0 1 0 -4 0',
    'M7 6l4 5h1a2 2 0 0 1 2 2v4h-2m-4 0h-5m0 -6h8m-6 0v-5m2 0h-4',
    'M14 8v-2',
    'M19 12h2',
    'M17.5 15.5l1.5 1.5',
    'M17.5 8.5l1.5 -1.5',
  ],
  // IconCone2 — construction cone
  construction: [
    'M21 5.002v.5l-8.13 14.99a1 1 0 0 1 -1.74 0l-8.13 -14.989v-.5c0 -1.659 4.03 -3.003 9 -3.003s9 1.344 9 3.002',
  ],
  // IconBarrierBlock — road closure barrier
  road_closure: [
    'M4 8a1 1 0 0 1 1 -1h14a1 1 0 0 1 1 1v7a1 1 0 0 1 -1 1h-14a1 1 0 0 1 -1 -1l0 -7',
    'M7 16v4',
    'M7.5 16l9 -9',
    'M13.5 16l6.5 -6.5',
    'M4 13.5l6.5 -6.5',
    'M17 16v4',
    'M5 20h4',
    'M15 20h4',
    'M17 7v-2',
    'M7 7v-2',
  ],
  // IconCar — car for congestion
  congestion: [
    'M5 17a2 2 0 1 0 4 0a2 2 0 1 0 -4 0',
    'M15 17a2 2 0 1 0 4 0a2 2 0 1 0 -4 0',
    'M5 17h-2v-6l2 -5h9l4 5h1a2 2 0 0 1 2 2v4h-2m-4 0h-6m-6 -6h15m-6 0v-5',
  ],
  // IconDropletFilled — flooding
  flooding: [
    'M10.708 2.372a2.382 2.382 0 0 0 -.71 .686l-4.892 7.26c-1.981 3.314 -1.22 7.466 1.767 9.882c2.969 2.402 7.286 2.402 10.254 0c2.987 -2.416 3.748 -6.569 1.795 -9.836l-4.919 -7.306c-.722 -1.075 -2.192 -1.376 -3.295 -.686z',
  ],
  // IconCalendarEvent — event
  event: [
    'M4 7a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2l0 -12',
    'M16 3l0 4',
    'M8 3l0 4',
    'M4 11l16 0',
    'M8 15h2v2h-2l0 -2',
  ],
  // IconCloud — weather
  weather: [
    'M6.657 18c-2.572 0 -4.657 -2.007 -4.657 -4.483c0 -2.475 2.085 -4.482 4.657 -4.482c.393 -1.762 1.794 -3.2 3.675 -3.773c1.88 -.572 3.956 -.193 5.444 1c1.488 1.19 2.162 3.007 1.77 4.769h.99c1.913 0 3.464 1.56 3.464 3.486c0 1.927 -1.551 3.487 -3.465 3.487h-11.878',
  ],
  // IconInfoCircle — generic/other
  other: [
    'M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0',
    'M12 9h.01',
    'M11 12h1v4h1',
  ],
} satisfies Record<string, string[]>;

const TRAFFIC_ICON_MAP: Record<string, keyof typeof ICON_PATHS> = {
  accident: 'accident',
  construction: 'construction',
  road_closure: 'road_closure',
  congestion: 'congestion',
  flooding: 'flooding',
  event: 'event',
  weather: 'weather',
  other: 'other',
};

const SOURCE_STYLES: Record<MapPinSource, PinStyle> = {
  electricity: { color: '#EAB308', label: 'outages.electricity', iconPaths: ICON_PATHS.electricity },
  water: { color: '#3A86FF', label: 'outages.water', iconPaths: ICON_PATHS.water },
  heat: { color: '#FF3B30', label: 'outages.heat', iconPaths: ICON_PATHS.heat },
  gas: { color: '#FF7A2F', label: 'outages.gas', iconPaths: ICON_PATHS.gas },
  traffic: { color: '#8B5CF6', label: 'traffic.title', iconPaths: ICON_PATHS.accident },
};

const TRAFFIC_TYPE_COLORS: Record<string, string> = {
  accident: '#FF3B30',
  construction: '#FF7A2F',
  road_closure: '#991B1B',
  congestion: '#EAB308',
  flooding: '#3A86FF',
  event: '#3A86FF',
  weather: '#6B7A99',
  other: '#6B7A99',
};

export function getPinStyle(pin: MapPin): PinStyle {
  if (pin.source === 'traffic' && pin.incidentType) {
    const trafficColor = TRAFFIC_TYPE_COLORS[pin.incidentType];
    const iconKey = TRAFFIC_ICON_MAP[pin.incidentType] ?? 'other';
    if (trafficColor) {
      return { color: trafficColor, label: 'traffic.title', iconPaths: ICON_PATHS[iconKey] };
    }
  }
  return SOURCE_STYLES[pin.source];
}

export const DEFAULT_PIN_STYLE: PinStyle = {
  color: '#6B7A99',
  label: 'other',
  iconPaths: ICON_PATHS.other,
};

export const MAP_PIN_STYLES = SOURCE_STYLES;
export const MAP_FILTER_SOURCES: MapPinSource[] = ['electricity', 'water', 'heat', 'gas', 'traffic'];
export { ICON_PATHS, TRAFFIC_TYPE_COLORS, TRAFFIC_ICON_MAP };
