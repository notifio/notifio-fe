import type { MapPin, MapPinSource } from './normalize-pins';

export interface PinStyle {
  color: string;
  label: string; // translation key
}

const SOURCE_STYLES: Record<MapPinSource, PinStyle> = {
  electricity: { color: '#EAB308', label: 'outages.electricity' },
  water: { color: '#3A86FF', label: 'outages.water' },
  heat: { color: '#FF3B30', label: 'outages.heat' },
  gas: { color: '#FF7A2F', label: 'outages.gas' },
  traffic: { color: '#8B5CF6', label: 'traffic.title' },
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
    if (trafficColor) {
      return { color: trafficColor, label: 'traffic.title' };
    }
  }
  return SOURCE_STYLES[pin.source];
}

export const MAP_PIN_STYLES = SOURCE_STYLES;
export const MAP_FILTER_SOURCES: MapPinSource[] = ['electricity', 'water', 'heat', 'traffic'];
