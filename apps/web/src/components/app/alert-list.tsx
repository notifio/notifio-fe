'use client';

import { IconBell } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { useNotificationHistory } from '@/hooks/use-notification-history';

import { AlertCard } from './alert-card';

interface AlertListProps {
  selectedId?: string | null;
  onSelect?: (id: number) => void;
}

export function AlertList({ selectedId, onSelect }: AlertListProps) {
  const t = useTranslations();
  const [activeOnly, setActiveOnly] = useState(false);
  const { items, isLoading, error, hasMore, loadMore, refresh } = useNotificationHistory({
    activeOnly,
  });

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h2 className="text-sm font-semibold text-text-primary">
          {t('notifications.title')}
          {items.length > 0 && <span className="ml-1.5 text-muted">({items.length})</span>}
        </h2>
        <div className="flex gap-1">
          <button
            onClick={() => setActiveOnly(false)}
            className={`rounded-md px-2 py-1 text-xs font-medium transition-colors ${
              !activeOnly ? 'bg-text-primary text-background' : 'text-muted hover:bg-card'
            }`}
          >
            {t('alerts.all')}
          </button>
          <button
            onClick={() => setActiveOnly(true)}
            className={`rounded-md px-2 py-1 text-xs font-medium transition-colors ${
              activeOnly ? 'bg-text-primary text-background' : 'text-muted hover:bg-card'
            }`}
          >
            {t('alerts.sent')}
          </button>
        </div>
      </div>

      {error && (
        <div className="px-4 py-3">
          <p className="text-xs text-danger">{error}</p>
          <button onClick={refresh} className="mt-1 text-xs font-medium text-accent hover:underline">
            {t('common.retry')}
          </button>
        </div>
      )}

      {isLoading && items.length === 0 ? (
        <div className="space-y-2 p-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-card" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-4 py-16">
          <IconBell size={32} className="text-muted" />
          <p className="text-sm text-muted">{t('alerts.noNotifications')}</p>
        </div>
      ) : (
        <div className="space-y-2 p-4">
          {items.map((item) => (
            <AlertCard
              key={item.id}
              notification={item}
              isSelected={selectedId === String(item.id)}
              onClick={() => onSelect?.(item.id)}
            />
          ))}
          {hasMore && (
            <button
              onClick={loadMore}
              disabled={isLoading}
              className="w-full rounded-lg bg-background py-2 text-xs font-medium text-text-secondary transition-colors hover:bg-card disabled:opacity-50"
            >
              {isLoading ? t('common.loading') : t('alerts.loadMore')}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
