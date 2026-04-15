'use client';

import {
  IconCheck,
  IconChevronDown,
  IconLoader2,
  IconX,
} from '@tabler/icons-react';
import maplibregl from 'maplibre-gl';
import { useTranslations } from 'next-intl';
import { useTheme } from 'next-themes';
import {
  type FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { useToast } from '@/components/ui/toast';
import { useEventCategories } from '@/hooks/use-event-categories';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';

interface EventReportModalProps {
  lat: number;
  lng: number;
  onClose: () => void;
}

const TILE_LIGHT = 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json';
const TILE_DARK = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json';
const RADIUS_STEPS = [100, 250, 500, 1000, 2000, 5000, 10000, 20000];

function formatRadius(m: number): string {
  return m >= 1000 ? `${m / 1000} km` : `${m} m`;
}

export function EventReportModal({ lat, lng, onClose }: EventReportModalProps) {
  const t = useTranslations('events');
  const te = useTranslations('errors');
  const tc = useTranslations('common');
  const { resolvedTheme } = useTheme();
  const { categories, loading: catsLoading, error: catsError, retry: retryCategories } = useEventCategories();
  const { success, error: showError } = useToast();

  const [subcategoryCode, setSubcategoryCode] = useState('');
  const [radiusIdx, setRadiusIdx] = useState(3);
  const [submitting, setSubmitting] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [focusedIdx, setFocusedIdx] = useState(-1);
  const [selectedLat, setSelectedLat] = useState(lat);
  const [selectedLng, setSelectedLng] = useState(lng);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const pickerContainerRef = useRef<HTMLDivElement>(null);
  const pickerMapRef = useRef<maplibregl.Map | null>(null);

  // Group subcategories by parent categoryCode
  const grouped = useMemo(() => {
    const map = new Map<string, typeof categories>();
    for (const cat of categories) {
      const group = map.get(cat.categoryCode) ?? [];
      group.push(cat);
      map.set(cat.categoryCode, group);
    }
    return map;
  }, [categories]);

  // Flat list for keyboard navigation
  const flatItems = useMemo(
    () => categories.map((c) => ({ code: c.code, name: c.name, categoryCode: c.categoryCode })),
    [categories],
  );

  const selectedItem = flatItems.find((c) => c.code === subcategoryCode);
  const isValid = subcategoryCode.length > 0;

  // Close dropdown on outside click
  useEffect(() => {
    if (!dropdownOpen) return;
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [dropdownOpen]);

  // Keyboard nav
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!dropdownOpen) {
        if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
          e.preventDefault();
          setDropdownOpen(true);
          setFocusedIdx(0);
        }
        return;
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        setDropdownOpen(false);
        return;
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setFocusedIdx((prev) => Math.min(prev + 1, flatItems.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setFocusedIdx((prev) => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter' && focusedIdx >= 0 && focusedIdx < flatItems.length) {
        e.preventDefault();
        setSubcategoryCode(flatItems[focusedIdx]!.code);
        setDropdownOpen(false);
      }
    },
    [dropdownOpen, flatItems, focusedIdx],
  );

  // Scroll focused item into view
  useEffect(() => {
    if (!dropdownOpen || focusedIdx < 0) return;
    const el = listRef.current?.querySelector(`[data-idx="${focusedIdx}"]`);
    el?.scrollIntoView({ block: 'nearest' });
  }, [focusedIdx, dropdownOpen]);

  // Initialize location picker map
  useEffect(() => {
    if (!pickerContainerRef.current) return;

    const tileStyle = resolvedTheme === 'dark' ? TILE_DARK : TILE_LIGHT;
    const map = new maplibregl.Map({
      container: pickerContainerRef.current,
      style: tileStyle,
      center: [selectedLng, selectedLat],
      zoom: 14,
    });

    const marker = new maplibregl.Marker({ color: '#FF7A2F', draggable: true })
      .setLngLat([selectedLng, selectedLat])
      .addTo(map);

    marker.on('dragend', () => {
      const lngLat = marker.getLngLat();
      setSelectedLat(lngLat.lat);
      setSelectedLng(lngLat.lng);
    });

    map.on('click', (e) => {
      marker.setLngLat(e.lngLat);
      setSelectedLat(e.lngLat.lat);
      setSelectedLng(e.lngLat.lng);
    });

    pickerMapRef.current = map;

    return () => {
      map.remove();
      pickerMapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectCategory = useCallback((code: string) => {
    setSubcategoryCode(code);
    setDropdownOpen(false);
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!isValid || submitting) return;

    setSubmitting(true);
    try {
      // Only send fields the BE accepts — title is auto-generated server-side
      await api.createEvent({
        subcategoryCode,
        lat: selectedLat,
        lng: selectedLng,
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
                <div ref={dropdownRef} className="relative">
                  {/* Trigger */}
                  <button
                    type="button"
                    onClick={() => setDropdownOpen((v) => !v)}
                    onKeyDown={handleKeyDown}
                    className={cn(
                      'flex h-11 w-full items-center justify-between rounded-xl border px-4 text-left text-sm transition-colors',
                      dropdownOpen
                        ? 'border-accent ring-1 ring-accent'
                        : 'border-border hover:border-border/80',
                      selectedItem ? 'text-text-primary' : 'text-muted',
                    )}
                  >
                    <span className="truncate">
                      {selectedItem ? selectedItem.name : t('selectCategory')}
                    </span>
                    <IconChevronDown
                      size={16}
                      className={cn(
                        'shrink-0 text-muted transition-transform',
                        dropdownOpen && 'rotate-180',
                      )}
                    />
                  </button>

                  {/* Dropdown list */}
                  {dropdownOpen && (
                    <div
                      ref={listRef}
                      className="absolute left-0 top-full z-10 mt-1.5 max-h-64 w-full overflow-y-auto rounded-xl border border-border bg-background shadow-xl"
                      role="listbox"
                    >
                      {[...grouped.entries()].map(([groupCode, items]) => (
                        <div key={groupCode}>
                          {/* Group header */}
                          <div className="sticky top-0 border-b border-border bg-card/80 px-3.5 py-2 text-[10px] font-bold uppercase tracking-widest text-muted backdrop-blur-sm">
                            {groupCode}
                          </div>
                          {/* Items */}
                          {items.map((item) => {
                            const globalIdx = flatItems.findIndex((f) => f.code === item.code);
                            const isSelected = subcategoryCode === item.code;
                            const isFocused = focusedIdx === globalIdx;
                            return (
                              <button
                                key={item.code}
                                type="button"
                                role="option"
                                aria-selected={isSelected}
                                data-idx={globalIdx}
                                onClick={() => selectCategory(item.code)}
                                onMouseEnter={() => setFocusedIdx(globalIdx)}
                                className={cn(
                                  'flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-sm transition-colors',
                                  isFocused && 'bg-card',
                                  isSelected
                                    ? 'font-medium text-accent'
                                    : 'text-text-secondary',
                                )}
                              >
                                <span className="flex-1 truncate">{item.name}</span>
                                {isSelected && (
                                  <IconCheck size={15} className="shrink-0 text-accent" />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Location picker */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted">
                {t('pickLocation')}
              </label>
              <div className="h-[200px] overflow-hidden rounded-xl border border-border">
                <div ref={pickerContainerRef} className="h-full w-full" />
              </div>
              <p className="mt-1 text-[11px] text-muted">
                {selectedLat.toFixed(5)}, {selectedLng.toFixed(5)}
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
