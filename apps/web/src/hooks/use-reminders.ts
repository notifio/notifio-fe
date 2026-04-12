'use client';

import { useCallback, useEffect, useState } from 'react';

import type {
  PersonalReminder,
  CreatePersonalReminderInput,
  UpdatePersonalReminderInput,
} from '@notifio/api-client';

import { api } from '@/lib/api';

interface UseRemindersResult {
  reminders: PersonalReminder[];
  loading: boolean;
  error: string | null;
  create: (body: CreatePersonalReminderInput) => Promise<PersonalReminder>;
  update: (reminderId: string, body: UpdatePersonalReminderInput) => Promise<PersonalReminder>;
  remove: (reminderId: string) => Promise<void>;
  toggleEnabled: (reminderId: string, enabled: boolean) => Promise<void>;
  refetch: () => Promise<void>;
}

function sortByTrigger(list: PersonalReminder[]): PersonalReminder[] {
  return [...list].sort(
    (a, b) => new Date(a.triggerAt).getTime() - new Date(b.triggerAt).getTime(),
  );
}

export function useReminders(): UseRemindersResult {
  const [reminders, setReminders] = useState<PersonalReminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReminders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getReminders();
      setReminders(sortByTrigger(data));
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load reminders';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReminders();
  }, [fetchReminders]);

  const create = useCallback(async (body: CreatePersonalReminderInput) => {
    const created = await api.createReminder(body);
    setReminders((prev) => sortByTrigger([...prev, created]));
    return created;
  }, []);

  const update = useCallback(async (reminderId: string, body: UpdatePersonalReminderInput) => {
    const updated = await api.updateReminder(reminderId, body);
    setReminders((prev) =>
      sortByTrigger(prev.map((r) => (r.reminderId === reminderId ? updated : r))),
    );
    return updated;
  }, []);

  const remove = useCallback(async (reminderId: string) => {
    await api.deleteReminder(reminderId);
    setReminders((prev) => prev.filter((r) => r.reminderId !== reminderId));
  }, []);

  const toggleEnabled = useCallback(async (reminderId: string, enabled: boolean) => {
    const updated = await api.updateReminder(reminderId, { enabled });
    setReminders((prev) =>
      sortByTrigger(prev.map((r) => (r.reminderId === reminderId ? updated : r))),
    );
  }, []);

  return {
    reminders,
    loading,
    error,
    create,
    update,
    remove,
    toggleEnabled,
    refetch: fetchReminders,
  };
}
