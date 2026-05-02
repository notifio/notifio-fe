import type { NotificationHistoryItem } from '@notifio/api-client';

/**
 * Mirror of web's isResolved heuristic (apps/web/src/components/app/
 * alert-card-utils.tsx). NotificationHistoryItem doesn't carry the
 * underlying event's lifecycle status, so we infer "resolved" from
 * delivery status, notificationType, and a title-prefix fallback.
 *
 * Refactor doc item 14 tracks the proper fix: BE adds eventStatus to
 * NotificationHistoryItem so the FE doesn't have to guess.
 */
export function isResolved(n: NotificationHistoryItem): boolean {
  if (n.status !== 'sent') return true;
  const nt = (n as Record<string, unknown>).notificationType;
  if (typeof nt === 'string') return nt === 'all_clear';
  if (n.title.startsWith('Ukončené:') || n.title.startsWith('Resolved:')) return true;
  return false;
}
