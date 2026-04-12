'use client';

import { IconLoader2, IconX } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';
import { type FormEvent, useCallback, useState } from 'react';

import type {
  PersonalReminder,
  CreatePersonalReminderInput,
  UpdatePersonalReminderInput,
  ReminderRecurrence,
} from '@notifio/api-client';

import { cn } from '@/lib/utils';

interface ReminderFormModalProps {
  reminder?: PersonalReminder;
  onSave: (body: CreatePersonalReminderInput | UpdatePersonalReminderInput) => Promise<void>;
  onClose: () => void;
}

const RECURRENCE_OPTIONS: ReminderRecurrence[] = ['ONCE', 'DAILY', 'WEEKLY', 'MONTHLY'];

const WEEK_DAYS = [
  { value: 0, label: 'Su' },
  { value: 1, label: 'Mo' },
  { value: 2, label: 'Tu' },
  { value: 3, label: 'We' },
  { value: 4, label: 'Th' },
  { value: 5, label: 'Fr' },
  { value: 6, label: 'Sa' },
];

function toLocalDatetime(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function parseDays(csv: string | null): Set<number> {
  if (!csv) return new Set();
  return new Set(csv.split(',').map(Number));
}

export function ReminderFormModal({ reminder, onSave, onClose }: ReminderFormModalProps) {
  const t = useTranslations('reminders.form');
  const isEdit = !!reminder;

  const [title, setTitle] = useState(reminder?.title ?? '');
  const [description, setDescription] = useState(reminder?.description ?? '');
  const [triggerAt, setTriggerAt] = useState(
    reminder ? toLocalDatetime(reminder.triggerAt) : '',
  );
  const [recurrence, setRecurrence] = useState<ReminderRecurrence>(
    reminder?.recurrence ?? 'ONCE',
  );
  const [selectedDays, setSelectedDays] = useState<Set<number>>(
    () => parseDays(reminder?.recurrenceDays ?? null),
  );
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
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-background p-6 shadow-2xl">
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

          {/* DateTime */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-text-secondary">
              {t('dateTime')}
            </label>
            <input
              type="datetime-local"
              value={triggerAt}
              onChange={(e) => setTriggerAt(e.target.value)}
              className="h-11 w-full rounded-xl border border-border bg-background px-4 text-sm text-text-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>

          {/* Recurrence */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-text-secondary">
              {t('recurrence')}
            </label>
            <div className="flex gap-1.5">
              {RECURRENCE_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setRecurrence(opt)}
                  className={cn(
                    'rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
                    recurrence === opt
                      ? 'bg-accent text-white'
                      : 'bg-card text-text-secondary hover:text-text-primary',
                  )}
                >
                  {t(opt.toLowerCase() as 'once' | 'daily' | 'weekly' | 'monthly')}
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
                {WEEK_DAYS.map((day) => (
                  <button
                    key={day.value}
                    type="button"
                    onClick={() => toggleDay(day.value)}
                    className={cn(
                      'flex h-9 w-9 items-center justify-center rounded-lg text-xs font-medium transition-colors',
                      selectedDays.has(day.value)
                        ? 'bg-accent text-white'
                        : 'bg-card text-text-secondary hover:text-text-primary',
                    )}
                  >
                    {day.label}
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
    </div>
  );
}
