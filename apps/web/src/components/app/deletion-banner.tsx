'use client';

import { IconAlertTriangle, IconLoader2 } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';

import { useToast } from '@/components/ui/toast';
import { useDeletionStatus } from '@/hooks/use-deletion-status';
import { formatTimeRemaining } from '@/lib/format';

export function DeletionBanner() {
  const t = useTranslations('profile');
  const toast = useToast();
  const { deletionScheduledAt, cancelling, cancelDeletion } = useDeletionStatus();

  if (!deletionScheduledAt) return null;

  const handleCancel = async () => {
    try {
      await cancelDeletion();
      toast.success(t('deletion.cancelled'));
    } catch {
      toast.error(t('yourData.failed'));
    }
  };

  return (
    <div className="border-b border-danger/20 bg-danger/5 px-4 py-3">
      <div className="mx-auto flex max-w-5xl items-center gap-3">
        <IconAlertTriangle size={20} className="shrink-0 text-danger" />
        <div className="min-w-0 flex-1">
          <span className="text-sm font-semibold text-danger">
            {t('deletion.pending')}
          </span>
          <span className="ml-2 text-sm text-text-secondary">
            {t('deletion.description', { time: formatTimeRemaining(deletionScheduledAt) })}
          </span>
        </div>
        <button
          onClick={handleCancel}
          disabled={cancelling}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-accent px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-accent/90 disabled:opacity-50"
        >
          {cancelling && <IconLoader2 size={12} className="animate-spin" />}
          {t('deletion.cancel')}
        </button>
      </div>
    </div>
  );
}
