import { useCallback, useEffect, useState } from 'react';

import type {
  CreatePersonalReminderInput,
  PersonalReminder,
  UpdatePersonalReminderInput,
} from '@notifio/api-client';

import { api } from '../lib/api';
import { showToast } from '../lib/toast';

interface UseRemindersResult {
  reminders: PersonalReminder[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
  createReminder: (body: CreatePersonalReminderInput) => Promise<void>;
  updateReminder: (id: string, body: UpdatePersonalReminderInput) => Promise<void>;
  deleteReminder: (id: string) => Promise<void>;
  toggleEnabled: (id: string, enabled: boolean) => Promise<void>;
}

export function useReminders(): UseRemindersResult {
  const [reminders, setReminders] = useState<PersonalReminder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getReminders();
      setReminders(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load reminders');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const createReminder = useCallback(
    async (body: CreatePersonalReminderInput) => {
      await api.createReminder(body);
      await fetch();
      showToast.success('Reminder saved');
    },
    [fetch],
  );

  const updateReminder = useCallback(
    async (id: string, body: UpdatePersonalReminderInput) => {
      await api.updateReminder(id, body);
      await fetch();
      showToast.success('Reminder saved');
    },
    [fetch],
  );

  const deleteReminder = useCallback(
    async (id: string) => {
      await api.deleteReminder(id);
      await fetch();
      showToast.success('Reminder deleted');
    },
    [fetch],
  );

  const toggleEnabled = useCallback(
    async (id: string, enabled: boolean) => {
      await api.updateReminder(id, { enabled });
      await fetch();
    },
    [fetch],
  );

  return {
    reminders,
    isLoading,
    error,
    refetch: fetch,
    createReminder,
    updateReminder,
    deleteReminder,
    toggleEnabled,
  };
}
