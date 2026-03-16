import type { AlertType } from './alert-config';

// TODO: Import AlertSummary from @notifio/shared when wired up
export interface AlertSummary {
  id: string;
  type: AlertType;
  severity: 'info' | 'warning' | 'critical';
  title: string;
  titleSk: string;
  source: string;
  startsAt: string;
  expiresAt: string;
}

const now = Date.now();
const hour = 60 * 60 * 1000;

export const MOCK_ALERTS: AlertSummary[] = [
  {
    id: '1',
    type: 'weather',
    severity: 'critical',
    title: 'Severe thunderstorm warning',
    titleSk: 'Výstraha pred silnou búrkou',
    source: 'SHMÚ',
    startsAt: new Date(now - 1 * hour).toISOString(),
    expiresAt: new Date(now + 5 * hour).toISOString(),
  },
  {
    id: '2',
    type: 'traffic',
    severity: 'info',
    title: 'Road closure on D1 highway',
    titleSk: 'Uzávierka na diaľnici D1',
    source: 'SSC',
    startsAt: new Date(now - 3 * hour).toISOString(),
    expiresAt: new Date(now + 12 * hour).toISOString(),
  },
  {
    id: '3',
    type: 'air_quality',
    severity: 'warning',
    title: 'Elevated PM2.5 levels in your area',
    titleSk: 'Zvýšené hodnoty PM2.5 vo vašej oblasti',
    source: 'SHMÚ Air',
    startsAt: new Date(now - 2 * hour).toISOString(),
    expiresAt: new Date(now + 8 * hour).toISOString(),
  },
  {
    id: '4',
    type: 'utility_outage',
    severity: 'warning',
    title: 'Planned power outage — Petržalka',
    titleSk: 'Plánovaný výpadok elektriny — Petržalka',
    source: 'ZSE',
    startsAt: new Date(now + 2 * hour).toISOString(),
    expiresAt: new Date(now + 6 * hour).toISOString(),
  },
  {
    id: '5',
    type: 'weather',
    severity: 'warning',
    title: 'Strong wind advisory',
    titleSk: 'Upozornenie na silný vietor',
    source: 'SHMÚ',
    startsAt: new Date(now - 30 * 60 * 1000).toISOString(),
    expiresAt: new Date(now + 10 * hour).toISOString(),
  },
  {
    id: '6',
    type: 'event',
    severity: 'info',
    title: 'Bratislava Marathon — road closures',
    titleSk: 'Bratislavský maratón — uzávierky ciest',
    source: 'City of Bratislava',
    startsAt: new Date(now + 24 * hour).toISOString(),
    expiresAt: new Date(now + 36 * hour).toISOString(),
  },
  {
    id: '7',
    type: 'air_quality',
    severity: 'critical',
    title: 'Hazardous air quality — stay indoors',
    titleSk: 'Nebezpečná kvalita ovzdušia — zostaňte vnútri',
    source: 'SHMÚ Air',
    startsAt: new Date(now - 4 * hour).toISOString(),
    expiresAt: new Date(now + 2 * hour).toISOString(),
  },
];
