'use client';

import { IconCheck, IconX } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';
import { useEffect } from 'react';

import { cn } from '@/lib/utils';

export type Lifecycle = 'active' | 'upcoming' | 'resolved' | 'all';

interface NotificationFilterSheetProps {
  open: boolean;
  onClose: () => void;
  lifecycle: Lifecycle;
  onLifecycleChange: (lifecycle: Lifecycle) => void;
  category: string;
  onCategoryChange: (category: string) => void;
  lifecycleOptions: readonly Lifecycle[];
  categoryOptions: readonly string[];
}

// Small-viewport (<640px) bottom slide-up sheet hosting both lifecycle
// + category filters. Mirrors the cluster-pins-sheet pattern (backdrop,
// ESC close, body-scroll lock). Selections apply immediately to the
// parent — there is no draft state, so closing the sheet is enough.
export function NotificationFilterSheet({
  open,
  onClose,
  lifecycle,
  onLifecycleChange,
  category,
  onCategoryChange,
  lifecycleOptions,
  categoryOptions,
}: NotificationFilterSheetProps) {
  const t = useTranslations('notificationsPage');
  const tCommon = useTranslations('common');

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:hidden"
      style={{ background: 'rgba(0,0,0,0.55)' }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full rounded-t-2xl bg-background shadow-2xl"
        style={{
          animation: 'notif-filter-slide-up 220ms ease-out',
          maxHeight: '75vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Drag handle (visual only) */}
        <div className="flex justify-center pt-2 pb-1">
          <span className="block h-1 w-10 rounded-full bg-muted/40" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <span className="text-sm font-semibold text-text-primary">
            {t('title')}
          </span>
          <button
            onClick={onClose}
            aria-label={tCommon('close')}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-card text-muted hover:text-text-primary"
          >
            <IconX size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          <div className="grid grid-cols-2 gap-2">
            {lifecycleOptions.map((key) => (
              <button
                key={key}
                onClick={() => onLifecycleChange(key)}
                className={cn(
                  'rounded-lg border px-3 py-2 text-sm font-medium transition-colors',
                  lifecycle === key
                    ? 'border-accent bg-accent text-white'
                    : 'border-border bg-card text-text-secondary hover:text-text-primary',
                )}
              >
                {t(`lifecycle.${key}`)}
              </button>
            ))}
          </div>

          <div className="mt-5 space-y-0.5">
            {categoryOptions.map((key) => (
              <button
                key={key}
                onClick={() => onCategoryChange(key)}
                className={cn(
                  'flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors',
                  category === key
                    ? 'bg-accent/10 text-accent'
                    : 'text-text-primary hover:bg-card',
                )}
              >
                <span>{t(`filters.${key}`)}</span>
                {category === key && <IconCheck size={16} />}
              </button>
            ))}
          </div>
        </div>

        <div className="border-t border-border px-5 py-3">
          <button
            onClick={onClose}
            className="w-full rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent/90"
          >
            {tCommon('done')}
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes notif-filter-slide-up {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
