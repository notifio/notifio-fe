'use client';

import { Bell } from 'lucide-react';
import { useState } from 'react';

import { useNotificationHistory } from '@/hooks/use-notification-history';

import { AlertCard } from './alert-card';

interface AlertListProps {
  selectedId?: string | null;
  onSelect?: (id: number) => void;
}

export function AlertList({ selectedId, onSelect }: AlertListProps) {
  const [activeOnly, setActiveOnly] = useState(false);
  const { items, isLoading, error, hasMore, loadMore, refresh } = useNotificationHistory({
    activeOnly,
  });

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
        <h2 className="text-sm font-semibold text-gray-900">
          Notifications
          {items.length > 0 && <span className="ml-1.5 text-gray-400">({items.length})</span>}
        </h2>
        <div className="flex gap-1">
          <button
            onClick={() => setActiveOnly(false)}
            className={`rounded-md px-2 py-1 text-xs font-medium transition-colors ${
              !activeOnly ? 'bg-gray-900 text-white' : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setActiveOnly(true)}
            className={`rounded-md px-2 py-1 text-xs font-medium transition-colors ${
              activeOnly ? 'bg-gray-900 text-white' : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            Sent
          </button>
        </div>
      </div>

      {error && (
        <div className="px-4 py-3">
          <p className="text-xs text-red-600">{error}</p>
          <button onClick={refresh} className="mt-1 text-xs font-medium text-blue-600 hover:underline">
            Retry
          </button>
        </div>
      )}

      {isLoading && items.length === 0 ? (
        <div className="space-y-2 p-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-gray-100" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-4 py-16">
          <Bell size={32} className="text-gray-300" />
          <p className="text-sm text-gray-500">No notifications yet</p>
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
              className="w-full rounded-lg bg-gray-50 py-2 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-100 disabled:opacity-50"
            >
              {isLoading ? 'Loading…' : 'Load more'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
