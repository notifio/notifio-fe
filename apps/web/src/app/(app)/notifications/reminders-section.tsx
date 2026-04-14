'use client';

import { IconPlus } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';
import { useCallback, useState } from 'react';

import type { PersonalReminder } from '@notifio/api-client';

import { ProGate } from '@/components/app/pro-gate';
import { ReminderFormModal } from '@/components/app/reminder-form-modal';
import { useMembership } from '@/hooks/use-membership';
import { useReminders } from '@/hooks/use-reminders';
import { cn } from '@/lib/utils';

import { ReminderCalendarView } from './reminder-calendar-view';
import { ReminderListView } from './reminder-list-view';

export function RemindersSection() {
  const t = useTranslations('notificationsPage');
  const { isPro } = useMembership();

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

  return (
    <div className="mt-6">
      {/* Header with new reminder button */}
      {isPro && (
        <div className="mb-4 flex justify-end">
          <button
            onClick={() => openCreate()}
            className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-accent/90"
          >
            <IconPlus size={14} />
            {t('reminders.newReminder')}
          </button>
        </div>
      )}

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
          <ReminderListView
            reminders={reminders}
            loading={remLoading}
            onCreate={openCreate}
            onEdit={openEdit}
            onDelete={handleDelete}
            onToggle={handleToggle}
            deletingId={deletingId}
            togglingId={togglingId}
          />
        )}

        {/* ── Calendar view ───────────────────────────────────────── */}
        {remView === 'calendar' && (
          <ReminderCalendarView
            reminders={reminders}
            onEdit={openEdit}
            onCreate={openCreate}
          />
        )}
      </ProGate>

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
