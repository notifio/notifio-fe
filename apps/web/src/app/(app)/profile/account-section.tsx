'use client';

import { IconAlertTriangle, IconCheck, IconDownload, IconLoader2 } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { signOut } from '@/app/(app)/actions';
import { useToast } from '@/components/ui/toast';
import { useDataExport } from '@/hooks/use-data-export';
import { useDeletionStatus } from '@/hooks/use-deletion-status';
import { api } from '@/lib/api';
import { formatTimeRemaining } from '@/lib/format';

export function AccountSection() {
  const t = useTranslations('profile');
  const toast = useToast();

  // Data export
  const { state: exportState, downloadUrl, expiresAt, error: exportError, requestExport } = useDataExport();

  // Deletion
  const { deletionScheduledAt, cancelling, cancelDeletion, scheduleDeletion } = useDeletionStatus();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteInput, setDeleteInput] = useState('');
  const [deleting, setDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    if (deleteInput !== 'DELETE') return;
    setDeleting(true);
    try {
      await api.deleteAccount();
      scheduleDeletion();
      setDeleteOpen(false);
      setDeleteInput('');
    } catch {
      // stay on page
    } finally {
      setDeleting(false);
    }
  };

  const handleCancelDeletion = async () => {
    try {
      await cancelDeletion();
      toast.success(t('deletion.cancelled'));
    } catch {
      toast.error(t('yourData.failed'));
    }
  };

  const handleRequestExport = () => {
    requestExport();
  };

  return (
    <section>
      <h2 className="text-xs font-semibold uppercase tracking-wider text-muted">
        {t('account.title')}
      </h2>

      <div className="mt-4 space-y-3">
        {/* Data export card */}
        <div className="rounded-xl bg-card p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent/10">
              <IconDownload size={18} className="text-accent" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-text-primary">
                {t('yourData.title')}
              </p>
              <p className="mt-0.5 text-xs text-muted">
                {exportState === 'ready'
                  ? t('yourData.ready')
                  : t('yourData.description')}
              </p>
            </div>
          </div>

          <div className="mt-3">
            {exportState === 'idle' && (
              <button
                onClick={handleRequestExport}
                className="inline-flex items-center gap-2 rounded-lg bg-accent/10 px-4 py-2 text-sm font-medium text-accent transition-colors hover:bg-accent/20"
              >
                <IconDownload size={16} />
                {t('yourData.download')}
              </button>
            )}

            {exportState === 'processing' && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted">
                  <IconLoader2 size={16} className="animate-spin" />
                  {t('yourData.preparing')}
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-border">
                  <div className="h-full w-1/3 animate-pulse rounded-full bg-accent" />
                </div>
              </div>
            )}

            {exportState === 'ready' && downloadUrl && (
              <div className="flex items-center gap-3">
                <a
                  href={downloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg bg-green-500/10 px-4 py-2 text-sm font-medium text-green-600 transition-colors hover:bg-green-500/20"
                >
                  <IconCheck size={16} />
                  {t('yourData.downloadZip')}
                </a>
                {expiresAt && (
                  <span className="text-xs text-muted">
                    {t('yourData.expiresIn', { time: formatTimeRemaining(expiresAt) })}
                  </span>
                )}
              </div>
            )}
          </div>

          {exportError && (
            <p className="mt-2 text-xs text-danger">{t('yourData.failed')}</p>
          )}
        </div>

        {/* Sign out */}
        <button
          onClick={() => signOut()}
          className="w-full rounded-xl bg-card px-4 py-3 text-left text-sm font-medium text-danger transition-colors hover:bg-danger/10"
        >
          {t('account.signOut')}
        </button>

        {/* Deletion pending — replaces delete button */}
        {deletionScheduledAt ? (
          <div className="rounded-xl border border-danger/30 bg-danger/5 p-4">
            <div className="flex items-start gap-3">
              <IconAlertTriangle size={20} className="mt-0.5 shrink-0 text-danger" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-danger">
                  {t('deletion.pending')}
                </p>
                <p className="mt-0.5 text-xs text-text-secondary">
                  {t('deletion.description', { time: formatTimeRemaining(deletionScheduledAt) })}
                </p>
              </div>
            </div>
            <button
              onClick={handleCancelDeletion}
              disabled={cancelling}
              className="mt-3 inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent/90 disabled:opacity-50"
            >
              {cancelling && <IconLoader2 size={14} className="animate-spin" />}
              {t('deletion.cancel')}
            </button>
          </div>
        ) : !deleteOpen ? (
          <button
            onClick={() => setDeleteOpen(true)}
            className="w-full rounded-xl bg-card px-4 py-3 text-left text-sm font-medium text-text-secondary transition-colors hover:bg-card/80"
          >
            {t('account.deleteAccount')}
          </button>
        ) : (
          <div className="rounded-xl border border-danger/30 bg-danger/5 p-4">
            <p className="text-sm text-danger">{t('account.deleteConfirm')}</p>
            <p className="mt-2 text-xs text-muted">{t('account.deleteVerify')}</p>
            <input
              type="text"
              value={deleteInput}
              onChange={(e) => setDeleteInput(e.target.value)}
              placeholder="DELETE"
              className="mt-2 h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-text-primary placeholder:text-muted focus:border-danger focus:outline-none focus:ring-1 focus:ring-danger"
            />
            <div className="mt-3 flex gap-2">
              <button
                onClick={handleDeleteAccount}
                disabled={deleteInput !== 'DELETE' || deleting}
                className="inline-flex items-center gap-2 rounded-lg bg-danger px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-danger/90 disabled:opacity-50"
              >
                {deleting && <IconLoader2 size={14} className="animate-spin" />}
                {t('account.deleteAccount')}
              </button>
              <button
                onClick={() => {
                  setDeleteOpen(false);
                  setDeleteInput('');
                }}
                className="rounded-lg px-4 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-card"
              >
                {t('locations.cancel')}
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
