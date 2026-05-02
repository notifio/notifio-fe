import type { TrafficFlowResponse } from '@notifio/api-client';

import type { MapPin } from '@/lib/normalize-pins';

export interface ViewportCache {
  pins: MapPin[];
  flow: TrafficFlowResponse | null;
}
