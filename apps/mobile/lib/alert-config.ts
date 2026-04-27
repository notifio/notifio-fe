import { IconBarrierBlock, IconBolt, IconCalendarEvent, IconCloudStorm, IconWind } from '@tabler/icons-react-native';

import { alertTypeColors, alertTypeTints } from '@notifio/ui';

export const ALERT_TYPE_CONFIG = {
  weather: { icon: IconCloudStorm, color: alertTypeColors.weather, bgColor: alertTypeTints.light.weather, label: 'Weather Warnings' },
  traffic: { icon: IconBarrierBlock, color: alertTypeColors.traffic, bgColor: alertTypeTints.light.traffic, label: 'Traffic Updates' },
  air_quality: { icon: IconWind, color: alertTypeColors.air_quality, bgColor: alertTypeTints.light.air_quality, label: 'Air Quality' },
  utility_outage: { icon: IconBolt, color: alertTypeColors.utility_outage, bgColor: alertTypeTints.light.utility_outage, label: 'Utility Outages' },
  event: { icon: IconCalendarEvent, color: alertTypeColors.event, bgColor: alertTypeTints.light.event, label: 'Events' },
} as const;

export type AlertType = keyof typeof ALERT_TYPE_CONFIG;
