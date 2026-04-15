import type { Icon } from '@tabler/icons-react-native';
import { IconCalendarEvent, IconCar, IconCloudStorm, IconBolt } from '@tabler/icons-react-native';

export interface CategoryGroupDef {
  groupKey: string;
  icon: Icon;
  categoryCodes: string[];
}

export const CATEGORY_GROUPS: CategoryGroupDef[] = [
  {
    groupKey: 'weather',
    icon: IconCloudStorm,
    categoryCodes: ['weather', 'weather_warning', 'air_quality', 'pollen', 'earthquake'],
  },
  {
    groupKey: 'traffic',
    icon: IconCar,
    categoryCodes: ['traffic'],
  },
  {
    groupKey: 'outages',
    icon: IconBolt,
    categoryCodes: ['outage_electric', 'outage_water', 'outage_gas', 'outage_heat'],
  },
  {
    groupKey: 'events',
    icon: IconCalendarEvent,
    categoryCodes: ['name_day'],
  },
];
