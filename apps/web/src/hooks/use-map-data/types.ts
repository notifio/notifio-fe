import type { TrafficFlowResponse } from '@notifio/api-client';
import type { OutageRecord } from '@notifio/shared';

import type { MapPin } from '@/lib/normalize-pins';

export interface StaticData {
  elec: OutageRecord[];
  water: OutageRecord[];
  heat: OutageRecord[];
  gas: OutageRecord[];
}

export interface ViewportCache {
  pins: MapPin[];
  flow: TrafficFlowResponse | null;
}
