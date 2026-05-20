import {
  IconActivity,
  IconAlertTriangle,
  IconBarrierBlock,
  IconBolt,
  IconCalendarEvent,
  IconCampfire,
  IconCar,
  IconCarCrash,
  IconCloud,
  IconCloudBolt,
  IconCone2,
  IconDroplet,
  IconDropletFilled,
  IconFlame,
  IconFlameOff,
  IconFlower,
  IconInfoCircle,
  IconRipple,
  IconWifiOff,
  IconWindmill,
  type Icon,
} from '@tabler/icons-react-native';

import type { IconName } from '@notifio/shared/alert-card';

// Binds shared `IconName` strings to mobile Tabler components. The set
// matches the shared `IconName` union exactly — `Record<IconName, Icon>`
// makes a build break the moment shared adds a new name the registry
// doesn't cover. App-local icons (tab bar, settings rows, action
// buttons) stay as direct imports at their consumer files — this
// registry exists only for shared-driven category / pin / traffic
// surfaces resolved at runtime via `getCategoryVisual()`,
// `MAP_PIN_SOURCE_ICONS`, and `TRAFFIC_ICON_MAP`.
export const ICON_BY_NAME: Record<IconName, Icon> = {
  IconActivity,
  IconAlertTriangle,
  IconBarrierBlock,
  IconBolt,
  IconCalendarEvent,
  IconCampfire,
  IconCar,
  IconCarCrash,
  IconCloud,
  IconCloudBolt,
  IconCone2,
  IconDroplet,
  IconDropletFilled,
  IconFlame,
  IconFlameOff,
  IconFlower,
  IconInfoCircle,
  IconRipple,
  IconWifiOff,
  IconWindmill,
};

export function getIconByName(name: IconName | string): Icon {
  return ICON_BY_NAME[name as IconName] ?? IconInfoCircle;
}
