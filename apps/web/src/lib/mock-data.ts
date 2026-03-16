import { type LucideIcon, CalendarDays, CloudLightning, Construction, Wind, Zap } from 'lucide-react';

export type AlertType = 'weather' | 'traffic' | 'air_quality' | 'utility_outage' | 'event';

export type Severity = 'info' | 'warning' | 'critical';

// TODO: Import AlertSummary from @notifio/shared when wired up
export interface AlertSummary {
  id: string;
  type: AlertType;
  severity: Severity;
  title: string;
  source: string;
  startsAt: string;
  expiresAt: string;
}

interface AlertTypeConfig {
  icon: LucideIcon;
  color: string;
  bgColor: string;
  label: string;
}

export const ALERT_TYPE_CONFIG: Record<AlertType, AlertTypeConfig> = {
  weather: { icon: CloudLightning, color: '#0EA5E9', bgColor: '#F0F9FF', label: 'Weather' },
  traffic: { icon: Construction, color: '#F97316', bgColor: '#FFF7ED', label: 'Traffic' },
  air_quality: { icon: Wind, color: '#10B981', bgColor: '#ECFDF5', label: 'Air Quality' },
  utility_outage: { icon: Zap, color: '#8B5CF6', bgColor: '#F5F3FF', label: 'Utility Outages' },
  event: { icon: CalendarDays, color: '#EC4899', bgColor: '#FDF2F8', label: 'Events' },
} as const;

const now = Date.now();
const hour = 60 * 60 * 1000;

export const MOCK_ALERTS: AlertSummary[] = [
  {
    id: '1',
    type: 'weather',
    severity: 'critical',
    title: 'Severe thunderstorm warning',
    source: 'SHMÚ',
    startsAt: new Date(now - 1 * hour).toISOString(),
    expiresAt: new Date(now + 5 * hour).toISOString(),
  },
  {
    id: '2',
    type: 'traffic',
    severity: 'info',
    title: 'Road closure on D1 highway',
    source: 'SSC',
    startsAt: new Date(now - 3 * hour).toISOString(),
    expiresAt: new Date(now + 12 * hour).toISOString(),
  },
  {
    id: '3',
    type: 'air_quality',
    severity: 'warning',
    title: 'Elevated PM2.5 levels in your area',
    source: 'SHMÚ Air',
    startsAt: new Date(now - 2 * hour).toISOString(),
    expiresAt: new Date(now + 8 * hour).toISOString(),
  },
  {
    id: '4',
    type: 'utility_outage',
    severity: 'warning',
    title: 'Planned power outage — Petržalka',
    source: 'ZSE',
    startsAt: new Date(now + 2 * hour).toISOString(),
    expiresAt: new Date(now + 6 * hour).toISOString(),
  },
  {
    id: '5',
    type: 'weather',
    severity: 'warning',
    title: 'Strong wind advisory',
    source: 'SHMÚ',
    startsAt: new Date(now - 30 * 60 * 1000).toISOString(),
    expiresAt: new Date(now + 10 * hour).toISOString(),
  },
  {
    id: '6',
    type: 'event',
    severity: 'info',
    title: 'Bratislava Marathon — road closures',
    source: 'City of Bratislava',
    startsAt: new Date(now + 24 * hour).toISOString(),
    expiresAt: new Date(now + 36 * hour).toISOString(),
  },
  {
    id: '7',
    type: 'air_quality',
    severity: 'critical',
    title: 'Hazardous air quality — stay indoors',
    source: 'SHMÚ Air',
    startsAt: new Date(now - 4 * hour).toISOString(),
    expiresAt: new Date(now + 2 * hour).toISOString(),
  },
];
