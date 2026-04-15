'use client';

import {
  IconAlarm,
  IconChevronLeft,
  IconChevronRight,
  IconPlus,
} from '@tabler/icons-react';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';

import type { PersonalReminder } from '@notifio/api-client';

import { cn } from '@/lib/utils';

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

interface ReminderCalendarViewProps {
  reminders: PersonalReminder[];
  onEdit: (r: PersonalReminder) => void;
  onCreate: () => void;
}

export function ReminderCalendarView({ reminders, onEdit, onCreate }: ReminderCalendarViewProps) {
  const t = useTranslations('notificationsPage');

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

  const isToday = (day: number) => {
    const n = new Date();
    return n.getFullYear() === calYear && n.getMonth() === calMonth && n.getDate() === day;
  };

  const monthLabel = new Date(calYear, calMonth).toLocaleString(undefined, { month: 'long', year: 'numeric' });

  return (
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
                onClick={() => onCreate()}
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
                  onClick={() => onEdit(r)}
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
  );
}
