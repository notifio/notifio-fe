'use client';

import { IconLoader2, IconX } from '@tabler/icons-react';
import { useLocale, useTranslations } from 'next-intl';
import {
  type FormEvent,
  type TouchEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import type {
  PersonalReminder,
  CreatePersonalReminderInput,
  UpdatePersonalReminderInput,
  ReminderRecurrence,
} from '@notifio/api-client';

import { NotifioDateTimePicker } from '@/components/app/notifio-date-time-picker';
import { cn } from '@/lib/utils';

interface ReminderFormModalProps {
  reminder?: PersonalReminder;
  /** Prefill the date portion when opening for create from the calendar
   *  view. Time defaults to 09:00. Ignored when `reminder` is set. */
  defaultDate?: Date;
  onSave: (body: CreatePersonalReminderInput | UpdatePersonalReminderInput) => Promise<void>;
  onClose: () => void;
}

const RECURRENCE_OPTIONS: ReminderRecurrence[] = [
  'ONCE',
  'DAILY',
  'WEEKLY',
  'BIWEEKLY',
  'MONTHLY',
  'YEARLY',
];

// Sunday-first values to match BE's `recurrenceDays` CSV (where
// 0=Sunday). Short labels are derived per-render from Intl in the
// app locale so they don't drift from the calendar grid.
const WEEK_DAY_VALUES = [0, 1, 2, 3, 4, 5, 6] as const;

function buildWeekDayShort(locale: string): Record<number, string> {
  const fmt = new Intl.DateTimeFormat(locale, { weekday: 'short' });
  const sunday = Date.UTC(1970, 0, 4);
  const map: Record<number, string> = {};
  for (const i of WEEK_DAY_VALUES) {
    map[i] = fmt.format(new Date(sunday + i * 86400000));
  }
  return map;
}

function toLocalDatetime(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function parseDays(csv: string | null): Set<number> {
  if (!csv) return new Set();
  return new Set(csv.split(',').map(Number));
}

export function ReminderFormModal({ reminder, defaultDate, onSave, onClose }: ReminderFormModalProps) {
  const t = useTranslations('reminders.form');
  const tPicker = useTranslations('picker');
  const locale = useLocale();
  const isEdit = !!reminder;

  const [title, setTitle] = useState(reminder?.title ?? '');
  const [description, setDescription] = useState(reminder?.description ?? '');
  const [triggerAt, setTriggerAt] = useState(() => {
    if (reminder) return toLocalDatetime(reminder.triggerAt);
    if (defaultDate) {
      const pad = (n: number) => String(n).padStart(2, '0');
      const d = defaultDate;
      // Default to 09:00 on the prefilled day; user can adjust in the popover.
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T09:00`;
    }
    return '';
  });
  const [recurrence, setRecurrence] = useState<ReminderRecurrence>(
    reminder?.recurrence ?? 'ONCE',
  );
  const [selectedDays, setSelectedDays] = useState<Set<number>>(
    () => parseDays(reminder?.recurrenceDays ?? null),
  );

  const weekDayShort = useMemo(() => buildWeekDayShort(locale), [locale]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleDay = useCallback((day: number) => {
    setSelectedDays((prev) => {
      const next = new Set(prev);
      if (next.has(day)) next.delete(day);
      else next.add(day);
      return next;
    });
  }, []);

  const isValid =
    title.trim().length > 0 &&
    title.length <= 200 &&
    description.length <= 1000 &&
    triggerAt.length > 0 &&
    (recurrence !== 'WEEKLY' || selectedDays.size > 0);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!isValid || saving) return;

    setSaving(true);
    setError(null);

    const recurrenceDays =
      recurrence === 'WEEKLY'
        ? [...selectedDays].sort((a, b) => a - b).join(',')
        : undefined;

    const body = {
      title: title.trim(),
      ...(description.trim() ? { description: description.trim() } : {}),
      triggerAt: new Date(triggerAt).toISOString(),
      recurrence,
      ...(recurrenceDays !== undefined ? { recurrenceDays } : {}),
    };

    try {
      await onSave(body);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to save reminder';
      setError(msg);
      setSaving(false);
    }
  };

  return (
    <FormShell onClose={onClose}>
      {/* Original form body — same children for both centered modal and
          mobile-web bottom drawer presentations. */}
      <div className="p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-text-primary">
            {isEdit ? t('edit') : t('create')}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted transition-colors hover:bg-card hover:text-text-primary"
          >
            <IconX size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Title */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-text-secondary">
              {t('title')}
            </label>
            <input
              type="text"
              maxLength={200}
              placeholder={t('titlePlaceholder')}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-11 w-full rounded-xl border border-border bg-background px-4 text-sm text-text-primary placeholder:text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>

          {/* Description */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-text-secondary">
              {t('description')}
            </label>
            <textarea
              maxLength={1000}
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-text-primary placeholder:text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>

          {/* DateTime — styled popover replacing native datetime-local
              widget, so the picker matches the dark theme and renders
              weekday/month names in the app locale (R3 + R2). */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-text-secondary">
              {t('dateTime')}
            </label>
            <NotifioDateTimePicker
              value={triggerAt}
              onChange={setTriggerAt}
              locale={locale}
              labels={{
                placeholder: tPicker('placeholder'),
                time: tPicker('time'),
                quickOptions: tPicker('quickOptions'),
                plusOneHour: tPicker('plusOneHour'),
                close: tPicker('close'),
              }}
            />
          </div>

          {/* Recurrence */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-text-secondary">
              {t('recurrence')}
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {RECURRENCE_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setRecurrence(opt)}
                  className={cn(
                    'rounded-lg px-3 py-1.5 text-center text-xs font-medium transition-colors',
                    recurrence === opt
                      ? 'bg-accent text-white'
                      : 'bg-card text-text-secondary hover:text-text-primary',
                  )}
                >
                  {t(
                    opt.toLowerCase() as
                      | 'once'
                      | 'daily'
                      | 'weekly'
                      | 'biweekly'
                      | 'monthly'
                      | 'yearly',
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Weekly day picker */}
          {recurrence === 'WEEKLY' && (
            <div>
              <label className="mb-1.5 block text-sm font-medium text-text-secondary">
                {t('weekDays')}
              </label>
              <div className="flex gap-1.5">
                {WEEK_DAY_VALUES.map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => toggleDay(value)}
                    className={cn(
                      'flex h-9 w-9 items-center justify-center rounded-lg text-xs font-medium transition-colors',
                      selectedDays.has(value)
                        ? 'bg-accent text-white'
                        : 'bg-card text-text-secondary hover:text-text-primary',
                    )}
                  >
                    {weekDayShort[value]}
                  </button>
                ))}
              </div>
            </div>
          )}

          {error && (
            <div className="rounded-lg bg-danger/10 px-4 py-2.5 text-sm text-danger">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              type="submit"
              disabled={!isValid || saving}
              className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-accent text-sm font-semibold text-white transition-colors hover:bg-accent/90 disabled:opacity-50"
            >
              {saving && <IconLoader2 size={16} className="animate-spin" />}
              {t('save')}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex h-11 items-center justify-center rounded-xl px-5 text-sm font-medium text-text-secondary transition-colors hover:bg-card"
            >
              {t('cancel')}
            </button>
          </div>
        </form>
      </div>
    </FormShell>
  );
}

// ── FormShell — viewport-aware modal/drawer wrapper ────────────────

const SM_BREAKPOINT = '(min-width: 640px)';
const DRAWER_DISMISS_DISTANCE = 80;

function useMediaQuery(query: string): boolean {
  // Default to `false` for SSR safety — mobile drawer chrome is the
  // safer fallback for first paint (the form modal isn't visible
  // until the user clicks "Nová pripomienka", so the SSR path never
  // actually renders this).
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

interface FormShellProps {
  onClose: () => void;
  children: React.ReactNode;
}

/**
 * Shared modal-or-drawer wrapper. ≥640px renders a centered card with
 * `max-h-[85vh]` internal scroll (current desktop UX). <640px slides
 * up from viewport bottom with backdrop, drag-down + backdrop
 * dismiss, and `max-h-[90vh]` internal scroll. The form children stay
 * identical in both — only the chrome differs.
 */
function FormShell({ onClose, children }: FormShellProps) {
  const isDesktop = useMediaQuery(SM_BREAKPOINT);
  const sheetRef = useRef<HTMLDivElement>(null);
  const dragStartY = useRef<number | null>(null);
  const dragDy = useRef(0);

  // Lock body scroll while open + ESC dismiss.
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

  if (isDesktop) {
    return (
      <div
        className="fixed inset-0 z-[90] flex items-center justify-center bg-black/60 p-4"
        onClick={onClose}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="scrollbar-hidden max-h-[85vh] w-full max-w-md overflow-y-auto rounded-2xl border border-border bg-background shadow-2xl"
        >
          {children}
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-[90] flex flex-col justify-end bg-black/60"
      onClick={onClose}
    >
      <div
        ref={sheetRef}
        onClick={(e) => e.stopPropagation()}
        className="scrollbar-hidden max-h-[90vh] w-full overflow-y-auto rounded-t-2xl bg-background shadow-2xl"
        style={{ animation: 'rfm-slide-up 220ms ease-out' }}
      >
        <div
          className="flex justify-center pb-1 pt-2"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <span className="block h-1 w-10 rounded-full bg-muted/40" />
        </div>
        {children}
      </div>
      <style jsx>{`
        @keyframes rfm-slide-up {
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
