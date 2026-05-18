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
} from '@tabler/icons-react-native';

import { getCategoryVisual } from '@notifio/shared/alert-card';
import { categoryBeToShared } from '@notifio/shared/constants';

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

export function getNotificationIcon(category: string): { Icon: Icon; color: string } {
  const shared = categoryBeToShared(category) ?? category;
  const { iconSlug, color } = getCategoryVisual(shared);
  return { Icon: SLUG_TO_ICON[iconSlug] ?? IconInfoCircle, color };
}
