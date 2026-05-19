'use client';

import {
  IconAdjustmentsHorizontal,
  IconBell,
  IconCheck,
  IconChevronDown,
  IconLoader2,
} from '@tabler/icons-react';
import { useTranslations } from 'next-intl';
import { Fragment, useEffect, useMemo, useRef, useState } from 'react';

import type { NotificationHistoryItem } from '@notifio/api-client';

import { AdPlaceholder } from '@/components/app/ad-placeholder';
import { AlertCard } from '@/components/app/alert-card';
import { SetupPromptCard } from '@/components/app/setup-prompt-card';
import { UpsellCard } from '@/components/app/upsell-card';
import { useNotificationHistory } from '@/hooks/use-notification-history';
import { usePermissionStatus } from '@/hooks/use-permission-status';
import { cn } from '@/lib/utils';

import { NotificationFilterSheet, type Lifecycle } from './notification-filter-sheet';

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

const LIFECYCLE_OPTIONS: readonly Lifecycle[] = ['active', 'upcoming', 'resolved', 'all'];
const CATEGORY_OPTIONS: readonly string[] = ['all', ...CATEGORY_FILTERS.map((f) => f.key)];

export function HistorySection() {
  const t = useTranslations('notificationsPage');
  const tNotif = useTranslations('notifications');
  const { fullyConfigured } = usePermissionStatus();

  const [lifecycle, setLifecycle] = useState<Lifecycle>('active');
  const { items, isLoading, error, hasMore, loadMore, refresh } = useNotificationHistory({
    limit: 30,
    status: lifecycle,
  });
  const [activeFilter, setActiveFilter] = useState('all');

  // Sheet drives the small-viewport (<640px) UI; categoryPopoverOpen
  // drives the desktop inline-dropdown trigger.
  const [sheetOpen, setSheetOpen] = useState(false);
  const [categoryPopoverOpen, setCategoryPopoverOpen] = useState(false);
  const categoryPopoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!categoryPopoverOpen) return;
    const onClick = (e: MouseEvent) => {
      if (!categoryPopoverRef.current?.contains(e.target as Node)) {
        setCategoryPopoverOpen(false);
      }
    };
    window.addEventListener('mousedown', onClick);
    return () => window.removeEventListener('mousedown', onClick);
  }, [categoryPopoverOpen]);

  const filteredItems = useMemo(
    () => items.filter((n) => matchesFilter(n.category, activeFilter)),
    [items, activeFilter],
  );

  const activeFilterCount =
    (lifecycle === 'active' ? 0 : 1) + (activeFilter === 'all' ? 0 : 1);

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
      {/* Desktop filter row (≥640px): segmented control + category dropdown trigger.
          Small-viewport (<640px) collapses to a single Filter button that opens
          the bottom slide-up sheet. */}
      <div className="flex items-center gap-3">
        {/* Segmented lifecycle control (sm+) */}
        <div className="hidden rounded-lg border border-border bg-card p-1 sm:inline-flex">
          {LIFECYCLE_OPTIONS.map((key) => (
            <button
              key={key}
              onClick={() => setLifecycle(key)}
              className={cn(
                'rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
                lifecycle === key
                  ? 'bg-accent text-white'
                  : 'text-text-secondary hover:text-text-primary',
              )}
            >
              {t(`lifecycle.${key}`)}
            </button>
          ))}
        </div>

        {/* Category dropdown trigger (sm+) */}
        <div className="relative hidden sm:block" ref={categoryPopoverRef}>
          <button
            onClick={() => setCategoryPopoverOpen((v) => !v)}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium transition-colors',
              categoryPopoverOpen
                ? 'bg-card text-text-primary'
                : 'text-text-primary hover:bg-card',
            )}
            aria-expanded={categoryPopoverOpen}
          >
            <IconAdjustmentsHorizontal size={14} />
            <span>{t(`filters.${activeFilter}`)}</span>
            <IconChevronDown
              size={14}
              className={cn('transition-transform', categoryPopoverOpen && 'rotate-180')}
            />
          </button>
          {categoryPopoverOpen && (
            <div className="absolute left-0 z-20 mt-2 min-w-[180px] rounded-lg border border-border bg-background py-1 shadow-lg">
              {CATEGORY_OPTIONS.map((key) => (
                <button
                  key={key}
                  onClick={() => {
                    setActiveFilter(key);
                    setCategoryPopoverOpen(false);
                  }}
                  className={cn(
                    'flex w-full items-center justify-between px-3 py-2 text-xs transition-colors hover:bg-card',
                    activeFilter === key
                      ? 'text-accent font-medium'
                      : 'text-text-primary',
                  )}
                >
                  <span>{t(`filters.${key}`)}</span>
                  {activeFilter === key && <IconCheck size={14} />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Small-viewport: single Filter button opening the bottom sheet */}
        <button
          onClick={() => setSheetOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-text-primary transition-colors hover:bg-card sm:hidden"
        >
          <IconAdjustmentsHorizontal size={14} />
          <span>{t(`filters.${activeFilter}`)} · {t(`lifecycle.${lifecycle}`)}</span>
          {activeFilterCount > 0 && (
            <span className="ml-1 inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-accent px-1 text-[10px] font-semibold text-white">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      <NotificationFilterSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        lifecycle={lifecycle}
        onLifecycleChange={setLifecycle}
        category={activeFilter}
        onCategoryChange={setActiveFilter}
        lifecycleOptions={LIFECYCLE_OPTIONS}
        categoryOptions={CATEGORY_OPTIONS}
      />

      {/* Notification list */}
      <div className="mt-5">
        {error && items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card/50 p-10 text-center">
            <p className="text-sm text-muted">{tNotif('error')}</p>
            <button
              onClick={refresh}
              className="mt-3 inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-accent/90"
            >
              {tNotif('retry')}
            </button>
          </div>
        ) : isLoading && items.length === 0 ? (
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
            {(() => {
              let itemCount = 0;
              return dayGroups.map((group) => (
                <div key={group.label}>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">
                    {group.label}
                  </p>
                  <div className="space-y-1.5">
                    {group.grouped.map((g) => {
                      itemCount++;
                      return (
                        <Fragment key={g.item.id}>
                          <div className="relative rounded-xl">
                            <AlertCard
                              notification={g.item}
                              duplicateCount={g.count}
                            />
                          </div>
                          {itemCount === 3 && <AdPlaceholder variant="inline" />}
                          {itemCount === 7 && <UpsellCard />}
                        </Fragment>
                      );
                    })}
                  </div>
                </div>
              ));
            })()}

            {hasMore && (
              <button
                onClick={loadMore}
                disabled={isLoading}
                className="mx-auto flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-card disabled:opacity-50"
              >
                {isLoading && <IconLoader2 size={14} className="animate-spin" />}
                {tNotif('loadMore')}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
