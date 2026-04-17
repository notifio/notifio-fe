'use client';

import {
  IconLoader2,
  IconX,
} from '@tabler/icons-react';
import { useTranslations } from 'next-intl';
import {
  type FormEvent,
  useMemo,
  useState,
} from 'react';

import { SearchableSelect } from '@/components/ui/searchable-select';
import { useToast } from '@/components/ui/toast';
import { useEventCategories } from '@/hooks/use-event-categories';
import { api } from '@/lib/api';

import { LocationPicker } from './location-picker';

interface EventReportModalProps {
  lat: number;
  lng: number;
  onClose: () => void;
}

const RADIUS_STEPS = [100, 250, 500, 1000, 2000, 5000, 10000, 20000];

function formatRadius(m: number): string {
  return m >= 1000 ? `${m / 1000} km` : `${m} m`;
}

interface CategoryOption {
  code: string;
  name: string;
  categoryCode: string;
}

export function EventReportModal({ lat, lng, onClose }: EventReportModalProps) {
  const t = useTranslations('events');
  const te = useTranslations('errors');
  const tc = useTranslations('common');
  const { categories, loading: catsLoading, error: catsError, retry: retryCategories } = useEventCategories();
  const { success, error: showError } = useToast();

  const [selectedCategory, setSelectedCategory] = useState<CategoryOption | null>(null);
  const [radiusIdx, setRadiusIdx] = useState(3);
  const [submitting, setSubmitting] = useState(false);
  const [pickerCoords, setPickerCoords] = useState({ lat, lng });

  const flatOptions: CategoryOption[] = useMemo(
    () => categories.map((c) => ({ code: c.code, name: c.name, categoryCode: c.categoryCode })),
    [categories],
  );

  const groups = useMemo(() => {
    const map = new Map<string, CategoryOption[]>();
    for (const opt of flatOptions) {
      const group = map.get(opt.categoryCode) ?? [];
      group.push(opt);
      map.set(opt.categoryCode, group);
    }
    return [...map.entries()].map(([key, items]) => ({
      key,
      label: key,
      items,
    }));
  }, [flatOptions]);

  const isValid = selectedCategory !== null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!isValid || submitting) return;

    setSubmitting(true);
    try {
      await api.createEvent({
        subcategoryCode: selectedCategory.code,
        lat: pickerCoords.lat,
        lng: pickerCoords.lng,
        radiusM: RADIUS_STEPS[radiusIdx],
      } as Parameters<typeof api.createEvent>[0]);
      success(t('success'));
      onClose();
    } catch {
      showError(te('generic'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center sm:p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-t-2xl border border-border bg-background shadow-2xl sm:rounded-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="text-base font-bold text-text-primary">
            {t('reportButton')}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted transition-colors hover:bg-card hover:text-text-primary"
          >
            <IconX size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-5 py-5">
          <div className="space-y-5">
            {/* Category picker */}
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted">
                {t('selectCategory')}
              </label>
              {catsLoading ? (
                <div className="flex h-11 items-center justify-center rounded-xl bg-card">
                  <IconLoader2 size={16} className="animate-spin text-muted" />
                </div>
              ) : catsError ? (
                <div className="flex items-center gap-2 rounded-xl bg-danger/10 px-4 py-2.5">
                  <span className="flex-1 text-xs text-danger">{te('generic')}</span>
                  <button
                    type="button"
                    onClick={retryCategories}
                    className="shrink-0 rounded-lg bg-danger/10 px-3 py-1 text-xs font-medium text-danger transition-colors hover:bg-danger/20"
                  >
                    {tc('retry')}
                  </button>
                </div>
              ) : (
                <SearchableSelect<CategoryOption>
                  value={selectedCategory}
                  onChange={setSelectedCategory}
                  options={flatOptions}
                  getLabel={(o) => o.name}
                  getKey={(o) => o.code}
                  groups={groups}
                  placeholder={t('selectCategory')}
                />
              )}
            </div>

            {/* Location picker */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted">
                {t('pickLocation')}
              </label>
              <LocationPicker
                value={pickerCoords}
                onChange={setPickerCoords}
                initialCenter={{ lat, lng }}
              />
              <p className="mt-1 text-[11px] text-muted">
                {pickerCoords.lat.toFixed(5)}, {pickerCoords.lng.toFixed(5)}
              </p>
            </div>

            {/* Radius */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted">
                  {t('radius')}
                </label>
                <span className="rounded-full bg-accent/10 px-2 py-0.5 text-xs font-semibold text-accent">
                  {formatRadius(RADIUS_STEPS[radiusIdx]!)}
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={RADIUS_STEPS.length - 1}
                value={radiusIdx}
                onChange={(e) => setRadiusIdx(Number(e.target.value))}
                className="w-full accent-accent"
              />
              <div className="mt-1 flex justify-between text-[10px] text-muted">
                <span>100 m</span>
                <span>20 km</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 flex items-center gap-3">
            <button
              type="submit"
              disabled={!isValid || submitting}
              className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-accent text-sm font-semibold text-white transition-colors hover:bg-accent/90 disabled:opacity-50"
            >
              {submitting && <IconLoader2 size={16} className="animate-spin" />}
              {t('submit')}
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
