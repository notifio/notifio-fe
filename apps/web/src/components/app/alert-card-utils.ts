import type { NotificationHistoryItem } from '@notifio/api-client';

export function isResolved(n: NotificationHistoryItem): boolean {
  if (n.status !== 'sent') return true;
  const nt = (n as Record<string, unknown>).notificationType;
  if (typeof nt === 'string') return nt === 'all_clear';
  if (n.title.startsWith('Ukončené:') || n.title.startsWith('Resolved:')) return true;
  return false;
}

export const SEVERITY_COLORS: Record<string, { bg: string; text: string }> = {
  critical: { bg: 'rgba(255,59,48,0.15)', text: '#FF3B30' },
  warning: { bg: 'rgba(255,122,47,0.15)', text: '#FF7A2F' },
  info: { bg: 'rgba(58,134,255,0.15)', text: '#3A86FF' },
};

export const ACCENT_COLORS: Record<string, string> = {
  critical: '#FF3B30',
  warning: '#FF7A2F',
  info: '#3A86FF',
};

export function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}
