'use client';

import { IconLoader2 } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { signOut } from '@/app/(app)/actions';
import { api } from '@/lib/api';

export function AccountSection() {
  const t = useTranslations('profile');

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteInput, setDeleteInput] = useState('');
  const [deleting, setDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    if (deleteInput !== 'DELETE') return;
    setDeleting(true);
    try {
      await api.deleteAccount();
      await signOut();
    } catch {
      setDeleting(false);
    }
  };

  return (
    <section>
      <h2 className="text-xs font-semibold uppercase tracking-wider text-muted">
        {t('account.title')}
      </h2>

      <div className="mt-4 space-y-3">
        <button
          onClick={() => signOut()}
          className="w-full rounded-xl bg-card px-4 py-3 text-left text-sm font-medium text-danger transition-colors hover:bg-danger/10"
        >
          {t('account.signOut')}
        </button>

        {!deleteOpen ? (
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
