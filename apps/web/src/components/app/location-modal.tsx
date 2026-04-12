'use client';

import { IconCurrentLocation, IconLoader2, IconX } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';
import { type FormEvent, useState } from 'react';

import type {
  UserLocation,
  CreateLocationBody,
  UpdateLocationBody,
  LocationLabel,
} from '@notifio/api-client';

import { cn } from '@/lib/utils';

interface LocationModalProps {
  location?: UserLocation;
  onSave: (body: CreateLocationBody | UpdateLocationBody) => Promise<void>;
  onClose: () => void;
}

const LABELS: { value: LocationLabel; label: string }[] = [
  { value: 'home', label: 'Home' },
  { value: 'work', label: 'Work' },
  { value: 'school', label: 'School' },
  { value: 'gym', label: 'Gym' },
  { value: 'other', label: 'Other' },
];

export function LocationModal({ location, onSave, onClose }: LocationModalProps) {
  const t = useTranslations('profile.locations');
  const isEdit = !!location;

  const [customLabel, setCustomLabel] = useState(location?.customLabel ?? '');
  const [label, setLabel] = useState<LocationLabel>(
    (location?.label?.code as LocationLabel) ?? 'home',
  );
  const [lat, setLat] = useState(location?.lat ?? 0);
  const [lng, setLng] = useState(location?.lng ?? 0);
  const [geoLoading, setGeoLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasCoords = lat !== 0 || lng !== 0;

  const useCurrentLocation = () => {
    if (!('geolocation' in navigator)) return;
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude);
        setLng(pos.coords.longitude);
        setGeoLoading(false);
      },
      () => {
        setGeoLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (saving || !hasCoords) return;

    setSaving(true);
    setError(null);
    try {
      if (isEdit) {
        const body: UpdateLocationBody = {
          label,
          ...(customLabel.trim() ? { customLabel: customLabel.trim() } : { customLabel: null }),
        };
        await onSave(body);
      } else {
        const body: CreateLocationBody = {
          lat,
          lng,
          label,
          ...(customLabel.trim() ? { customLabel: customLabel.trim() } : {}),
        };
        await onSave(body);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to save';
      setError(msg);
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-background p-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-text-primary">
            {isEdit ? t('edit') : t('add')}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted transition-colors hover:bg-card hover:text-text-primary"
          >
            <IconX size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Label select */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-text-secondary">
              {t('label')}
            </label>
            <div className="flex flex-wrap gap-1.5">
              {LABELS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setLabel(opt.value)}
                  className={cn(
                    'rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
                    label === opt.value
                      ? 'bg-accent text-white'
                      : 'bg-card text-text-secondary hover:text-text-primary',
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Custom name */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-text-secondary">
              {t('name')}
            </label>
            <input
              type="text"
              placeholder={t('namePlaceholder')}
              value={customLabel}
              onChange={(e) => setCustomLabel(e.target.value)}
              className="h-11 w-full rounded-xl border border-border bg-background px-4 text-sm text-text-primary placeholder:text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>

          {/* Location */}
          {!isEdit && (
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <span className="text-sm font-medium text-text-secondary">
                  {t('useCurrentLocation')}
                </span>
              </div>
              <button
                type="button"
                onClick={useCurrentLocation}
                disabled={geoLoading}
                className="flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm text-text-secondary transition-colors hover:bg-card disabled:opacity-50"
              >
                {geoLoading ? (
                  <IconLoader2 size={16} className="animate-spin" />
                ) : (
                  <IconCurrentLocation size={16} className="text-accent" />
                )}
                {t('useCurrentLocation')}
              </button>
              {hasCoords && (
                <p className="mt-1.5 text-xs text-muted">
                  {lat.toFixed(5)}, {lng.toFixed(5)}
                </p>
              )}
            </div>
          )}

          {error && (
            <div className="rounded-lg bg-danger/10 px-4 py-2.5 text-sm text-danger">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              type="submit"
              disabled={saving || (!isEdit && !hasCoords)}
              className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-accent text-sm font-semibold text-white transition-colors hover:bg-accent/90 disabled:opacity-50"
            >
              {saving && <IconLoader2 size={16} className="animate-spin" />}
              {t('save')}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="h-11 rounded-xl px-5 text-sm font-medium text-text-secondary transition-colors hover:bg-card"
            >
              {t('cancel')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
