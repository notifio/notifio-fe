import { type Icon, IconCalendarEvent, IconCloudStorm, IconBarrierBlock, IconWind, IconBolt } from '@tabler/icons-react';

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
  icon: Icon;
  color: string;
  bgColor: string;
  label: string;
}

export const ALERT_TYPE_CONFIG: Record<AlertType, AlertTypeConfig> = {
  weather: { icon: IconCloudStorm, color: '#0EA5E9', bgColor: '#F0F9FF', label: 'Weather' },
  traffic: { icon: IconBarrierBlock, color: '#F97316', bgColor: '#FFF7ED', label: 'Traffic' },
  air_quality: { icon: IconWind, color: '#10B981', bgColor: '#ECFDF5', label: 'Air Quality' },
  utility_outage: { icon: IconBolt, color: '#8B5CF6', bgColor: '#F5F3FF', label: 'Utility Outages' },
  event: { icon: IconCalendarEvent, color: '#EC4899', bgColor: '#FDF2F8', label: 'Events' },
} as const;

export const MOCK_ALERTS: AlertSummary[] = [
  {
    id: '1',
    type: 'weather',
    severity: 'critical',
    title: 'Severe thunderstorm warning',
    source: 'SHMÚ',
    startsAt: '2026-04-02T08:00:00.000Z',
    expiresAt: '2026-04-02T14:00:00.000Z',
  },
  {
    id: '2',
    type: 'traffic',
    severity: 'info',
    title: 'Road closure on D1 highway',
    source: 'SSC',
    startsAt: '2026-04-02T06:00:00.000Z',
    expiresAt: '2026-04-02T21:00:00.000Z',
  },
  {
    id: '3',
    type: 'air_quality',
    severity: 'warning',
    title: 'Elevated PM2.5 levels in your area',
    source: 'SHMÚ Air',
    startsAt: '2026-04-02T07:00:00.000Z',
    expiresAt: '2026-04-02T17:00:00.000Z',
  },
  {
    id: '4',
    type: 'utility_outage',
    severity: 'warning',
    title: 'Planned power outage — Petržalka',
    source: 'ZSE',
    startsAt: '2026-04-02T11:00:00.000Z',
    expiresAt: '2026-04-02T15:00:00.000Z',
  },
  {
    id: '5',
    type: 'weather',
    severity: 'warning',
    title: 'Strong wind advisory',
    source: 'SHMÚ',
    startsAt: '2026-04-02T08:30:00.000Z',
    expiresAt: '2026-04-02T19:00:00.000Z',
  },
  {
    id: '6',
    type: 'event',
    severity: 'info',
    title: 'Bratislava Marathon — road closures',
    source: 'City of Bratislava',
    startsAt: '2026-04-03T09:00:00.000Z',
    expiresAt: '2026-04-03T21:00:00.000Z',
  },
  {
    id: '7',
    type: 'air_quality',
    severity: 'critical',
    title: 'Hazardous air quality — stay indoors',
    source: 'SHMÚ Air',
    startsAt: '2026-04-02T05:00:00.000Z',
    expiresAt: '2026-04-02T11:00:00.000Z',
  },
];
