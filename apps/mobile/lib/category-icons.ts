import type { Icon } from '@tabler/icons-react-native';

import { getCategoryVisual } from '@notifio/shared/alert-card';
import { categoryBeToShared } from '@notifio/shared/constants';

import { getIconByName } from './icon-registry';

export function getNotificationIcon(category: string): { Icon: Icon; color: string } {
  const shared = categoryBeToShared(category) ?? category;
  const { iconName, color } = getCategoryVisual(shared);
  return { Icon: getIconByName(iconName), color };
}
