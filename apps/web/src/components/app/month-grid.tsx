'use client';

import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import { useMemo } from 'react';

import { cn } from '@/lib/utils';

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

/** Monday=0 .. Sunday=6 */
function getFirstDayOfWeek(year: number, month: number): number {
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1;
}

/**
 * Build the seven Mo/Tu/We/... headers in the given locale. We use a
 * known Monday (1970-01-05) and walk seven days forward, so the order
 * is always Monday-first regardless of locale conventions.
 */
function buildWeekdayLabels(locale: string): string[] {
  const fmt = new Intl.DateTimeFormat(locale, { weekday: 'short' });
  const labels: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(Date.UTC(1970, 0, 5 + i)); // 1970-01-05 was a Monday
    labels.push(fmt.format(d));
  }
  return labels;
}

function buildMonthLabel(year: number, month: number, locale: string): string {
  return new Date(year, month).toLocaleString(locale, {
    month: 'long',
    year: 'numeric',
  });
}

interface MonthGridProps {
  /** Current month being shown. */
  year: number;
  month: number;
  /** Selected day-of-month (1-31), or null if none. */
  selectedDay: number | null;
  /** Optional today highlight; pass `new Date()` to enable. */
  today?: Date;
  /** Optional dot indicator per day (e.g. days that have reminders). */
  hasDot?: (day: number) => boolean;
  /** Optional per-day disabled predicate. Disabled days render with
   *  reduced opacity and `pointer-events-none`. Used to gray out past
   *  dates inside the datetime picker. */
  isDisabled?: (day: number) => boolean;
  /** Locale for weekday + month labels (e.g. 'sk', 'en'). */
  locale: string;
  onSelectDay: (day: number) => void;
  onMonthChange: (year: number, month: number) => void;
  /** Compact variant trims paddings — used inside the datetime popover. */
  compact?: boolean;
  /** Day-cell shape. Default `circle` for the calendar tab; the
   *  datetime popover uses `rounded` (filled rectangle). */
  cellShape?: 'circle' | 'rounded';
  /** When true, cells render with palette tuned for the dark navy
   *  popover (white text, white-on-orange selected, white/55 muted). */
  onDarkSurface?: boolean;
}

/**
 * Reusable month-view calendar grid. Used by `reminder-calendar-view`
 * (full-width view) and `datetime-field` (popover datepicker, R3 web).
 * Matches the existing dark-theme styling — no native browser chrome.
 */
export function MonthGrid({
  year,
  month,
  selectedDay,
  today,
  hasDot,
  isDisabled,
  locale,
  onSelectDay,
  onMonthChange,
  compact = false,
  cellShape = 'circle',
  onDarkSurface = false,
}: MonthGridProps) {
  const daysInMonth = getDaysInMonth(year, month);
  const firstDayOffset = getFirstDayOfWeek(year, month);

  const weekdayLabels = useMemo(() => buildWeekdayLabels(locale), [locale]);
  const monthLabel = useMemo(() => buildMonthLabel(year, month, locale), [year, month, locale]);

  const prevMonth = () => {
    if (month === 0) onMonthChange(year - 1, 11);
    else onMonthChange(year, month - 1);
  };
  const nextMonth = () => {
    if (month === 11) onMonthChange(year + 1, 0);
    else onMonthChange(year, month + 1);
  };

  const isToday = (day: number) =>
    today != null &&
    today.getFullYear() === year &&
    today.getMonth() === month &&
    today.getDate() === day;

  const cellSize = compact ? 'h-8 w-8' : 'h-10 w-10';
  const cellText = compact ? 'text-xs' : 'text-sm';

  return (
    <div>
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={prevMonth}
          className={cn(
            'rounded-lg p-1.5 transition-colors',
            onDarkSurface
              ? 'text-white/60 hover:bg-white/[0.08] hover:text-white'
              : 'text-muted hover:bg-card hover:text-text-primary',
          )}
          aria-label="Previous month"
        >
          <IconChevronLeft size={18} />
        </button>
        <span
          className={cn(
            'text-sm font-semibold capitalize',
            onDarkSurface ? 'text-white' : 'text-text-primary',
          )}
        >
          {monthLabel}
        </span>
        <button
          type="button"
          onClick={nextMonth}
          className={cn(
            'rounded-lg p-1.5 transition-colors',
            onDarkSurface
              ? 'text-white/60 hover:bg-white/[0.08] hover:text-white'
              : 'text-muted hover:bg-card hover:text-text-primary',
          )}
          aria-label="Next month"
        >
          <IconChevronRight size={18} />
        </button>
      </div>

      <div
        className={cn(
          'mt-3 grid grid-cols-7 text-center text-[10px] font-semibold uppercase tracking-wider',
          onDarkSurface ? 'text-white/55' : 'text-muted',
        )}
      >
        {weekdayLabels.map((d, i) => (
          <div key={i} className="py-1">
            {d}
          </div>
        ))}
      </div>

      <div className="mt-1 grid grid-cols-7">
        {Array.from({ length: firstDayOffset }).map((_, i) => (
          <div key={`empty-${i}`} className="py-2" />
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const dot = hasDot?.(day) ?? false;
          const sel = selectedDay === day;
          const todayHl = isToday(day);
          const disabled = isDisabled?.(day) ?? false;
          const shapeCls = cellShape === 'rounded' ? 'rounded-md' : 'rounded-full';
          return (
            <button
              key={day}
              type="button"
              onClick={() => onSelectDay(day)}
              disabled={disabled}
              className={cn(
                'relative mx-auto flex flex-col items-center justify-center transition-colors',
                shapeCls,
                cellSize,
                cellText,
                disabled
                  ? 'pointer-events-none opacity-40'
                  : sel
                    ? onDarkSurface
                      ? 'bg-[#FF7A2F] font-semibold text-white'
                      : 'bg-accent text-white'
                    : todayHl
                      ? onDarkSurface
                        ? 'font-semibold text-[#FF7A2F]'
                        : 'bg-accent/10 font-semibold text-accent'
                      : onDarkSurface
                        ? 'text-white/85 hover:bg-white/[0.06]'
                        : 'text-text-secondary hover:bg-card',
              )}
            >
              {day}
              {dot && (
                <span
                  className={cn(
                    'absolute bottom-1 h-1 w-1 rounded-full',
                    sel ? 'bg-white' : 'bg-accent',
                  )}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
