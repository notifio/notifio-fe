'use client';

import { IconCheck, IconGripVertical, IconLoader2 } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import type { SourcePreference, SourceSummary } from '@notifio/api-client';

import { ProGate } from '@/components/app/pro-gate';
import { api } from '@/lib/api';

interface AdapterRow {
  adapterCode: string;
  adapterName: string;
  priority: number;
  rating: number | null;
}

interface CategoryGroup {
  categoryCode: string;
  categoryName: string;
  adapters: AdapterRow[];
}

// Known adapter-to-category mapping.
// Sources don't carry categoryCode — we derive it from adapter naming conventions.
// Display names come from i18n (categoryGroups namespace).
const ADAPTER_CATEGORY_CODE: Record<string, string> = {
  shmu: 'weather',
  openweathermap: 'weather',
  yr: 'weather',
  aqicn: 'weather',
  google_maps: 'traffic',
  tomtom: 'traffic',
  zse: 'outages',
  sse: 'outages',
  vse: 'outages',
  bvs: 'outages',
  spb: 'outages',
};

function getCategoryCodeForAdapter(adapterCode: string): string {
  return ADAPTER_CATEGORY_CODE[adapterCode] ?? 'other';
}

export default function SourcePreferencesPage() {
  const t = useTranslations('sourcePreferences');
  const tg = useTranslations('categoryGroups');
  const [sources, setSources] = useState<SourceSummary[]>([]);
  const [preferences, setPreferences] = useState<SourcePreference[]>([]);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [srcData, prefData] = await Promise.all([
          api.getSources(),
          api.getSourcePreferences().catch(() => [] as SourcePreference[]),
        ]);
        setSources(srcData);
        setPreferences(prefData);
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const groups = useMemo((): CategoryGroup[] => {
    const categoryMap = new Map<string, CategoryGroup>();

    for (const source of sources) {
      const catCode = getCategoryCodeForAdapter(source.codSourceAdapter);
      if (!categoryMap.has(catCode)) {
        const catName = tg.has(catCode) ? tg(catCode) : catCode;
        categoryMap.set(catCode, { categoryCode: catCode, categoryName: catName, adapters: [] });
      }
      const pref = preferences.find(
        (p) => p.adapterCode === source.codSourceAdapter,
      );
      categoryMap.get(catCode)!.adapters.push({
        adapterCode: source.codSourceAdapter,
        adapterName: source.name,
        priority: pref?.priority ?? 999,
        rating: source.autoCredibility,
      });
    }

    for (const group of categoryMap.values()) {
      group.adapters.sort((a, b) => a.priority - b.priority);
    }

    return Array.from(categoryMap.values()).filter((g) => g.adapters.length > 0);
  }, [sources, preferences, tg]);

  const savePreferences = useCallback(
    async (categoryCode: string, adapters: AdapterRow[]) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(async () => {
        try {
          await Promise.all(
            adapters.map((a, i) =>
              api.setSourcePreference({
                categoryCode,
                adapterCode: a.adapterCode,
                priority: i + 1,
              }),
            ),
          );
          setSaved(true);
          if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
          saveTimeoutRef.current = setTimeout(() => setSaved(false), 2000);
        } catch {
          // silently fail
        }
      }, 500);
    },
    [],
  );

  // Native drag state
  const [dragState, setDragState] = useState<{
    categoryCode: string;
    fromIndex: number;
  } | null>(null);

  const handleDragStart = (categoryCode: string, index: number) => {
    setDragState({ categoryCode, fromIndex: index });
  };

  const handleDrop = (categoryCode: string, toIndex: number) => {
    if (!dragState || dragState.categoryCode !== categoryCode) return;
    const fromIndex = dragState.fromIndex;
    if (fromIndex === toIndex) {
      setDragState(null);
      return;
    }

    const group = groups.find((g) => g.categoryCode === categoryCode);
    if (!group) return;

    const newAdapters = [...group.adapters];
    const removed = newAdapters.splice(fromIndex, 1);
    if (!removed[0]) return;
    newAdapters.splice(toIndex, 0, removed[0]);

    // Update local preferences state
    setPreferences((prev) => {
      const filtered = prev.filter((p) => getCategoryCodeForAdapter(p.adapterCode) !== categoryCode);
      const updated = newAdapters.map((a, i) => ({
        categoryCode,
        categoryName: group.categoryName,
        adapterCode: a.adapterCode,
        adapterName: a.adapterName,
        priority: i + 1,
      }));
      return [...filtered, ...updated];
    });

    savePreferences(categoryCode, newAdapters);
    setDragState(null);
  };

  return (
    <ProGate requiredTier="PRO">
      <div className="mx-auto max-w-2xl px-4 py-8 md:px-8 md:py-10">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-text-primary">{t('title')}</h1>
          <span className="rounded-full bg-accent/10 px-2 py-0.5 text-xs font-medium text-accent">
            PRO
          </span>
        </div>
        <p className="mt-1 text-sm text-muted">{t('description')}</p>

        {saved && (
          <div className="mt-4 flex items-center gap-1.5 text-xs text-green-500">
            <IconCheck size={14} />
            {t('saved')}
          </div>
        )}

        <div className="mt-8 space-y-6">
          {loading ? (
            <div className="flex justify-center py-16">
              <IconLoader2 size={28} className="animate-spin text-accent" />
            </div>
          ) : (
            groups.map((group) => (
              <div key={group.categoryCode}>
                <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted">
                  {group.categoryName}
                </h2>
                <div className="space-y-1">
                  {group.adapters.map((adapter, index) => (
                    <div
                      key={adapter.adapterCode}
                      draggable={group.adapters.length > 1}
                      onDragStart={() => handleDragStart(group.categoryCode, index)}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={() => handleDrop(group.categoryCode, index)}
                      className="flex items-center gap-3 rounded-xl bg-card px-4 py-3 transition-colors"
                    >
                      <span className="w-5 text-center text-xs font-bold text-muted">
                        {index + 1}.
                      </span>
                      <div className="min-w-0 flex-1">
                        <span className="text-sm font-medium text-text-primary">
                          {adapter.adapterName}
                        </span>
                      </div>
                      {adapter.rating !== null && (
                        <span className={`text-xs font-medium ${adapter.rating >= 70 ? 'text-green-500' : 'text-muted'}`}>
                          {adapter.rating}%
                        </span>
                      )}
                      {group.adapters.length > 1 ? (
                        <IconGripVertical size={16} className="shrink-0 cursor-grab text-muted" />
                      ) : (
                        <span className="text-[10px] text-muted">{t('onlySource')}</span>
                      )}
                    </div>
                  ))}
                </div>
                {group.adapters.length > 1 && (
                  <p className="mt-1.5 text-[11px] text-muted">{t('dragToReorder')}</p>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </ProGate>
  );
}
