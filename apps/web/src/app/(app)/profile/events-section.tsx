'use client';

import {
  IconCheck,
  IconLoader2,
  IconMapPin,
  IconTrash,
} from '@tabler/icons-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useCallback, useMemo, useState } from 'react';

import { useUserEvents } from '@notifio/shared/hooks';

import { useToast } from '@/components/ui/toast';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';

type Lifecycle = 'active' | 'resolved' | 'all';
const LIFECYCLE_OPTIONS: readonly Lifecycle[] = ['active', 'resolved', 'all'];

export function EventsSection() {
  const t = useTranslations('profile');
  const te = useTranslations('events');
  const tnp = useTranslations('notificationsPage');
  // TODO: migrate localEmpty.* to @notifio/shared in next shared bump.
  const tLocalEmpty = useTranslations('localEmpty');
  const toast = useToast();
  const {
    events,
    isLoading: eventsLoading,
    updateEvent,
    refresh: refetch,
  } = useUserEvents();

  // Lifecycle filter: BE has no `?status=` on /events/mine. UserEvent
  // carries only `isResolved: boolean` (2-state), so the strip exposes
  // Active / Resolved / All — no `upcoming` (user-reported events
  // don't have an upcoming state today). Filter is client-side only.
  const [lifecycle, setLifecycle] = useState<Lifecycle>('active');
  const filteredEvents = useMemo(() => {
    if (lifecycle === 'all') return events;
    if (lifecycle === 'active') return events.filter((e) => !e.isResolved);
    return events.filter((e) => e.isResolved);
  }, [events, lifecycle]);

  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

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

  const handleDelete = useCallback(
    async (eventId: string) => {
      setDeletingId(eventId);
      try {
        await api.deleteEvent(eventId);
        toast.success(te('deleted'));
        await refetch();
      } catch {
        // stay on page
      } finally {
        setDeletingId(null);
        setDeleteConfirmId(null);
      }
    },
    [refetch, toast, te],
  );

  return (
    <section>
      {/* Lifecycle strip — Active / Resolved / All. Mirrors the
          segmented control on the Notifikácie sub-tab. No filter sheet
          on Hlásenia until BE adds scope (Mine/All) or category
          filters; the strip alone covers the practical use cases for
          user-reported events. The previous "MOJE HLÁSENIA" h2 is
          dropped — the tab label "Hlásenia" already provides context. */}
      <div className="inline-flex rounded-lg border border-border bg-card p-1">
        {LIFECYCLE_OPTIONS.map((key) => (
          <button
            key={key}
            onClick={() => setLifecycle(key)}
            className={cn(
              'rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
              lifecycle === key
                ? 'bg-accent text-white'
                : 'text-text-secondary hover:text-text-primary',
            )}
          >
            {tnp(`lifecycle.${key}`)}
          </button>
        ))}
      </div>

      <div className="mt-4">
        {eventsLoading ? (
          <div className="space-y-2">
            {[1, 2].map((i) => (
              <div key={i} className="h-14 animate-pulse rounded-xl bg-card" />
            ))}
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card/50 p-10 text-center">
            <IconMapPin size={36} className="mx-auto text-muted" />
            <p className="mt-3 text-sm font-medium text-text-primary">
              {tLocalEmpty('noReports.title')}
            </p>
            <p className="mt-1 text-xs text-muted">
              {tLocalEmpty('noReports.subtitle')}
            </p>
            <Link
              href="/map"
              className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-accent/90"
            >
              <IconMapPin size={14} />
              {tLocalEmpty('noReports.openMap')}
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredEvents.map((event) => (
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
                <div className="flex shrink-0 items-center gap-1">
                  {!event.isResolved && (
                    <button
                      onClick={() => handleResolve(event.eventId)}
                      disabled={resolvingId === event.eventId}
                      className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-text-secondary transition-colors hover:bg-background disabled:opacity-50"
                    >
                      {resolvingId === event.eventId ? (
                        <IconLoader2 size={14} className="animate-spin" />
                      ) : (
                        <IconCheck size={14} />
                      )}
                      {t('myEvents.resolve')}
                    </button>
                  )}
                  {deleteConfirmId === event.eventId ? (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleDelete(event.eventId)}
                        disabled={deletingId === event.eventId}
                        className="inline-flex items-center gap-1 rounded-lg bg-danger px-2.5 py-1.5 text-xs font-medium text-white disabled:opacity-50"
                      >
                        {deletingId === event.eventId && <IconLoader2 size={12} className="animate-spin" />}
                        {te('delete')}
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(null)}
                        className="rounded-lg px-2 py-1.5 text-xs text-muted hover:bg-card"
                      >
                        {te('cancel')}
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirmId(event.eventId)}
                      className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs text-muted transition-colors hover:bg-danger/10 hover:text-danger"
                    >
                      <IconTrash size={12} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
