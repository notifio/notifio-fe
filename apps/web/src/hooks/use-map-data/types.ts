import type { TrafficFlowResponse } from '@notifio/api-client';
import type { MapPin } from '@notifio/shared/map';

export interface ViewportCache {
  pins: MapPin[];
  flow: TrafficFlowResponse | null;
}
