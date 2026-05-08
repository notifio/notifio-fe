'use client';

import {
  autoUpdate,
  flip,
  offset,
  shift,
  size,
  useFloating,
} from '@floating-ui/react-dom';
import { IconCalendar, IconX } from '@tabler/icons-react';
import { useEffect, useRef, useState } from 'react';

import { cn } from '@/lib/utils';

import { MonthGrid } from './month-grid';

interface NotifioDateTimePickerProps {
  /** ISO-ish local datetime string (YYYY-MM-DDTHH:mm). Empty = unset. */
  value: string;
  onChange: (next: string) => void;
  locale: string;
  /** Optional aria label for the trigger; defaults to formatted value. */
  ariaLabel?: string;
  /** All user-facing strings — required so callers thread translations
   *  through next-intl/i18next. Keeps this component pure (no t() call
   *  inside, so it works in any i18n setup). */
  labels: PickerLabels;
}

interface PickerLabels {
  placeholder: string;
  time: string;
  quickOptions: string;
  plusOneHour: string;
  confirm: string;
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

/**
 * Compute the next-round-hour after now, capped at 23:00. 11:00 → 12:00,
 * 11:02 → 13:00, 22:30 → 23:00, 23:30 → 23:00.
 */
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
  /** "+1 hod" chip resolves at click-time for a fresh target. */
  dynamic?: boolean;
}

export function NotifioDateTimePicker({
  value,
  onChange,
  locale,
  ariaLabel,
  labels,
}: NotifioDateTimePickerProps) {
  const [open, setOpen] = useState(false);

  // Floating UI — anchor + flip/shift inside the viewport. The `size`
  // middleware caps the popover at the available width (max 540px on
  // wide viewports, parent-bound minus a 16px gutter on narrow ones)
  // so the picker never bleeds past the modal it lives in.
  const { refs, floatingStyles } = useFloating({
    open,
    placement: 'bottom-start',
    middleware: [
      offset(8),
      flip(),
      shift({ padding: 8 }),
      size({
        padding: 8,
        apply({ availableWidth, availableHeight, elements }) {
          Object.assign(elements.floating.style, {
            maxWidth: `${Math.max(280, Math.min(540, availableWidth - 16))}px`,
            // Compact mobile layout target: ~360px. Cap at available
            // height so the popover never extends past viewport, with a
            // soft floor so we don't crush below useful.
            maxHeight: `${Math.max(360, Math.min(560, availableHeight - 16))}px`,
          });
        },
      }),
    ],
    whileElementsMounted: autoUpdate,
  });

  const parsed = parseValue(value);
  const today = startOfDay(new Date());
  const seedDate = parsed.date ?? today;

  const [calYear, setCalYear] = useState(seedDate.getFullYear());
  const [calMonth, setCalMonth] = useState(seedDate.getMonth());

  const [draftDate, setDraftDate] = useState<Date | null>(parsed.date);
  const [draftHour, setDraftHour] = useState(parsed.hour);
  const [draftMinute, setDraftMinute] = useState(parsed.minute);
  const [hourInput, setHourInput] = useState(pad(parsed.hour));
  const [minuteInput, setMinuteInput] = useState(pad(parsed.minute));

  useEffect(() => {
    if (!open) return;
    setDraftDate(parsed.date);
    setDraftHour(parsed.hour);
    setDraftMinute(parsed.minute);
    setHourInput(pad(parsed.hour));
    setMinuteInput(pad(parsed.minute));
    if (parsed.date) {
      setCalYear(parsed.date.getFullYear());
      setCalMonth(parsed.date.getMonth());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const triggerEl = refs.reference.current as HTMLElement | null;
  const floatingRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!open) return;
    const onClickOutside = (e: MouseEvent) => {
      const t = e.target as Node;
      if (triggerEl?.contains(t)) return;
      if (floatingRef.current?.contains(t)) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onClickOutside);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClickOutside);
      document.removeEventListener('keydown', onKey);
    };
  }, [open, triggerEl]);

  const selectedDay =
    draftDate && draftDate.getFullYear() === calYear && draftDate.getMonth() === calMonth
      ? draftDate.getDate()
      : null;

  const isPastDay = (day: number) => {
    const candidate = new Date(calYear, calMonth, day);
    return startOfDay(candidate) < today;
  };

  const handleSelectDay = (day: number) => {
    if (isPastDay(day)) return;
    setDraftDate(new Date(calYear, calMonth, day));
  };

  const setTime = (h: number, m: number) => {
    const clampedH = Math.max(0, Math.min(23, h));
    const clampedM = Math.max(0, Math.min(59, m));
    setDraftHour(clampedH);
    setDraftMinute(clampedM);
    setHourInput(pad(clampedH));
    setMinuteInput(pad(clampedM));
  };

  const commit = () => {
    const date = draftDate ?? today;
    onChange(formatIsoLike(date.getFullYear(), date.getMonth(), date.getDate(), draftHour, draftMinute));
    setOpen(false);
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
    <>
      <button
        ref={refs.setReference}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={ariaLabel ?? triggerLabel ?? labels.placeholder}
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
        <div
          ref={(el) => {
            floatingRef.current = el;
            refs.setFloating(el);
          }}
          role="dialog"
          style={floatingStyles}
          className="z-30 flex flex-col gap-3 overflow-auto rounded-2xl border border-white/5 bg-[#162D4F] p-3 text-white shadow-2xl sm:gap-4 sm:p-4"
        >
          {/* Close X */}
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label={labels.close}
            className="absolute right-3 top-3 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-white/[0.08] text-white/70 transition-colors hover:bg-white/[0.14] hover:text-white"
          >
            <IconX size={14} />
          </button>

          <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
            {/* Calendar */}
            <div className="min-w-0 flex-1">
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
            </div>

            {/* Time pad — single bottom row on mobile (label + inputs +
                chips wrap inline), fixed-width sidebar on desktop. */}
            <div className="flex w-full shrink-0 flex-col gap-3 sm:w-[160px]">
              <div className="flex flex-col gap-1.5 sm:gap-2">
                <span className="text-xs font-medium text-[#5A6A85]">{labels.time}</span>
                <div className="inline-flex items-center gap-1.5 self-start rounded-lg border border-white/10 bg-[#0B1B32] px-2 py-1.5">
                  <TimeBox
                    value={hourInput}
                    onChange={(next) => {
                      setHourInput(next);
                      const n = Number(next);
                      if (Number.isFinite(n) && next.length > 0) setDraftHour(Math.max(0, Math.min(23, n)));
                    }}
                    onBlur={() => setHourInput(pad(draftHour))}
                    max={23}
                  />
                  <span className="text-lg font-medium text-[#5A6A85]">:</span>
                  <TimeBox
                    value={minuteInput}
                    onChange={(next) => {
                      setMinuteInput(next);
                      const n = Number(next);
                      if (Number.isFinite(n) && next.length > 0) setDraftMinute(Math.max(0, Math.min(59, n)));
                    }}
                    onBlur={() => setMinuteInput(pad(draftMinute))}
                    max={59}
                  />
                </div>
              </div>

              <div>
                <span className="text-xs font-medium text-[#5A6A85]">{labels.quickOptions}</span>
                <div className="mt-1 flex flex-row flex-wrap gap-1.5 sm:flex-col">
                  {quickChips.map((chip) => {
                    const active = !chip.dynamic && chip.hour === draftHour && chip.minute === draftMinute;
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
                          'rounded-md px-2.5 py-1.5 text-center text-xs font-medium transition-colors sm:text-left',
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
                onClick={commit}
                className="rounded-lg bg-[#FF7A2F] px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#FF7A2F]/90 sm:mt-auto"
              >
                {labels.confirm}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
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
