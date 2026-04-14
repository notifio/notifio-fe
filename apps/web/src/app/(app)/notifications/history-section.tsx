'use client';

import { IconBell, IconLoader2 } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';

import type { NotificationHistoryItem } from '@notifio/api-client';

import { AlertCard } from '@/components/app/alert-card';
import { SetupPromptCard } from '@/components/app/setup-prompt-card';
import { useNotificationHistory } from '@/hooks/use-notification-history';
import { usePermissionStatus } from '@/hooks/use-permission-status';
import { cn } from '@/lib/utils';

// ── Filter config ────────────────────────────────────────────────────
interface FilterDef {
  key: string;
  prefixes: string[];
}

const CATEGORY_FILTERS: FilterDef[] = [
  { key: 'weather', prefixes: ['weather'] },
  { key: 'traffic', prefixes: ['traffic'] },
  { key: 'outages', prefixes: ['outage'] },
  { key: 'pollen', prefixes: ['pollen'] },
  { key: 'events', prefixes: ['planned-events', 'planned_events', 'earthquake'] },
];

function matchesFilter(category: string, filter: string): boolean {
  if (filter === 'all') return true;
  const def = CATEGORY_FILTERS.find((f) => f.key === filter);
  if (!def) return true;
  return def.prefixes.some((p) => category.startsWith(p));
}

// ── Event grouping + day grouping ────────────────────────────────────
interface GroupedNotification {
  item: NotificationHistoryItem;
  count: number;
}

function groupByEventId(items: NotificationHistoryItem[]): GroupedNotification[] {
  const map = new Map<string, GroupedNotification>();
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
}

function groupByDay(
  items: NotificationHistoryItem[],
  labels: { today: string; yesterday: string; older: string },
): Array<{ label: string; grouped: GroupedNotification[] }> {
  const now = new Date();
  const todayStr = now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toDateString();

  const dayBuckets = new Map<string, NotificationHistoryItem[]>();

  for (const item of items) {
    const d = new Date(item.createdAt).toDateString();
    let label: string;
    if (d === todayStr) label = labels.today;
    else if (d === yesterdayStr) label = labels.yesterday;
    else label = labels.older;

    const bucket = dayBuckets.get(label) ?? [];
    bucket.push(item);
    dayBuckets.set(label, bucket);
  }

  const order = [labels.today, labels.yesterday, labels.older];
  return order
    .filter((l) => dayBuckets.has(l))
    .map((l) => ({ label: l, grouped: groupByEventId(dayBuckets.get(l)!) }));
}

export function HistorySection() {
  const t = useTranslations('notificationsPage');
  const { fullyConfigured } = usePermissionStatus();

  const { items, isLoading, hasMore, loadMore } = useNotificationHistory({ limit: 30 });
  const [activeFilter, setActiveFilter] = useState('all');

  const filteredItems = useMemo(
    () => items.filter((n) => matchesFilter(n.category, activeFilter)),
    [items, activeFilter],
  );

  const dayGroups = useMemo(
    () =>
      groupByDay(filteredItems, {
        today: t('history.today'),
        yesterday: t('history.yesterday'),
        older: t('history.older'),
      }),
    [filteredItems, t],
  );

  return (
    <div className="mt-6">
      {/* Filter pills */}
      <div className="flex flex-wrap gap-1.5">
        {['all', ...CATEGORY_FILTERS.map((f) => f.key)].map((key) => (
          <button
            key={key}
            onClick={() => setActiveFilter(key)}
            className={cn(
              'rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
              activeFilter === key
                ? 'bg-accent text-white'
                : 'border border-border text-text-secondary hover:text-text-primary',
            )}
          >
            {t(`filters.${key}`)}
          </button>
        ))}
      </div>

      {/* Notification list */}
      <div className="mt-5">
        {isLoading && items.length === 0 ? (
          <div className="flex justify-center py-16">
            <IconLoader2 size={28} className="animate-spin text-accent" />
          </div>
        ) : filteredItems.length === 0 ? (
          fullyConfigured ? (
            <div className="rounded-2xl border border-dashed border-border bg-card/50 p-10 text-center">
              <IconBell size={36} className="mx-auto text-muted" />
              <p className="mt-3 text-sm text-muted">{t('history.empty')}</p>
            </div>
          ) : (
            <SetupPromptCard variant="full" />
          )
        ) : (
          <div className="space-y-6">
            {dayGroups.map((group) => (
              <div key={group.label}>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">
                  {group.label}
                </p>
                <div className="space-y-1.5">
                  {group.grouped.map((g) => {
                    const isRead = g.item.status !== 'sent';
                    return (
                      <div
                        key={g.item.id}
                        className={cn(
                          'relative rounded-xl',
                          !isRead && 'bg-accent/[0.03]',
                        )}
                      >
                        <AlertCard
                          notification={g.item}
                          duplicateCount={g.count}
                        />
                        {!isRead && (
                          <div className="absolute right-3 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-accent" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            {hasMore && (
              <button
                onClick={loadMore}
                disabled={isLoading}
                className="mx-auto flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-card disabled:opacity-50"
              >
                {isLoading && <IconLoader2 size={14} className="animate-spin" />}
                {t('history.markAllRead')}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
