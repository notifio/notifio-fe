'use client';

import { IconCalendar } from '@tabler/icons-react';
import {
  type ReactNode,
  type TouchEvent,
  useEffect,
  useRef,
  useState,
} from 'react';

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
const SM_BREAKPOINT = '(min-width: 640px)';
const DRAWER_DISMISS_DISTANCE = 80;

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

function useMediaQuery(query: string): boolean {
  // Default to `false` for SSR safety; the browser's matchMedia kicks in
  // on first effect tick. The picker waits for `open === true` before
  // doing anything visible, so the false-on-mount window is harmless.
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(query);
    setMatches(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setMatches(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [query]);
  return matches;
}

interface QuickChip {
  label: string;
  hour: number;
  minute: number;
  dynamic?: boolean;
}

/**
 * Datetime picker rendered as either:
 *  - an inline section (≥640px) bounded with `max-height` + internal
 *    scroll, so the surrounding form keeps its own layout
 *  - a slide-up drawer pinned to the viewport bottom with a backdrop
 *    overlay (<640px), so the picker doesn't fight the form's vertical
 *    flow on mobile web
 *
 * Both variants render the same body (calendar + time + chips +
 * Zatvoriť). All edits write to the parent immediately — no Confirm.
 */
export function NotifioDateTimePicker({
  value,
  onChange,
  locale,
  ariaLabel,
  labels,
}: NotifioDateTimePickerProps) {
  const isDesktop = useMediaQuery(SM_BREAKPOINT);
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

  const body = (
    <>
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
    </>
  );

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

      {open && isDesktop && (
        <div className="mt-2 max-h-[420px] overflow-y-auto rounded-xl bg-[#0E223F] p-4 text-white">
          {body}
        </div>
      )}

      {open && !isDesktop && <Drawer onClose={() => setOpen(false)}>{body}</Drawer>}
    </div>
  );
}

interface DrawerProps {
  onClose: () => void;
  children: ReactNode;
}

/**
 * Bottom-anchored drawer for mobile-web. Slides up from the viewport
 * bottom on mount; backdrop click + drag-down + Zatvoriť dismiss it.
 * Drag is implemented with bare touch handlers (no gesture lib) — dy
 * is mirrored on the sheet's translateY while the user pulls; release
 * past `DRAWER_DISMISS_DISTANCE` closes, otherwise it snaps back.
 */
function Drawer({ onClose, children }: DrawerProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const dragStartY = useRef<number | null>(null);
  const dragDy = useRef(0);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  const onTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    dragStartY.current = e.touches[0]!.clientY;
    dragDy.current = 0;
  };
  const onTouchMove = (e: TouchEvent<HTMLDivElement>) => {
    if (dragStartY.current == null) return;
    const dy = e.touches[0]!.clientY - dragStartY.current;
    if (dy > 0 && sheetRef.current) {
      dragDy.current = dy;
      sheetRef.current.style.transform = `translateY(${dy}px)`;
      sheetRef.current.style.transition = 'none';
    }
  };
  const onTouchEnd = () => {
    if (sheetRef.current) {
      sheetRef.current.style.transition = '';
      sheetRef.current.style.transform = '';
    }
    if (dragDy.current > DRAWER_DISMISS_DISTANCE) onClose();
    dragStartY.current = null;
    dragDy.current = 0;
  };

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col justify-end bg-black/50"
      onClick={onClose}
    >
      <div
        ref={sheetRef}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[80vh] overflow-y-auto rounded-t-2xl bg-[#0E223F] p-4 text-white shadow-2xl"
        style={{ animation: 'picker-slide-up 220ms ease-out' }}
      >
        <div
          className="-mt-1 mb-3 flex justify-center pb-1"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <span className="block h-1 w-10 rounded-full bg-white/20" />
        </div>
        {children}
      </div>
      <style jsx>{`
        @keyframes picker-slide-up {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
      `}</style>
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
