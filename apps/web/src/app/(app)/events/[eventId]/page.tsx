'use client';

import {
  IconArrowLeft,
  IconCheck,
  IconLoader2,
  IconMapPin,
  IconTrash,
  IconX,
} from '@tabler/icons-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useState } from 'react';

import type { EventDetail, UserVote } from '@notifio/api-client';
import { ApiError } from '@notifio/api-client';

import { RelativeTime } from '@/components/ui/relative-time';
import { useToast } from '@/components/ui/toast';
import { api } from '@/lib/api';
import { getNotificationIcon } from '@/lib/notification-icons';

const MIN_VOTES_FOR_CREDIBILITY = 5;

export default function EventDetailPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const router = useRouter();
  const t = useTranslations('events');
  const tc = useTranslations('common');
  const toast = useToast();

  const [event, setEvent] = useState<EventDetail | null>(null);
  const [userVote, setUserVote] = useState<UserVote | null>(null);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [eventData, voteData] = await Promise.all([
          api.getEventDetail(eventId),
          api.getUserVote(eventId).catch(() => ({ voted: false }) as UserVote),
        ]);
        if (cancelled) return;
        setEvent(eventData);
        setUserVote(voteData);

        // Check ownership: compare event sourceId with user's events
        try {
          const myEvents = await api.getUserEvents();
          setIsOwner(myEvents.some((e) => e.eventId === eventId));
        } catch {
          // Not logged in or failed — not owner
        }
      } catch {
        // event not found
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [eventId]);

  const handleVote = useCallback(async (isValid: boolean) => {
    if (voting || userVote?.voted) return;
    setVoting(true);
    try {
      await api.voteOnEvent(eventId, isValid);
      setUserVote({ voted: true, isValid });
      const updated = await api.getEventDetail(eventId);
      setEvent(updated);
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setUserVote({ voted: true, isValid });
      }
    } finally {
      setVoting(false);
    }
  }, [eventId, voting, userVote]);

  const handleResolve = useCallback(async () => {
    try {
      await api.updateEvent(eventId, { resolved: true });
      router.push('/profile');
    } catch {
      toast.error(t('resolveFailed'));
    }
  }, [eventId, router, toast, t]);

  const handleDelete = useCallback(async () => {
    setDeleting(true);
    try {
      await api.deleteEvent(eventId);
      toast.success(t('deleted'));
      router.push('/profile');
    } catch {
      setDeleting(false);
    }
  }, [eventId, router, toast, t]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <IconLoader2 size={32} className="animate-spin text-accent" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <IconMapPin size={48} className="mx-auto text-muted" />
        <p className="mt-4 text-sm text-muted">{t('detail.notFound')}</p>
        <Link href="/dashboard" className="mt-4 inline-block text-sm text-accent hover:text-accent/80">
          {t('detail.backToDashboard')}
        </Link>
      </div>
    );
  }

  const isResolved = event.eventTo !== null && new Date(event.eventTo) <= new Date();
  const hasEnoughVotes = event.votes.total >= MIN_VOTES_FOR_CREDIBILITY;
  const credibilityPercent = hasEnoughVotes && event.votes.total > 0
    ? Math.round((event.votes.score / event.votes.total) * 100)
    : 0;
  const icon = getNotificationIcon(event.category.code);

  return (
    <div className="mx-auto max-w-2xl">
      {/* Back button */}
      <div className="px-4 py-3">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm text-text-secondary transition-colors duration-150 hover:bg-card hover:text-text-primary"
        >
          <IconArrowLeft size={16} />
          {tc('back')}
        </button>
      </div>

      {/* Map header placeholder */}
      <div
        className="flex h-40 items-center justify-center bg-card"
        style={{ backgroundColor: '#0B1B32' }}
      >
        <div className="flex flex-col items-center gap-2">
          <IconMapPin size={32} className="text-accent" />
          <span className="text-xs text-muted">
            {event.location.lat.toFixed(4)}, {event.location.lng.toFixed(4)}
          </span>
        </div>
      </div>

      {/* Card body */}
      <div className="px-4 py-6 md:px-8">
        {/* Category + status */}
        <div className="flex items-start gap-3">
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
            style={{ backgroundColor: `${icon.color}20` }}
          >
            <icon.icon size={24} color={icon.color} strokeWidth={2} />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-lg font-bold text-text-primary">
              {event.type.name}
            </h1>
            <p className="text-sm text-muted">
              {event.category.name}
              {event.subcategory && ` · ${event.subcategory.name}`}
            </p>
          </div>
          <span
            className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${
              isResolved
                ? 'bg-green-500/10 text-green-600'
                : 'bg-red-500/10 text-red-500'
            }`}
          >
            {isResolved ? t('detail.resolved') : t('detail.active')}
          </span>
        </div>

        {/* Details table */}
        <div className="mt-6 space-y-3">
          <DetailRow label={t('detail.source')} value={t('detail.communityReport')} />
          <DetailRow
            label={t('detail.reported')}
            value={<RelativeTime iso={event.createdAt} />}
          />
          <DetailRow label={t('detail.activeSince')} value={formatDate(event.eventFrom)} />
          <DetailRow
            label={t('detail.ends')}
            value={event.eventTo ? formatDate(event.eventTo) : t('detail.ongoing')}
          />
        </div>

        {/* Credibility section */}
        <div className="mt-6 rounded-xl bg-card p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-text-primary">{t('credibility')}</span>
            {hasEnoughVotes && (
              <span className="text-sm font-bold text-green-500">{credibilityPercent}%</span>
            )}
          </div>

          {hasEnoughVotes ? (
            <>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full" style={{ backgroundColor: '#0B1B32' }}>
                <div
                  className="h-full rounded-full bg-green-500 transition-all"
                  style={{ width: `${credibilityPercent}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-muted">
                {t('validVotes', { count: event.votes.valid })} · {t('invalidVotes', { count: event.votes.invalid })}
              </p>
            </>
          ) : (
            <p className="mt-2 text-xs text-muted">
              {t('notEnoughVotes', { current: event.votes.total })}
            </p>
          )}
        </div>

        {/* Voting section */}
        {!isResolved && (
          <div className="mt-4">
            <p className="mb-3 text-sm font-medium text-text-primary">{t('stillHappening')}</p>
            <div className="flex gap-3">
              <button
                onClick={() => handleVote(true)}
                disabled={voting || userVote?.voted === true}
                className={`flex flex-1 items-center justify-center gap-2 rounded-xl border py-2.5 text-sm font-medium transition-colors disabled:opacity-50 ${
                  userVote?.isValid === true
                    ? 'border-green-500 bg-green-500/10 text-green-600'
                    : 'border-border bg-card text-green-600 hover:bg-green-500/5'
                }`}
              >
                <IconCheck size={16} />
                {t('yes')}
              </button>
              <button
                onClick={() => handleVote(false)}
                disabled={voting || userVote?.voted === true}
                className={`flex flex-1 items-center justify-center gap-2 rounded-xl border py-2.5 text-sm font-medium transition-colors disabled:opacity-50 ${
                  userVote?.isValid === false
                    ? 'border-red-500 bg-red-500/10 text-red-500'
                    : 'border-border bg-card text-red-500 hover:bg-red-500/5'
                }`}
              >
                <IconX size={16} />
                {t('no')}
              </button>
            </div>
            {userVote?.voted && (
              <p className="mt-2 text-center text-xs text-muted">{t('alreadyVoted')}</p>
            )}
          </div>
        )}

        {/* Owner actions — only shown for the event creator */}
        {isOwner && (
          <>
            {deleteConfirmOpen ? (
              <div className="mt-4 rounded-xl border border-danger/30 bg-danger/5 p-4">
                <p className="text-sm text-danger">{t('deleteConfirm')}</p>
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="inline-flex items-center gap-2 rounded-lg bg-danger px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-danger/90 disabled:opacity-50"
                  >
                    {deleting && <IconLoader2 size={14} className="animate-spin" />}
                    {t('delete')}
                  </button>
                  <button
                    onClick={() => setDeleteConfirmOpen(false)}
                    className="rounded-lg px-4 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-card"
                  >
                    {t('cancel')}
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-6 flex gap-3">
                {!isResolved && (
                  <button
                    onClick={handleResolve}
                    className="inline-flex items-center gap-2 rounded-xl bg-accent/10 px-4 py-2.5 text-sm font-medium text-accent transition-colors hover:bg-accent/20"
                  >
                    <IconCheck size={16} />
                    {t('resolve')}
                  </button>
                )}
                <button
                  onClick={() => setDeleteConfirmOpen(true)}
                  className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-danger transition-colors hover:bg-danger/10"
                >
                  <IconTrash size={16} />
                  {t('delete')}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between">
      <span className="text-xs text-muted">{label}</span>
      <span className="text-sm text-text-primary">{value}</span>
    </div>
  );
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
