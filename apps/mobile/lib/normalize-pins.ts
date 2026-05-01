// TODO: Move MapPin types to @notifio/shared when stable
import type { EventFeedItem, OutageRecord, TrafficIncident } from '@notifio/shared/types';

export type MapPinSource = 'electricity' | 'water' | 'gas' | 'heat' | 'traffic' | 'event';
// EVENT-1: align with web's vocabulary (`active | upcoming | resolved`).
// `scheduled` was a legacy synonym for `upcoming`; the web fix in PR #58
// already renamed it but mobile carried the old name and used it
// inconsistently (e.g. `event.isResolved ? 'scheduled' : 'active'` —
// resolved was being reported as scheduled). Resolved pins are filtered
// out before the map renders, so the type only needs the two visible
// states.
export type MapPinStatus = 'active' | 'upcoming';

export interface MapPin {
  id: string;
  source: MapPinSource;
  status: MapPinStatus;
  lat: number;
  lng: number;
  title: string;
  description: string;
  locality?: string;
  /** ISO timestamp the pin's footer label is computed from. For active
   *  events this is `startedAt` (so "X min ago"); for upcoming events
   *  this is `eventFrom` (so "in X days") — never `createdAt`, which
   *  was the source of the "Just now" label on Veolia future-dated
   *  events (EVENT-1). */
  timestamp: string;
  incidentType?: string;
}

function isFutureIso(value: string | null | undefined): boolean {
  if (!value) return false;
  const t = new Date(value).getTime();
  return Number.isFinite(t) && t > Date.now();
}

function outageToPin(outage: OutageRecord, source: MapPinSource): MapPin | null {
  if (outage.lat == null || outage.lng == null) return null;
  if (outage.status === 'resolved') return null;

  // Future-start trumps the adapter's `status` field — Veolia / BVS
  // can mark a row `'active'` while its `startedAt` is days away,
  // which in the old code rendered as "Just now / Active" on the
  // map (EVENT-1, audit 30.4.2026).
  const isFuture = isFutureIso(outage.startedAt);
  const status: MapPinStatus =
    outage.status === 'scheduled' || isFuture ? 'upcoming' : 'active';

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

function eventToPin(event: EventFeedItem): MapPin | null {
  // Resolved events are dropped at the call site already, but keep this
  // null-safe so a stray resolved row doesn't render mis-statused.
  if (event.status === 'resolved') return null;
  if (event.lat == null || event.lng == null) return null;
  const isFuture = isFutureIso(event.eventFrom);
  return {
    id: event.eventId,
    source: 'event',
    status: isFuture ? 'upcoming' : 'active',
    lat: event.lat,
    lng: event.lng,
    title: event.title ?? '',
    description: event.subcategoryName ?? '',
    // For future events show the start time, not the creation time —
    // the user's report was "11.5.2026 event labeled Just now" because
    // we used `createdAt` (today) instead of `eventFrom` (11 days
    // away).
    timestamp: (isFuture && event.eventFrom) ? event.eventFrom : event.createdAt,
  };
}

export function normalizeMapPins(
  electricityOutages: OutageRecord[],
  waterOutages: OutageRecord[],
  heatOutages: OutageRecord[],
  gasOutages: OutageRecord[],
  trafficIncidents: TrafficIncident[],
  events: EventFeedItem[],
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
    const pin = eventToPin(e);
    if (pin) pins.push(pin);
  }

  return pins;
}
