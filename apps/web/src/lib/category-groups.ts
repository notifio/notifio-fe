import {
  IconBolt,
  IconCalendarEvent,
  IconCar,
  IconCloudStorm,
  type Icon,
} from "@tabler/icons-react";

/**
 * Per-platform icon resolver for the cross-platform `CATEGORY_GROUPS`
 * data exported by `@notifio/shared/map`. Web uses `@tabler/icons-react`
 * (DOM components); mobile keeps its own equivalent map keyed against
 * `@tabler/icons-react-native`. Keep keys in lockstep with the shared
 * `CATEGORY_GROUPS[].groupKey` values.
 */
export const CATEGORY_GROUP_ICONS: Record<string, Icon> = {
  weather: IconCloudStorm,
  traffic: IconCar,
  outages: IconBolt,
  events: IconCalendarEvent,
};
