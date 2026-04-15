// TODO: Move MapPin types to @notifio/shared when stable
import type { UserEvent } from '@notifio/api-client';
import type { OutageRecord, TrafficIncident } from '@notifio/shared';

export type MapPinSource = 'electricity' | 'water' | 'gas' | 'heat' | 'traffic';
export type MapPinStatus = 'active' | 'scheduled';
export type TrafficIncidentType =
  | 'accident'
  | 'congestion'
  | 'construction'
  | 'event'
  | 'flooding'
  | 'road_closure'
  | 'other';

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
  incidentType?: TrafficIncidentType;
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
    incidentType: incident.type as TrafficIncidentType,
  };
}

// ── Event → MapPin mapping ───────────────────────────────────────────
// The UserEvent TypeScript type uses `subcategoryCode`/`categoryCode` but the
// actual API returns `subcategory`/`category`. We read both to be safe.

/**
 * Extract the real field value regardless of whether the API uses
 * `subcategory` or `subcategoryCode` (TS type vs actual response).
 */
function getEventSubcategory(event: UserEvent): string {
  return (
    event.subcategoryCode ??
    (event as unknown as Record<string, unknown>).subcategory as string ??
    ''
  );
}

function getEventCategory(event: UserEvent): string {
  return (
    event.categoryCode ??
    (event as unknown as Record<string, unknown>).category as string ??
    ''
  );
}

function getEventTitle(event: UserEvent): string {
  return (
    event.title ??
    (event as unknown as Record<string, unknown>).typeName as string ??
    event.subcategoryName ??
    (event as unknown as Record<string, unknown>).subcategoryName as string ??
    ''
  );
}

function isEventResolved(event: UserEvent): boolean {
  const raw = (event as unknown as Record<string, unknown>).isResolved;
  return raw === true;
}

// Subcategory codes that map to specific traffic incident types
const EVENT_SUBCATEGORY_TO_INCIDENT: Record<string, TrafficIncidentType> = {
  traffic_accident: 'accident',
  traffic_jam: 'congestion',
  road_closure: 'road_closure',
  road_works: 'construction',
  road_closure_planned: 'road_closure',
  transport_disruption: 'congestion',
  flooding: 'flooding',
};

// Category codes that map to outage pin sources
const EVENT_CATEGORY_TO_SOURCE: Record<string, MapPinSource> = {
  outage_electric: 'electricity',
  outage_water: 'water',
  outage_heat: 'heat',
  outage_gas: 'gas',
};

// Categories that should not appear as map pins
const SKIP_CATEGORIES = new Set(['name_day']);

function eventToPin(event: UserEvent): MapPin | null {
  const categoryCode = getEventCategory(event);
  const subcategoryCode = getEventSubcategory(event);
  const title = getEventTitle(event);
  const description =
    event.subcategoryName ??
    (event as unknown as Record<string, unknown>).subcategoryName as string ??
    '';

  if (SKIP_CATEGORIES.has(categoryCode)) return null;

  // Outage-type events → utility source pins
  const outageSource = EVENT_CATEGORY_TO_SOURCE[categoryCode];
  if (outageSource) {
    return {
      id: event.eventId,
      source: outageSource,
      status: 'active',
      lat: event.lat,
      lng: event.lng,
      title,
      description,
      timestamp: event.createdAt,
    };
  }

  // Subcategory → specific incident type
  const incidentType = EVENT_SUBCATEGORY_TO_INCIDENT[subcategoryCode];
  if (incidentType) {
    return {
      id: event.eventId,
      source: 'traffic',
      status: 'active',
      lat: event.lat,
      lng: event.lng,
      title,
      description,
      timestamp: event.createdAt,
      incidentType,
    };
  }

  // Category-level fallback
  const fallbackType: TrafficIncidentType = 'event';

  return {
    id: event.eventId,
    source: 'traffic',
    status: 'active',
    lat: event.lat,
    lng: event.lng,
    title,
    description,
    timestamp: event.createdAt,
    incidentType: fallbackType,
  };
}

export function normalizeMapPins(
  electricityOutages: OutageRecord[],
  waterOutages: OutageRecord[],
  heatOutages: OutageRecord[],
  gasOutages: OutageRecord[],
  trafficIncidents: TrafficIncident[],
  events?: UserEvent[],
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
  if (events) {
    for (const e of events) {
      if (!isEventResolved(e)) {
        const pin = eventToPin(e);
        if (pin) pins.push(pin);
      }
    }
  }

  return pins;
}
