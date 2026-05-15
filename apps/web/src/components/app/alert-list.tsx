'use client';

import { IconBell } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';
import { Fragment, useMemo, useState } from 'react';

import type { EventFeedItem, NotificationHistoryItem } from '@notifio/api-client';
import { materialityToSeverity } from '@notifio/shared/alert-card';

import { useEventsFeed } from '@/hooks/use-events-feed';
import { usePermissionStatus } from '@/hooks/use-permission-status';

import { AdPlaceholder } from './ad-placeholder';
import { AlertCard } from './alert-card';
import { SetupPromptCard } from './setup-prompt-card';
import { UpsellCard } from './upsell-card';

type TabFilter = 'active' | 'ended' | 'all';

interface AlertListProps {
  center: { lat: number; lng: number } | null;
  selectedId?: string | null;
  onSelect?: (eventId: string) => void;
  isLoadingEvent?: boolean;
}

/**
 * Adapt an EventFeedItem (geo-proximity, what the map renders) into
 * the NotificationHistoryItem shape AlertCard expects. The two share
 * most fields conceptually; this lets us swap the data source without
 * rewriting AlertCard (the /notifications history page still consumes
 * actual NotificationHistoryItem rows, so AlertCard's contract stays).
 */
function eventToAlertCardItem(e: EventFeedItem): NotificationHistoryItem {
  return {
    // NotificationHistoryItem.id is a numeric primary key on the BE
    // (autoinc). We don't have one here — synthesize a unique number
    // from the eventId UUID's leading hex chunk, which is enough for
    // React key + AlertCard's onClick callback. The real path through
    // AlertCard never reads `id` for anything BE-bound (only eventId).
    id: parseInt(e.eventId.slice(0, 8), 16),
    eventId: e.eventId,
    status: 'sent',
    trigger: 'system',
    title: e.title ?? e.typeName,
    body: e.description ?? '',
    category: e.category,
    severity: materialityToSeverity(e.materialityLevel),
    sentAt: e.createdAt,
    createdAt: e.createdAt,
  } as unknown as NotificationHistoryItem;
}

export function AlertList({
  center,
  selectedId,
  onSelect,
  isLoadingEvent = false,
}: AlertListProps) {
  const t = useTranslations();
  const [tab, setTab] = useState<TabFilter>('active');
  const { events, isLoading, isError, refetch } = useEventsFeed(center);
  const { fullyConfigured } = usePermissionStatus();

  // Filter by tab — events expose status directly so no isResolved heuristic.
  const filtered = useMemo(() => {
    if (tab === 'all') return events;
    if (tab === 'active') return events.filter((e) => e.status === 'active');
    return events.filter((e) => e.status === 'resolved');
  }, [events, tab]);

  const tabs: { key: TabFilter; label: string }[] = [
    { key: 'active', label: t('alerts.active') },
    { key: 'ended', label: t('alerts.ended') },
    { key: 'all', label: t('alerts.all') },
  ];

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h2 className="text-sm font-semibold text-text-primary">
          {t('notifications.title')}
          {filtered.length > 0 && (
            <span className="ml-1.5 text-muted">({filtered.length})</span>
          )}
        </h2>
        <div className="flex gap-1">
          {tabs.map((tb) => (
            <button
              key={tb.key}
              onClick={() => setTab(tb.key)}
              className={`rounded-md px-2 py-1 text-xs font-medium transition-colors ${
                tab === tb.key
                  ? 'bg-accent text-white'
                  : 'text-muted hover:bg-card'
              }`}
            >
              {tb.label}
            </button>
          ))}
        </div>
      </div>

      {isError && (
        <div className="px-4 py-3">
          <p className="text-xs text-danger">{t('common.retry')}</p>
          <button
            onClick={() => refetch()}
            className="mt-1 text-xs font-medium text-accent hover:underline"
          >
            {t('common.retry')}
          </button>
        </div>
      )}

      {isLoading && events.length === 0 ? (
        <div className="space-y-2 p-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-card" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        fullyConfigured ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-4 py-16">
            <IconBell size={32} className="text-muted" />
            <p className="text-sm text-muted">{t('alerts.noNotifications')}</p>
          </div>
        ) : (
          <div className="p-4">
            <SetupPromptCard variant="compact" />
          </div>
        )
      ) : (
        <div className="space-y-2 p-4">
          {filtered.map((event, index) => (
            <Fragment key={event.eventId}>
              <AlertCard
                notification={eventToAlertCardItem(event)}
                isSelected={selectedId === event.eventId}
                isLoading={isLoadingEvent && selectedId === event.eventId}
                onClick={() => onSelect?.(event.eventId)}
              />
              {index === 2 && <AdPlaceholder variant="inline" />}
              {index === 6 && <UpsellCard />}
            </Fragment>
          ))}
        </div>
      )}
    </div>
  );
}
