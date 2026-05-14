import {
  IconActivity,
  IconBolt,
  IconCalendarEvent,
  IconCar,
  IconCarCrash,
  IconCloud,
  IconDroplet,
  IconFlame,
  IconFlameOff,
  IconInfoCircle,
  type Icon,
} from '@tabler/icons-react';

import { getCategoryVisual } from '@notifio/shared';

const SLUG_TO_ICON: Record<string, Icon> = {
  'activity': IconActivity,
  'bolt': IconBolt,
  'calendar-event': IconCalendarEvent,
  'car': IconCar,
  'car-crash': IconCarCrash,
  'cloud': IconCloud,
  'droplet': IconDroplet,
  'flame': IconFlame,
  'flame-off': IconFlameOff,
  'info-circle': IconInfoCircle,
};

export function getNotificationIcon(category: string): { icon: Icon; color: string } {
  const { iconSlug, color } = getCategoryVisual(category);
  return { icon: SLUG_TO_ICON[iconSlug] ?? IconInfoCircle, color };
}
