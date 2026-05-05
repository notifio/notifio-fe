import type { Icon } from '@tabler/icons-react-native';
import { IconCalendarEvent, IconCar, IconCloudStorm, IconBolt } from '@tabler/icons-react-native';

/**
 * Per-platform icon resolver for the cross-platform `CATEGORY_GROUPS`
 * data exported by `@notifio/shared/map`. Mobile uses
 * `@tabler/icons-react-native`; web keeps its own equivalent map keyed
 * against `@tabler/icons-react`. Keys must match the shared
 * `CATEGORY_GROUPS[].groupKey` values.
 */
export const CATEGORY_GROUP_ICONS: Record<string, Icon> = {
  weather: IconCloudStorm,
  traffic: IconCar,
  outages: IconBolt,
  events: IconCalendarEvent,
};
