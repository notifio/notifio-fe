'use client';

import { IconAlarm, IconPlus } from '@tabler/icons-react';
import { useLocale, useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';

import type { PersonalReminder } from '@notifio/api-client';

import { MonthGrid } from '@/components/app/month-grid';

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
  /** When the user clicks "+ new reminder" with a day selected, the
   *  selected date is passed so the form can prefill it. */
  onCreate: (date?: Date) => void;
}

export function ReminderCalendarView({ reminders, onEdit, onCreate }: ReminderCalendarViewProps) {
  const t = useTranslations('notificationsPage');
  const locale = useLocale();

  const now = new Date();
  const [calYear, setCalYear] = useState(now.getFullYear());
  const [calMonth, setCalMonth] = useState(now.getMonth());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const reminderDots = useMemo(() => {
    const dots = new Set<number>();
    const last = new Date(calYear, calMonth + 1, 0).getDate();
    for (let day = 1; day <= last; day++) {
      const date = new Date(calYear, calMonth, day);
      if (reminders.some((r) => r.enabled && reminderFallsOnDate(r, date))) {
        dots.add(day);
      }
    }
    return dots;
  }, [reminders, calYear, calMonth]);

  const selectedDayReminders = useMemo(() => {
    if (selectedDay === null) return [];
    const date = new Date(calYear, calMonth, selectedDay);
    return reminders.filter((r) => reminderFallsOnDate(r, date));
  }, [reminders, calYear, calMonth, selectedDay]);

  const handleMonthChange = (y: number, m: number) => {
    setCalYear(y);
    setCalMonth(m);
    setSelectedDay(null);
  };

  return (
    <div className="mt-5">
      <MonthGrid
        year={calYear}
        month={calMonth}
        selectedDay={selectedDay}
        today={now}
        hasDot={(d) => reminderDots.has(d)}
        locale={locale}
        onSelectDay={(d) => setSelectedDay(selectedDay === d ? null : d)}
        onMonthChange={handleMonthChange}
      />

      {/* Selected day reminders */}
      {selectedDay !== null && (
        <div className="mt-4 border-t border-border pt-4">
          {selectedDayReminders.length === 0 ? (
            <div className="text-center">
              <p className="text-xs text-muted">{t('reminders.empty')}</p>
              <button
                onClick={() => onCreate(new Date(calYear, calMonth, selectedDay ?? 1))}
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
                      {new Date(r.triggerAt).toLocaleTimeString(locale, {
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
