// TODO: Move MapPin types to @notifio/shared when stable
import type { UserEvent } from '@notifio/api-client';
import type { OutageRecord, TrafficIncident } from '@notifio/shared/types';

export type MapPinSource = 'electricity' | 'water' | 'gas' | 'heat' | 'traffic' | 'event';
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
  incidentType?: string;
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
    incidentType: incident.type,
    timestamp: new Date().toISOString(),
  };
}

function eventToPin(event: UserEvent): MapPin {
  return {
    id: event.eventId,
    source: 'event',
    status: event.isResolved ? 'scheduled' : 'active',
    lat: event.lat,
    lng: event.lng,
    title: event.title,
    description: event.subcategoryName,
    timestamp: event.createdAt,
  };
}

export function normalizeMapPins(
  electricityOutages: OutageRecord[],
  waterOutages: OutageRecord[],
  heatOutages: OutageRecord[],
  gasOutages: OutageRecord[],
  trafficIncidents: TrafficIncident[],
  events: UserEvent[],
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
  for (const o of gasOutages) {
    const pin = outageToPin(o, 'gas');
    if (pin) pins.push(pin);
  }
  for (const t of trafficIncidents) {
    pins.push(trafficToPin(t));
  }
  for (const e of events) {
    if (!e.isResolved) {
      pins.push(eventToPin(e));
    }
  }

  return pins;
}
