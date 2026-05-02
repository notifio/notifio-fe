// TODO: Move MapPin types to @notifio/shared when stable
import type { EventFeedItem, TrafficIncident } from '@notifio/shared/types';

export type MapPinSource = 'electricity' | 'water' | 'gas' | 'heat' | 'traffic' | 'event';

// Bounded port from web's `EVENT_CATEGORY_TO_SOURCE` — limited to the 4
// outage utility categories so existing pin sources keep their colours
// when outages flow through `/events`. The 5 newer categories
// (air_quality, pollen, hydrology, wildfire, outage_internet) are
// intentionally NOT mapped here — extending `MapPinSource` is Step 7.
const EVENT_CATEGORY_TO_SOURCE: Record<string, MapPinSource> = {
  outage_electric: 'electricity',
  outage_water: 'water',
  outage_gas: 'gas',
  outage_heat: 'heat',
};
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
    source: EVENT_CATEGORY_TO_SOURCE[event.category] ?? 'event',
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
  trafficIncidents: TrafficIncident[],
  events: EventFeedItem[],
): MapPin[] {
  const pins: MapPin[] = [];

  for (const t of trafficIncidents) {
    pins.push(trafficToPin(t));
  }
  for (const e of events) {
    const pin = eventToPin(e);
    if (pin) pins.push(pin);
  }

  return pins;
}
