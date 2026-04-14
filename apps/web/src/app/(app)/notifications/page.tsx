'use client';

import {
  IconAlarm,
  IconBell,
  IconChevronLeft,
  IconChevronRight,
  IconLoader2,
  IconPencil,
  IconPlus,
  IconTrash,
} from '@tabler/icons-react';
import { useTranslations } from 'next-intl';
import { useCallback, useMemo, useState } from 'react';

import type { NotificationHistoryItem, PersonalReminder } from '@notifio/api-client';

import { AlertCard } from '@/components/app/alert-card';
import { ProGate } from '@/components/app/pro-gate';
import { ReminderFormModal } from '@/components/app/reminder-form-modal';
import { SetupPromptCard } from '@/components/app/setup-prompt-card';
import { Toggle } from '@/components/ui/toggle';
import { useMembership } from '@/hooks/use-membership';
import { useNotificationHistory } from '@/hooks/use-notification-history';
import { usePermissionStatus } from '@/hooks/use-permission-status';
import { useReminders } from '@/hooks/use-reminders';
import { cn } from '@/lib/utils';

type Tab = 'history' | 'reminders';

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

// ── Calendar helpers ─────────────────────────────────────────────────
function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year: number, month: number): number {
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1; // Monday=0
}

const WEEKDAY_LABELS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

function reminderFallsOnDate(r: PersonalReminder, date: Date): boolean {
  const trigger = new Date(r.triggerAt);
  if (r.recurrence === 'DAILY') return true;
  if (r.recurrence === 'MONTHLY') return trigger.getDate() === date.getDate();
  if (r.recurrence === 'WEEKLY' && r.recurrenceDays) {
    const dayOfWeek = date.getDay(); // 0=Sun
    return r.recurrenceDays.split(',').map(Number).includes(dayOfWeek);
  }
  // ONCE — exact date match
  return trigger.toDateString() === date.toDateString();
}

// ── RECURRENCE LABELS ────────────────────────────────────────────────
const RECURRENCE_KEYS: Record<string, string> = {
  ONCE: 'once',
  DAILY: 'daily',
  WEEKLY: 'weekly',
  MONTHLY: 'monthly',
};

// ── Component ────────────────────────────────────────────────────────
export default function NotificationsPage() {
  const t = useTranslations('notificationsPage');
  const { isPro } = useMembership();
  const { fullyConfigured } = usePermissionStatus();

  // Tab state
  const [activeTab, setActiveTab] = useState<Tab>('history');

  // ── History ────────────────────────────────────────────────────────
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

  // ── Reminders ──────────────────────────────────────────────────────
  const {
    reminders,
    loading: remLoading,
    create,
    update,
    remove,
    toggleEnabled,
  } = useReminders();

  const [remView, setRemView] = useState<'list' | 'calendar'>('list');
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<PersonalReminder | undefined>();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  // Calendar state
  const now = new Date();
  const [calYear, setCalYear] = useState(now.getFullYear());
  const [calMonth, setCalMonth] = useState(now.getMonth());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const daysInMonth = getDaysInMonth(calYear, calMonth);
  const firstDayOffset = getFirstDayOfWeek(calYear, calMonth);

  const reminderDots = useMemo(() => {
    const dots = new Set<number>();
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(calYear, calMonth, day);
      if (reminders.some((r) => r.enabled && reminderFallsOnDate(r, date))) {
        dots.add(day);
      }
    }
    return dots;
  }, [reminders, calYear, calMonth, daysInMonth]);

  const selectedDayReminders = useMemo(() => {
    if (selectedDay === null) return [];
    const date = new Date(calYear, calMonth, selectedDay);
    return reminders.filter((r) => reminderFallsOnDate(r, date));
  }, [reminders, calYear, calMonth, selectedDay]);

  const prevMonth = () => {
    if (calMonth === 0) { setCalYear((y) => y - 1); setCalMonth(11); }
    else setCalMonth((m) => m - 1);
    setSelectedDay(null);
  };
  const nextMonth = () => {
    if (calMonth === 11) { setCalYear((y) => y + 1); setCalMonth(0); }
    else setCalMonth((m) => m + 1);
    setSelectedDay(null);
  };

  const openCreate = useCallback(() => {
    setEditTarget(undefined);
    setFormOpen(true);
  }, []);

  const openEdit = useCallback((r: PersonalReminder) => {
    setEditTarget(r);
    setFormOpen(true);
  }, []);

  const handleSave = useCallback(
    async (body: Record<string, unknown>) => {
      if (editTarget) {
        await update(editTarget.reminderId, body);
      } else {
        await create(body as Parameters<typeof create>[0]);
      }
      setFormOpen(false);
      setEditTarget(undefined);
    },
    [editTarget, create, update],
  );

  const handleDelete = useCallback(
    async (id: string) => {
      setDeletingId(id);
      try { await remove(id); } finally { setDeletingId(null); }
    },
    [remove],
  );

  const handleToggle = useCallback(
    async (id: string, enabled: boolean) => {
      setTogglingId(id);
      try { await toggleEnabled(id, enabled); } finally { setTogglingId(null); }
    },
    [toggleEnabled],
  );

  const isToday = (day: number) => {
    const n = new Date();
    return n.getFullYear() === calYear && n.getMonth() === calMonth && n.getDate() === day;
  };

  const monthLabel = new Date(calYear, calMonth).toLocaleString(undefined, { month: 'long', year: 'numeric' });

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 md:px-8 md:py-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text-primary">{t('title')}</h1>
        {activeTab === 'reminders' && isPro && (
          <button
            onClick={() => openCreate()}
            className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-accent/90"
          >
            <IconPlus size={14} />
            {t('reminders.newReminder')}
          </button>
        )}
      </div>

      {/* Tab bar */}
      <div className="mt-6 flex border-b border-border">
        {(['history', 'reminders'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              'relative px-4 pb-3 text-sm font-medium transition-colors',
              activeTab === tab
                ? 'text-accent'
                : 'text-text-secondary hover:text-text-primary',
            )}
          >
            {t(`tabs.${tab}`)}
            {activeTab === tab && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-accent" />
            )}
          </button>
        ))}
      </div>

      {/* ── History tab ──────────────────────────────────────────────── */}
      {activeTab === 'history' && (
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
      )}

      {/* ── Reminders tab ────────────────────────────────────────────── */}
      {activeTab === 'reminders' && (
        <div className="mt-6">
          <ProGate requiredTier="PRO">
            {/* View toggle */}
            <div className="flex items-center gap-1 rounded-full bg-card p-1">
              <button
                onClick={() => setRemView('list')}
                className={cn(
                  'rounded-full px-4 py-1.5 text-xs font-medium transition-colors',
                  remView === 'list'
                    ? 'bg-accent text-white'
                    : 'text-text-secondary hover:text-text-primary',
                )}
              >
                {t('reminders.viewList')}
              </button>
              <button
                onClick={() => setRemView('calendar')}
                className={cn(
                  'rounded-full px-4 py-1.5 text-xs font-medium transition-colors',
                  remView === 'calendar'
                    ? 'bg-accent text-white'
                    : 'text-text-secondary hover:text-text-primary',
                )}
              >
                {t('reminders.viewCalendar')}
              </button>
            </div>

            {/* ── List view ──────────────────────────────────────────── */}
            {remView === 'list' && (
              <div className="mt-5">
                {remLoading ? (
                  <div className="flex justify-center py-16">
                    <IconLoader2 size={28} className="animate-spin text-accent" />
                  </div>
                ) : reminders.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-border bg-card/50 p-10 text-center">
                    <IconAlarm size={36} className="mx-auto text-muted" />
                    <p className="mt-3 text-sm text-muted">{t('reminders.empty')}</p>
                    <button
                      onClick={() => openCreate()}
                      className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent/90"
                    >
                      <IconPlus size={14} />
                      {t('reminders.newReminder')}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {reminders.map((r) => (
                      <div key={r.reminderId} className="rounded-xl bg-card p-4">
                        <div className="flex items-start gap-3">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-text-primary">
                                {r.title}
                              </span>
                              <span className="rounded bg-card px-1.5 py-0.5 text-[10px] font-medium text-muted">
                                {t(`reminders.${RECURRENCE_KEYS[r.recurrence] ?? 'once'}`)}
                              </span>
                              {!r.enabled && (
                                <span className="rounded bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-medium text-amber-600 dark:text-amber-400">
                                  {t('reminders.disabled')}
                                </span>
                              )}
                            </div>
                            {r.description && (
                              <p className="mt-0.5 text-xs text-muted">{r.description}</p>
                            )}
                            <p className="mt-1 text-xs text-text-secondary">
                              {new Date(r.triggerAt).toLocaleString(undefined, {
                                month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                              })}
                            </p>
                          </div>
                          <div className="flex shrink-0 items-center gap-2">
                            {togglingId === r.reminderId ? (
                              <IconLoader2 size={18} className="animate-spin text-muted" />
                            ) : (
                              <Toggle
                                checked={r.enabled}
                                onChange={(v) => handleToggle(r.reminderId, v)}
                              />
                            )}
                            <button
                              onClick={() => openEdit(r)}
                              className="rounded-lg p-1.5 text-muted transition-colors hover:bg-background hover:text-text-primary"
                            >
                              <IconPencil size={15} />
                            </button>
                            <button
                              onClick={() => handleDelete(r.reminderId)}
                              disabled={deletingId === r.reminderId}
                              className="rounded-lg p-1.5 text-muted transition-colors hover:bg-danger/10 hover:text-danger disabled:opacity-50"
                            >
                              {deletingId === r.reminderId ? (
                                <IconLoader2 size={15} className="animate-spin" />
                              ) : (
                                <IconTrash size={15} />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── Calendar view ───────────────────────────────────────── */}
            {remView === 'calendar' && (
              <div className="mt-5">
                {/* Month nav */}
                <div className="flex items-center justify-between">
                  <button
                    onClick={prevMonth}
                    className="rounded-lg p-1.5 text-muted transition-colors hover:bg-card hover:text-text-primary"
                  >
                    <IconChevronLeft size={18} />
                  </button>
                  <span className="text-sm font-semibold capitalize text-text-primary">
                    {monthLabel}
                  </span>
                  <button
                    onClick={nextMonth}
                    className="rounded-lg p-1.5 text-muted transition-colors hover:bg-card hover:text-text-primary"
                  >
                    <IconChevronRight size={18} />
                  </button>
                </div>

                {/* Weekday headers */}
                <div className="mt-3 grid grid-cols-7 text-center text-[10px] font-semibold uppercase tracking-wider text-muted">
                  {WEEKDAY_LABELS.map((d) => (
                    <div key={d} className="py-1">{d}</div>
                  ))}
                </div>

                {/* Day grid */}
                <div className="mt-1 grid grid-cols-7">
                  {/* Empty cells for offset */}
                  {Array.from({ length: firstDayOffset }).map((_, i) => (
                    <div key={`empty-${i}`} className="py-2" />
                  ))}
                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1;
                    const hasDot = reminderDots.has(day);
                    const isSel = selectedDay === day;
                    const todayHighlight = isToday(day);
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => setSelectedDay(isSel ? null : day)}
                        className={cn(
                          'relative mx-auto flex h-10 w-10 flex-col items-center justify-center rounded-full text-sm transition-colors',
                          isSel
                            ? 'bg-accent text-white'
                            : todayHighlight
                              ? 'bg-accent/10 font-semibold text-accent'
                              : 'text-text-secondary hover:bg-card',
                        )}
                      >
                        {day}
                        {hasDot && (
                          <div
                            className={cn(
                              'absolute bottom-1 h-1 w-1 rounded-full',
                              isSel ? 'bg-white' : 'bg-accent',
                            )}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Selected day reminders */}
                {selectedDay !== null && (
                  <div className="mt-4 border-t border-border pt-4">
                    {selectedDayReminders.length === 0 ? (
                      <div className="text-center">
                        <p className="text-xs text-muted">{t('reminders.empty')}</p>
                        <button
                          onClick={() => openCreate()}
                          className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-accent transition-colors hover:text-accent/80"
                        >
                          <IconPlus size={12} />
                          {t('reminders.newReminder')}
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {selectedDayReminders.map((r) => (
                          <button
                            key={r.reminderId}
                            type="button"
                            onClick={() => openEdit(r)}
                            className="flex w-full items-center gap-3 rounded-xl bg-card px-4 py-3 text-left transition-colors hover:bg-card/80"
                          >
                            <IconAlarm size={16} className="shrink-0 text-accent" />
                            <div className="min-w-0 flex-1">
                              <span className="text-sm font-medium text-text-primary">{r.title}</span>
                              <span className="ml-2 text-xs text-muted">
                                {new Date(r.triggerAt).toLocaleTimeString(undefined, {
                                  hour: '2-digit', minute: '2-digit',
                                })}
                              </span>
                            </div>
                            {!r.enabled && (
                              <span className="rounded bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-medium text-amber-600 dark:text-amber-400">
                                {t('reminders.disabled')}
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </ProGate>
        </div>
      )}

      {/* Reminder form modal */}
      {formOpen && (
        <ReminderFormModal
          reminder={editTarget}
          onSave={handleSave}
          onClose={() => {
            setFormOpen(false);
            setEditTarget(undefined);
          }}
        />
      )}
    </div>
  );
}
