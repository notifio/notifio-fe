// TODO: Move to @notifio/shared when stable
import { alertTypeColors, sharedColors } from '@notifio/ui';

import type { MapPinSource } from './normalize-pins';

interface MapPinStyle {
  label: string;
  color: string;
  iconName: string;
}

export const MAP_PIN_STYLES: Record<MapPinSource, MapPinStyle> = {
  electricity: { label: 'Electricity', color: '#EAB308', iconName: 'Zap' },
  water: { label: 'Water', color: '#3B82F6', iconName: 'Droplets' },
  gas: { label: 'Gas', color: '#F97316', iconName: 'Flame' },
  heat: { label: 'Heat', color: sharedColors.danger, iconName: 'Thermometer' },
  traffic: { label: 'Traffic', color: '#8B5CF6', iconName: 'Car' },
  event: { label: 'Events', color: alertTypeColors.event, iconName: 'CalendarEvent' },
};

export const MAP_FILTER_SOURCES: MapPinSource[] = ['electricity', 'water', 'gas', 'heat', 'traffic', 'event'];
