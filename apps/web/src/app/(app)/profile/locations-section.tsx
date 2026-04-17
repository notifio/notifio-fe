'use client';

import {
  IconLoader2,
  IconMapPin,
  IconPencil,
  IconPlus,
  IconTrash,
} from '@tabler/icons-react';
import { useTranslations } from 'next-intl';
import { useCallback, useState } from 'react';

import type { UserLocation } from '@notifio/api-client';

import { LocationModal } from '@/components/app/location-modal';
import { useLocations } from '@/hooks/use-locations';
import { useMembership } from '@/hooks/use-membership';

export function LocationsSection() {
  const t = useTranslations('profile');
  const { membership } = useMembership();
  const {
    locations,
    limit,
    isLoading: locsLoading,
    create: createLocation,
    update: updateLocation,
    remove: removeLocation,
  } = useLocations();

  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [editLocation, setEditLocation] = useState<UserLocation | undefined>();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const maxLocations = membership?.current?.maxLocations ?? limit;
  const canAddLocation = locations.length < maxLocations;

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

  return (
    <>
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
    </>
  );
}
