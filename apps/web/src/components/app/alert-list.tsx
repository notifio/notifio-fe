'use client';

import { IconBell } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';

import type { NotificationHistoryItem } from '@notifio/api-client';

import { useNotificationHistory } from '@/hooks/use-notification-history';
import { usePermissionStatus } from '@/hooks/use-permission-status';

import { AlertCard } from './alert-card';
import { isResolved } from './alert-card-utils';
import { SetupPromptCard } from './setup-prompt-card';

type TabFilter = 'all' | 'active' | 'resolved';

interface AlertListProps {
  selectedId?: string | null;
  onSelect?: (eventId: string) => void;
  isLoadingEvent?: boolean;
}

export function AlertList({ selectedId, onSelect, isLoadingEvent = false }: AlertListProps) {
  const t = useTranslations();
  const [tab, setTab] = useState<TabFilter>('all');
  const { items, isLoading, error, hasMore, loadMore, refresh } = useNotificationHistory();
  const { fullyConfigured } = usePermissionStatus();

  // Group by eventId — keep most recent, track count
  const grouped = useMemo(() => {
    const map = new Map<string, { item: NotificationHistoryItem; count: number }>();
    for (const item of items) {
      const existing = map.get(item.eventId);
      if (existing) {
        existing.count++;
        if (new Date(item.createdAt) > new Date(existing.item.createdAt)) {
          existing.item = item;
        }
      } else {
        map.set(item.eventId, { item, count: 1 });
      }
    }
    return Array.from(map.values());
  }, [items]);

  // Filter by tab
  const filtered = useMemo(() => {
    if (tab === 'all') return grouped;
    if (tab === 'active') return grouped.filter((g) => !isResolved(g.item));
    return grouped.filter((g) => isResolved(g.item));
  }, [grouped, tab]);

  const tabs: { key: TabFilter; label: string }[] = [
    { key: 'all', label: t('alerts.all') },
    { key: 'active', label: t('alerts.active') },
    { key: 'resolved', label: t('alerts.resolved') },
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

      {error && (
        <div className="px-4 py-3">
          <p className="text-xs text-danger">{error}</p>
          <button
            onClick={refresh}
            className="mt-1 text-xs font-medium text-accent hover:underline"
          >
            {t('common.retry')}
          </button>
        </div>
      )}

      {isLoading && items.length === 0 ? (
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
          {filtered.map((g) => (
            <AlertCard
              key={g.item.id}
              notification={g.item}
              duplicateCount={g.count}
              isSelected={selectedId === g.item.eventId}
              isLoading={isLoadingEvent && selectedId === g.item.eventId}
              onClick={() => onSelect?.(g.item.eventId)}
            />
          ))}
          {hasMore && (
            <button
              onClick={loadMore}
              disabled={isLoading}
              className="w-full rounded-lg bg-background py-2 text-xs font-medium text-text-secondary transition-colors hover:bg-card disabled:opacity-50"
            >
              {isLoading ? t('common.loading') : t('alerts.loadMore')}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
