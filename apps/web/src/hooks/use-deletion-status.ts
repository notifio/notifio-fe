'use client';

import { useCallback, useEffect, useState } from 'react';

import { api } from '@/lib/api';

// Uses sessionStorage — deletion state is lost when the tab closes.
// TODO: Replace with real field from GET /me once BE adds deletionScheduledAt.
// Until then, the banner only shows in the same browser session.
const STORAGE_KEY = 'notifio:deletion-scheduled-at';

interface UseDeletionStatusResult {
  deletionScheduledAt: string | null;
  cancelling: boolean;
  cancelDeletion: () => Promise<void>;
  scheduleDeletion: () => void;
}

export function useDeletionStatus(): UseDeletionStatusResult {
  const [deletionScheduledAt, setDeletionScheduledAt] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored) setDeletionScheduledAt(stored);
  }, []);

  const scheduleDeletion = useCallback(() => {
    // TODO: Replace with real field from GET /me once BE adds deletionScheduledAt
    // For now, store a timestamp 72h from now (GDPR grace period)
    const scheduledAt = new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString();
    sessionStorage.setItem(STORAGE_KEY, scheduledAt);
    setDeletionScheduledAt(scheduledAt);
  }, []);

  const cancelDeletion = useCallback(async () => {
    setCancelling(true);
    try {
      await api.cancelAccountDeletion();
      sessionStorage.removeItem(STORAGE_KEY);
      setDeletionScheduledAt(null);
    } finally {
      setCancelling(false);
    }
  }, []);

  return { deletionScheduledAt, cancelling, cancelDeletion, scheduleDeletion };
}
