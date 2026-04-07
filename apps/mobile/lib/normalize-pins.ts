// TODO: Move MapPin types to @notifio/shared when stable
import type { OutageRecord, TrafficIncident } from '@notifio/shared/types';

export type MapPinSource = 'electricity' | 'water' | 'gas' | 'heat' | 'traffic';
export type MapPinStatus = 'active' | 'scheduled';

export interface MapPin {
  id: string;
  source: MapPinSource;
  status: MapPinStatus;
  lat: number;
  lng: number;
  title: string;
  description: string;
  locality?: string;
  timestamp: string;
}

function outageToPin(outage: OutageRecord, source: MapPinSource): MapPin | null {
  if (outage.lat == null || outage.lng == null) return null;
  if (outage.status === 'resolved') return null;

  const status: MapPinStatus = outage.status === 'scheduled' ? 'scheduled' : 'active';

  return {
    id: outage.id,
    source,
    status,
    lat: outage.lat,
    lng: outage.lng,
    title: outage.title,
    description: outage.description,
    locality: outage.locality,
    timestamp: outage.startedAt,
  };
}

function trafficToPin(incident: TrafficIncident): MapPin {
  return {
    id: incident.id,
    source: 'traffic',
    status: 'active',
    lat: incident.location.lat,
    lng: incident.location.lng,
    title: incident.description,
    description: `${incident.type} — ${incident.severity}`,
    timestamp: new Date().toISOString(),
  };
}

export function normalizeMapPins(
  electricityOutages: OutageRecord[],
  waterOutages: OutageRecord[],
  heatOutages: OutageRecord[],
  trafficIncidents: TrafficIncident[],
): MapPin[] {
  const pins: MapPin[] = [];

  for (const o of electricityOutages) {
    const pin = outageToPin(o, 'electricity');
    if (pin) pins.push(pin);
  }
  for (const o of waterOutages) {
    const pin = outageToPin(o, 'water');
    if (pin) pins.push(pin);
  }
  for (const o of heatOutages) {
    const pin = outageToPin(o, 'heat');
    if (pin) pins.push(pin);
  }
  for (const t of trafficIncidents) {
    pins.push(trafficToPin(t));
  }

  return pins;
}
