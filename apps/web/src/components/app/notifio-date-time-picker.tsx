'use client';

import { IconCalendar } from '@tabler/icons-react';
import { useState } from 'react';

import { cn } from '@/lib/utils';

import { MonthGrid } from './month-grid';

interface NotifioDateTimePickerProps {
  /** ISO-ish local datetime string (YYYY-MM-DDTHH:mm). Empty = unset. */
  value: string;
  onChange: (next: string) => void;
  locale: string;
  ariaLabel?: string;
  labels: PickerLabels;
}

interface PickerLabels {
  placeholder: string;
  time: string;
  quickOptions: string;
  plusOneHour: string;
  close: string;
}

const pad = (n: number) => String(n).padStart(2, '0');

function parseValue(value: string): { date: Date | null; hour: number; minute: number } {
  if (!value) return { date: null, hour: 9, minute: 0 };
  const [datePart, timePart = '09:00'] = value.split('T');
  if (!datePart) return { date: null, hour: 9, minute: 0 };
  const [y, m, d] = datePart.split('-').map(Number);
  const [hh, mm] = timePart.split(':').map(Number);
  if (
    !Number.isFinite(y) ||
    !Number.isFinite(m) ||
    !Number.isFinite(d) ||
    !Number.isFinite(hh) ||
    !Number.isFinite(mm)
  ) {
    return { date: null, hour: 9, minute: 0 };
  }
  return { date: new Date(y!, (m as number) - 1, d), hour: hh!, minute: mm! };
}

function formatIsoLike(year: number, month: number, day: number, hour: number, minute: number): string {
  return `${year}-${pad(month + 1)}-${pad(day)}T${pad(hour)}:${pad(minute)}`;
}

function startOfDay(d: Date): Date {
  const c = new Date(d);
  c.setHours(0, 0, 0, 0);
  return c;
}

function nextRoundHourFromNow(): { hour: number; minute: number } {
  const inOneHour = new Date(Date.now() + 60 * 60 * 1000);
  let hour = inOneHour.getHours();
  if (inOneHour.getMinutes() > 0) hour += 1;
  return { hour: Math.min(23, hour), minute: 0 };
}

interface QuickChip {
  label: string;
  hour: number;
  minute: number;
  dynamic?: boolean;
}

/**
 * Inline-section datetime picker. Trigger button + collapsible
 * section in normal flow — no popover, no drawer. The reminder form
 * itself becomes a drawer on mobile web; this picker just lives
 * inside the form's flow at every viewport width.
 *
 * All edits write to the parent immediately — no draft state, no
 * Confirm button. The "Zatvoriť" button at the bottom collapses the
 * section back.
 */
export function NotifioDateTimePicker({
  value,
  onChange,
  locale,
  ariaLabel,
  labels,
}: NotifioDateTimePickerProps) {
  const [open, setOpen] = useState(false);

  const parsed = parseValue(value);
  const today = startOfDay(new Date());
  const seedDate = parsed.date ?? today;

  const [calYear, setCalYear] = useState(seedDate.getFullYear());
  const [calMonth, setCalMonth] = useState(seedDate.getMonth());

  const [hourInput, setHourInput] = useState(pad(parsed.hour));
  const [minuteInput, setMinuteInput] = useState(pad(parsed.minute));

  const selectedDay =
    parsed.date && parsed.date.getFullYear() === calYear && parsed.date.getMonth() === calMonth
      ? parsed.date.getDate()
      : null;

  const isPastDay = (day: number) => {
    const candidate = new Date(calYear, calMonth, day);
    return startOfDay(candidate) < today;
  };

  const writeValue = (date: Date, hour: number, minute: number) => {
    onChange(formatIsoLike(date.getFullYear(), date.getMonth(), date.getDate(), hour, minute));
  };

  const handleSelectDay = (day: number) => {
    if (isPastDay(day)) return;
    writeValue(new Date(calYear, calMonth, day), parsed.hour, parsed.minute);
  };

  const setTime = (h: number, m: number) => {
    const clampedH = Math.max(0, Math.min(23, h));
    const clampedM = Math.max(0, Math.min(59, m));
    setHourInput(pad(clampedH));
    setMinuteInput(pad(clampedM));
    writeValue(parsed.date ?? today, clampedH, clampedM);
  };

  const plusOneHour = nextRoundHourFromNow();
  const quickChips: QuickChip[] = [
    { label: '08:00', hour: 8, minute: 0 },
    { label: '12:00', hour: 12, minute: 0 },
    { label: '18:00', hour: 18, minute: 0 },
    {
      label: labels.plusOneHour,
      hour: plusOneHour.hour,
      minute: plusOneHour.minute,
      dynamic: true,
    },
  ];

  const triggerLabel = parsed.date
    ? `${parsed.date.toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' })}, ${pad(parsed.hour)}:${pad(parsed.minute)}`
    : null;

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={ariaLabel ?? triggerLabel ?? labels.placeholder}
        aria-expanded={open}
        className={cn(
          'flex h-11 w-full items-center justify-between rounded-xl border border-border bg-background px-4 text-sm transition-colors',
          'hover:border-accent/60 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent',
        )}
      >
        <span className={triggerLabel ? 'text-text-primary' : 'text-muted'}>
          {triggerLabel ?? labels.placeholder}
        </span>
        <IconCalendar size={16} className="ml-2 shrink-0 text-muted" />
      </button>

      {open && (
        <div className="mt-2 rounded-xl bg-[#0E223F] p-4 text-white">
          <MonthGrid
            year={calYear}
            month={calMonth}
            selectedDay={selectedDay}
            today={today}
            isDisabled={isPastDay}
            locale={locale}
            onSelectDay={handleSelectDay}
            onMonthChange={(y, m) => {
              setCalYear(y);
              setCalMonth(m);
            }}
            compact
            cellShape="rounded"
            onDarkSurface
          />

          <div className="mt-4 h-px bg-white/[0.08]" />

          <div className="mt-4 flex items-center gap-3">
            <span className="text-xs font-medium text-[#5A6A85]">{labels.time}</span>
            <div className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-[#0B1B32] px-2 py-1.5">
              <TimeBox
                value={hourInput}
                onChange={(next) => {
                  setHourInput(next);
                  if (next.length === 0) return;
                  const n = Number(next);
                  if (Number.isFinite(n)) setTime(Math.max(0, Math.min(23, n)), parsed.minute);
                }}
                onBlur={() => setHourInput(pad(parsed.hour))}
                max={23}
              />
              <span className="text-lg font-medium text-[#5A6A85]">:</span>
              <TimeBox
                value={minuteInput}
                onChange={(next) => {
                  setMinuteInput(next);
                  if (next.length === 0) return;
                  const n = Number(next);
                  if (Number.isFinite(n)) setTime(parsed.hour, Math.max(0, Math.min(59, n)));
                }}
                onBlur={() => setMinuteInput(pad(parsed.minute))}
                max={59}
              />
            </div>
          </div>

          <div className="mt-4">
            <span className="text-xs font-medium text-[#5A6A85]">{labels.quickOptions}</span>
            <div className="mt-1.5 flex flex-row flex-wrap gap-1.5">
              {quickChips.map((chip) => {
                const active = !chip.dynamic && chip.hour === parsed.hour && chip.minute === parsed.minute;
                return (
                  <button
                    key={chip.label}
                    type="button"
                    onClick={() => {
                      if (chip.dynamic) {
                        const fresh = nextRoundHourFromNow();
                        setTime(fresh.hour, fresh.minute);
                      } else {
                        setTime(chip.hour, chip.minute);
                      }
                    }}
                    className={cn(
                      'rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors',
                      active
                        ? 'bg-[#FF7A2F] text-white'
                        : 'bg-white/[0.06] text-white/75 hover:bg-white/[0.1] hover:text-white',
                    )}
                  >
                    {chip.label}
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setOpen(false)}
            className="mt-4 w-full rounded-lg border border-white/10 bg-white/[0.04] py-2 text-sm font-medium text-white/80 transition-colors hover:bg-white/[0.08] hover:text-white"
          >
            {labels.close}
          </button>
        </div>
      )}
    </div>
  );
}

interface TimeBoxProps {
  value: string;
  onChange: (next: string) => void;
  onBlur: () => void;
  max: number;
}

function TimeBox({ value, onChange, onBlur, max }: TimeBoxProps) {
  return (
    <input
      type="text"
      inputMode="numeric"
      maxLength={2}
      value={value}
      onChange={(e) => {
        const cleaned = e.target.value.replace(/\D/g, '').slice(0, 2);
        const n = Number(cleaned);
        if (cleaned === '' || (Number.isFinite(n) && n <= max)) {
          onChange(cleaned);
        }
      }}
      onBlur={onBlur}
      onFocus={(e) => e.currentTarget.select()}
      className="h-10 w-12 rounded-md bg-transparent text-center text-xl font-semibold text-white focus:outline-none"
    />
  );
}
