import type { Icon } from '@tabler/icons-react';

import { categoryBeToShared, getCategoryVisual } from '@notifio/shared';

import { getIconByName } from './icon-registry';

export function getNotificationIcon(category: string): { icon: Icon; color: string } {
  const shared = categoryBeToShared(category) ?? category;
  const { iconName, color } = getCategoryVisual(shared);
  return { icon: getIconByName(iconName), color };
}
