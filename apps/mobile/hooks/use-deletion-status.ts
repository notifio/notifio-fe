import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

import { api } from '../lib/api';

const STORAGE_KEY = 'notifio_deletion_scheduled_at';

// Grace period: 24h from scheduling (GDPR-compliant)
const GRACE_PERIOD_MS = 24 * 60 * 60 * 1000;

interface UseDeletionStatusResult {
  deletionScheduledAt: string | null;
  cancelling: boolean;
  scheduleDeletion: () => void;
  cancelDeletion: () => Promise<void>;
  clearDeletionState: () => void;
}

export function useDeletionStatus(): UseDeletionStatusResult {
  const [deletionScheduledAt, setDeletionScheduledAt] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((stored) => {
      if (stored) setDeletionScheduledAt(stored);
    });
  }, []);

  const scheduleDeletion = useCallback(() => {
    const scheduledAt = new Date(Date.now() + GRACE_PERIOD_MS).toISOString();
    AsyncStorage.setItem(STORAGE_KEY, scheduledAt);
    setDeletionScheduledAt(scheduledAt);
  }, []);

  const cancelDeletion = useCallback(async () => {
    setCancelling(true);
    try {
      await api.cancelAccountDeletion();
      await AsyncStorage.removeItem(STORAGE_KEY);
      setDeletionScheduledAt(null);
    } finally {
      setCancelling(false);
    }
  }, []);

  const clearDeletionState = useCallback(() => {
    AsyncStorage.removeItem(STORAGE_KEY);
    setDeletionScheduledAt(null);
  }, []);

  return { deletionScheduledAt, cancelling, scheduleDeletion, cancelDeletion, clearDeletionState };
}
