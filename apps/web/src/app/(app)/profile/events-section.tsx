'use client';

import {
  IconAlertTriangle,
  IconCheck,
  IconLoader2,
} from '@tabler/icons-react';
import { useTranslations } from 'next-intl';
import { useCallback, useState } from 'react';

import { useUserEvents } from '@/hooks/use-user-events';

export function EventsSection() {
  const t = useTranslations('profile');
  const {
    events,
    loading: eventsLoading,
    updateEvent,
  } = useUserEvents();

  const [resolvingId, setResolvingId] = useState<string | null>(null);

  const handleResolve = useCallback(
    async (eventId: string) => {
      setResolvingId(eventId);
      try {
        await updateEvent(eventId, { resolved: true });
      } finally {
        setResolvingId(null);
      }
    },
    [updateEvent],
  );

  return (
    <section>
      <h2 className="text-xs font-semibold uppercase tracking-wider text-muted">
        {t('myEvents.title')}
      </h2>

      <div className="mt-4">
        {eventsLoading ? (
          <div className="space-y-2">
            {[1, 2].map((i) => (
              <div key={i} className="h-14 animate-pulse rounded-xl bg-card" />
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card/50 p-8 text-center">
            <IconAlertTriangle size={32} className="mx-auto text-muted" />
            <p className="mt-2 text-sm text-muted">{t('myEvents.empty')}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {events.map((event) => (
              <div key={event.eventId} className="flex items-center gap-3 rounded-xl bg-card px-4 py-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-text-primary">
                      {event.subcategoryName || event.title}
                    </span>
                    <span
                      className={
                        event.isResolved
                          ? 'rounded bg-green-500/10 px-1.5 py-0.5 text-[10px] font-medium text-green-600 dark:text-green-400'
                          : 'rounded bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-medium text-amber-600 dark:text-amber-400'
                      }
                    >
                      {event.isResolved ? t('myEvents.resolved') : t('myEvents.active')}
                    </span>
                  </div>
                  <p className="text-xs text-muted">
                    {new Date(event.createdAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                {!event.isResolved && (
                  <button
                    onClick={() => handleResolve(event.eventId)}
                    disabled={resolvingId === event.eventId}
                    className="inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-text-secondary transition-colors hover:bg-background disabled:opacity-50"
                  >
                    {resolvingId === event.eventId ? (
                      <IconLoader2 size={14} className="animate-spin" />
                    ) : (
                      <IconCheck size={14} />
                    )}
                    {t('myEvents.resolve')}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
