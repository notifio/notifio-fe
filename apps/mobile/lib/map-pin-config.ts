// TODO: Move to @notifio/shared when stable
import type { MapPinSource } from './normalize-pins';
import { theme } from './theme';

interface MapPinStyle {
  label: string;
  color: string;
  iconName: string;
}

export const MAP_PIN_STYLES: Record<MapPinSource, MapPinStyle> = {
  electricity: { label: 'Electricity', color: '#EAB308', iconName: 'Zap' },
  water: { label: 'Water', color: '#3B82F6', iconName: 'Droplets' },
  gas: { label: 'Gas', color: '#F97316', iconName: 'Flame' },
  heat: { label: 'Heat', color: theme.colors.danger, iconName: 'Thermometer' },
  traffic: { label: 'Traffic', color: '#8B5CF6', iconName: 'Car' },
};

export const MAP_FILTER_SOURCES: MapPinSource[] = ['electricity', 'water', 'heat', 'traffic'];
