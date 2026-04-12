'use client';

import {
  IconAlertTriangle,
  IconCheck,
  IconLoader2,
  IconMapPin,
  IconPencil,
  IconPlus,
  IconTrash,
} from '@tabler/icons-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useCallback, useState } from 'react';

import type { UserLocation } from '@notifio/api-client';

import { signOut } from '@/app/(app)/actions';
import { LocationModal } from '@/components/app/location-modal';
import { useLocations } from '@/hooks/use-locations';
import { useMembership } from '@/hooks/use-membership';
import { useSupabaseUser } from '@/hooks/use-supabase-user';
import { useUserEvents } from '@/hooks/use-user-events';
import { api } from '@/lib/api';

export default function ProfilePage() {
  const t = useTranslations('profile');
  const { name, email, avatar, user } = useSupabaseUser();
  const { membership, tier } = useMembership();
  const {
    locations,
    limit,
    loading: locsLoading,
    create: createLocation,
    update: updateLocation,
    remove: removeLocation,
  } = useLocations();
  const {
    events,
    loading: eventsLoading,
    updateEvent,
  } = useUserEvents();

  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [editLocation, setEditLocation] = useState<UserLocation | undefined>();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [resolvingId, setResolvingId] = useState<string | null>(null);

  // Delete account state
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteInput, setDeleteInput] = useState('');
  const [deleting, setDeleting] = useState(false);

  const initial = name?.charAt(0).toUpperCase() ?? '?';
  const maxLocations = membership?.current?.maxLocations ?? limit;
  const canAddLocation = locations.length < maxLocations;

  const createdAt = user?.created_at
    ? new Date(user.created_at).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
      })
    : null;

  const openAddLocation = useCallback(() => {
    setEditLocation(undefined);
    setLocationModalOpen(true);
  }, []);

  const openEditLocation = useCallback((loc: UserLocation) => {
    setEditLocation(loc);
    setLocationModalOpen(true);
  }, []);

  const handleSaveLocation = useCallback(
    async (body: Record<string, unknown>) => {
      if (editLocation) {
        await updateLocation(editLocation.locationId, body);
      } else {
        await createLocation(body as Parameters<typeof createLocation>[0]);
      }
      setLocationModalOpen(false);
      setEditLocation(undefined);
    },
    [editLocation, createLocation, updateLocation],
  );

  const handleDeleteLocation = useCallback(
    async (locationId: string) => {
      if (!confirm(t('locations.deleteConfirm'))) return;
      setDeletingId(locationId);
      try {
        await removeLocation(locationId);
      } finally {
        setDeletingId(null);
      }
    },
    [removeLocation, t],
  );

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
    <div className="mx-auto max-w-2xl px-4 py-8 md:px-8 md:py-10">
      {/* Header */}
      <div className="flex items-center gap-4">
        {avatar ? (
          <img
            src={avatar}
            alt=""
            className="h-16 w-16 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent text-2xl font-bold text-white">
            {initial}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-text-primary">{name}</h1>
            {tier && (
              <Link
                href="/pricing"
                className="rounded-full bg-accent/10 px-2 py-0.5 text-xs font-medium text-accent transition-colors hover:bg-accent/20"
              >
                {tier}
              </Link>
            )}
          </div>
          {email && (
            <p className="mt-0.5 text-sm text-muted">{email}</p>
          )}
          {createdAt && (
            <p className="mt-0.5 text-xs text-muted">
              {t('memberSince', { date: createdAt })}
            </p>
          )}
        </div>
      </div>

      <div className="mt-8 space-y-8">
        {/* Saved Locations */}
        <section>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted">
                {t('locations.title')}
              </h2>
              <p className="mt-0.5 text-xs text-muted">
                {t('locations.description')}
              </p>
            </div>
            <button
              onClick={openAddLocation}
              disabled={!canAddLocation}
              className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-accent/90 disabled:opacity-50"
            >
              <IconPlus size={14} />
              {t('locations.add')}
            </button>
          </div>

          {!canAddLocation && (
            <p className="mt-2 text-xs text-amber-600 dark:text-amber-400">
              {t('locations.maxReached', { max: String(maxLocations) })}
            </p>
          )}

          <div className="mt-4">
            {locsLoading ? (
              <div className="space-y-2">
                {[1, 2].map((i) => (
                  <div key={i} className="h-16 animate-pulse rounded-xl bg-card" />
                ))}
              </div>
            ) : locations.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border bg-card/50 p-8 text-center">
                <IconMapPin size={32} className="mx-auto text-muted" />
                <p className="mt-2 text-sm text-muted">{t('locations.empty')}</p>
                <button
                  onClick={openAddLocation}
                  className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent/90"
                >
                  <IconPlus size={14} />
                  {t('locations.add')}
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {locations.map((loc) => (
                  <div key={loc.locationId} className="flex items-center gap-3 rounded-xl bg-card px-4 py-3">
                    <IconMapPin size={18} className="shrink-0 text-accent" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-text-primary">
                          {loc.customLabel || loc.label.name}
                        </span>
                        <span className="rounded bg-card px-1.5 py-0.5 text-[10px] font-medium text-muted">
                          {loc.label.name}
                        </span>
                      </div>
                      <p className="text-xs text-muted">
                        {loc.lat.toFixed(4)}, {loc.lng.toFixed(4)}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <button
                        onClick={() => openEditLocation(loc)}
                        className="rounded-lg p-1.5 text-muted transition-colors hover:bg-background hover:text-text-primary"
                      >
                        <IconPencil size={15} />
                      </button>
                      <button
                        onClick={() => handleDeleteLocation(loc.locationId)}
                        disabled={deletingId === loc.locationId}
                        className="rounded-lg p-1.5 text-muted transition-colors hover:bg-danger/10 hover:text-danger disabled:opacity-50"
                      >
                        {deletingId === loc.locationId ? (
                          <IconLoader2 size={15} className="animate-spin" />
                        ) : (
                          <IconTrash size={15} />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* My Reports */}
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

        {/* Account */}
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
      </div>

      {/* Location modal */}
      {locationModalOpen && (
        <LocationModal
          location={editLocation}
          onSave={handleSaveLocation}
          onClose={() => {
            setLocationModalOpen(false);
            setEditLocation(undefined);
          }}
        />
      )}
    </div>
  );
}
