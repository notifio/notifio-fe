import { CalendarDays, CloudLightning, Construction, Wind, Zap } from 'lucide-react-native';

import { theme } from './theme';

export const ALERT_TYPE_CONFIG = {
  weather: { icon: CloudLightning, color: theme.colors.alertType.weather.icon, bgColor: theme.colors.alertType.weather.bg, label: 'Weather Warnings' },
  traffic: { icon: Construction, color: theme.colors.alertType.traffic.icon, bgColor: theme.colors.alertType.traffic.bg, label: 'Traffic Updates' },
  air_quality: { icon: Wind, color: theme.colors.alertType.air_quality.icon, bgColor: theme.colors.alertType.air_quality.bg, label: 'Air Quality' },
  utility_outage: { icon: Zap, color: theme.colors.alertType.utility_outage.icon, bgColor: theme.colors.alertType.utility_outage.bg, label: 'Utility Outages' },
  event: { icon: CalendarDays, color: theme.colors.alertType.event.icon, bgColor: theme.colors.alertType.event.bg, label: 'Events' },
} as const;

export type AlertType = keyof typeof ALERT_TYPE_CONFIG;
