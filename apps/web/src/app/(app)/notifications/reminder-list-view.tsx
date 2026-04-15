'use client';

import {
  IconAlarm,
  IconLoader2,
  IconPencil,
  IconPlus,
  IconTrash,
} from '@tabler/icons-react';
import { useTranslations } from 'next-intl';

import type { PersonalReminder } from '@notifio/api-client';

import { Toggle } from '@/components/ui/toggle';

import { RECURRENCE_KEYS } from './_constants';

interface ReminderListViewProps {
  reminders: PersonalReminder[];
  loading: boolean;
  onCreate: () => void;
  onEdit: (r: PersonalReminder) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string, enabled: boolean) => void;
  deletingId: string | null;
  togglingId: string | null;
}

export function ReminderListView({
  reminders,
  loading,
  onCreate,
  onEdit,
  onDelete,
  onToggle,
  deletingId,
  togglingId,
}: ReminderListViewProps) {
  const t = useTranslations('notificationsPage');

  return (
    <div className="mt-5">
      {loading ? (
        <div className="flex justify-center py-16">
          <IconLoader2 size={28} className="animate-spin text-accent" />
        </div>
      ) : reminders.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card/50 p-10 text-center">
          <IconAlarm size={36} className="mx-auto text-muted" />
          <p className="mt-3 text-sm text-muted">{t('reminders.empty')}</p>
          <button
            onClick={() => onCreate()}
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
                      onChange={(v) => onToggle(r.reminderId, v)}
                    />
                  )}
                  <button
                    onClick={() => onEdit(r)}
                    className="rounded-lg p-1.5 text-muted transition-colors hover:bg-background hover:text-text-primary"
                  >
                    <IconPencil size={15} />
                  </button>
                  <button
                    onClick={() => onDelete(r.reminderId)}
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
  );
}
