import { IconChevronDown, IconChevronUp, IconCrown, IconLock } from '@tabler/icons-react-native';
import { Stack, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import type { SourcePreference, SourceSummary } from '@notifio/api-client';
import { tierColors } from '@notifio/ui';

import { ProGate } from '../../components/ui/pro-gate';
import { api } from '../../lib/api';
import { SPACING } from '../../lib/spacing';
import { theme, withOpacity } from '../../lib/theme';
import { useAppTheme } from '../../providers/theme-provider';

// Adapter → category mapping (mirrors web's apps/web/src/app/(app)/settings/sources/preferences/page.tsx).
// Sources don't carry categoryCode in the API response, so we derive it from
// the adapter code. Display names come from the existing categoryGroups
// i18n namespace (already on mobile).
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

export default function SourcePreferencesScreen() {
  const { t } = useTranslation();

  return (
    <>
      <Stack.Screen options={{ title: t('sourcePreferences.title') }} />
      <ProGate requiredTier="PRO" fallback={<UpsellCard />}>
        <SourcePreferencesContent />
      </ProGate>
    </>
  );
}

// ── PRO content ──────────────────────────────────────────────────────

function SourcePreferencesContent() {
  const { colors } = useAppTheme();
  const { t } = useTranslation();

  const [sources, setSources] = useState<SourceSummary[]>([]);
  const [preferences, setPreferences] = useState<SourcePreference[]>([]);
  const [loading, setLoading] = useState(true);
  const [savedFlash, setSavedFlash] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const flashRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load catalog + saved preferences in parallel (mirrors web).
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [srcData, prefData] = await Promise.all([
          api.getSources(),
          api.getSourcePreferences().catch(() => [] as SourcePreference[]),
        ]);
        if (cancelled) return;
        setSources(srcData);
        setPreferences(prefData);
      } catch {
        // silent — UI shows empty state
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (flashRef.current) clearTimeout(flashRef.current);
    };
  }, []);

  const groups = useMemo((): CategoryGroup[] => {
    const map = new Map<string, CategoryGroup>();
    for (const source of sources) {
      const catCode = getCategoryCodeForAdapter(source.codSourceAdapter);
      if (!map.has(catCode)) {
        const catName = t(`categoryGroups.${catCode}`, { defaultValue: catCode });
        map.set(catCode, { categoryCode: catCode, categoryName: catName, adapters: [] });
      }
      const pref = preferences.find((p) => p.adapterCode === source.codSourceAdapter);
      map.get(catCode)!.adapters.push({
        adapterCode: source.codSourceAdapter,
        adapterName: source.name,
        priority: pref?.priority ?? 999,
        rating: source.autoCredibility,
      });
    }
    for (const g of map.values()) g.adapters.sort((a, b) => a.priority - b.priority);
    return [...map.values()].filter((g) => g.adapters.length > 0);
  }, [sources, preferences, t]);

  const savePreferences = useCallback((categoryCode: string, adapters: AdapterRow[]) => {
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
        setSavedFlash(true);
        if (flashRef.current) clearTimeout(flashRef.current);
        flashRef.current = setTimeout(() => setSavedFlash(false), 2000);
      } catch {
        // silent — local state already updated; user can re-tap
      }
    }, 500);
  }, []);

  const swap = useCallback(
    (categoryCode: string, fromIndex: number, toIndex: number) => {
      const group = groups.find((g) => g.categoryCode === categoryCode);
      if (!group) return;
      if (toIndex < 0 || toIndex >= group.adapters.length) return;

      const newAdapters = [...group.adapters];
      const a = newAdapters[fromIndex];
      const b = newAdapters[toIndex];
      if (!a || !b) return;
      newAdapters[fromIndex] = b;
      newAdapters[toIndex] = a;

      // Update preferences state for this category
      setPreferences((prev) => {
        const filtered = prev.filter(
          (p) => getCategoryCodeForAdapter(p.adapterCode) !== categoryCode,
        );
        const updated: SourcePreference[] = newAdapters.map((a, i) => ({
          categoryCode,
          categoryName: group.categoryName,
          adapterCode: a.adapterCode,
          adapterName: a.adapterName,
          priority: i + 1,
        }));
        return [...filtered, ...updated];
      });

      savePreferences(categoryCode, newAdapters);
    },
    [groups, savePreferences],
  );

  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.description, { color: colors.textMuted }]}>
        {t('sourcePreferences.description')}
      </Text>

      {savedFlash && (
        <Text style={[styles.savedFlash, { color: colors.primary }]}>
          {t('sourcePreferences.saved')}
        </Text>
      )}

      <View style={styles.groupsList}>
        {groups.map((group) => (
          <View key={group.categoryCode} style={styles.group}>
            <Text style={[styles.categoryHeader, { color: colors.textMuted }]}>
              {group.categoryName}
            </Text>

            <View style={styles.adapterList}>
              {group.adapters.map((adapter, index) => {
                const isFirst = index === 0;
                const isLast = index === group.adapters.length - 1;
                const isSingleton = group.adapters.length === 1;

                return (
                  <View
                    key={adapter.adapterCode}
                    style={[styles.adapterRow, { backgroundColor: colors.surface, borderColor: colors.border }]}
                  >
                    <Text style={[styles.priority, { color: colors.textMuted }]}>{index + 1}.</Text>
                    <View style={styles.adapterText}>
                      <Text style={[styles.adapterName, { color: colors.text }]} numberOfLines={1}>
                        {adapter.adapterName}
                      </Text>
                    </View>
                    {adapter.rating !== null && (
                      <Text
                        style={[
                          styles.rating,
                          { color: adapter.rating >= 70 ? '#34C759' : colors.textMuted },
                        ]}
                      >
                        {adapter.rating}%
                      </Text>
                    )}

                    {isSingleton ? (
                      <Text style={[styles.onlySource, { color: colors.textMuted }]}>
                        {t('sourcePreferences.onlySource')}
                      </Text>
                    ) : (
                      <View style={styles.arrowControls}>
                        <Pressable
                          onPress={() => swap(group.categoryCode, index, index - 1)}
                          disabled={isFirst}
                          accessibilityRole="button"
                          accessibilityLabel={t('sourcePreferences.moveUp')}
                          hitSlop={4}
                          style={[styles.arrowButton, isFirst && styles.arrowDisabled]}
                        >
                          <IconChevronUp size={18} color={isFirst ? colors.textMuted : colors.text} />
                        </Pressable>
                        <Pressable
                          onPress={() => swap(group.categoryCode, index, index + 1)}
                          disabled={isLast}
                          accessibilityRole="button"
                          accessibilityLabel={t('sourcePreferences.moveDown')}
                          hitSlop={4}
                          style={[styles.arrowButton, isLast && styles.arrowDisabled]}
                        >
                          <IconChevronDown size={18} color={isLast ? colors.textMuted : colors.text} />
                        </Pressable>
                      </View>
                    )}
                  </View>
                );
              })}
            </View>

            {group.adapters.length > 1 && (
              <Text style={[styles.reorderHint, { color: colors.textMuted }]}>
                {t('sourcePreferences.reorderHint')}
              </Text>
            )}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

// ── PRO upsell fallback ──────────────────────────────────────────────

function UpsellCard() {
  const { colors } = useAppTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const accent = tierColors.pro;

  return (
    <View style={[styles.upsellRoot, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.upsellCard,
          {
            backgroundColor: colors.surface,
            borderColor: withOpacity(accent, 0.3),
          },
        ]}
      >
        <View style={[styles.upsellIcon, { backgroundColor: withOpacity(accent, 0.16) }]}>
          <IconLock size={28} color={accent} />
        </View>
        <View style={[styles.upsellBadge, { backgroundColor: withOpacity(accent, 0.16) }]}>
          <IconCrown size={12} color={accent} />
          <Text style={[styles.upsellBadgeText, { color: accent }]}>PRO</Text>
        </View>
        <Text style={[styles.upsellTitle, { color: colors.text }]}>
          {t('sourcePreferences.upsellTitle')}
        </Text>
        <Text style={[styles.upsellDescription, { color: colors.textMuted }]}>
          {t('sourcePreferences.upsellDescription')}
        </Text>
        <Pressable
          onPress={() => router.push('/settings/subscription')}
          style={[styles.upsellCta, { backgroundColor: colors.primary }]}
        >
          <Text style={[styles.upsellCtaText, { color: colors.textInverse }]}>
            {t('sourcePreferences.viewPlans')}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: SPACING.screenH,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing['4xl'],
  },
  description: {
    fontSize: theme.fontSize.sm,
    lineHeight: 20,
  },
  savedFlash: {
    marginTop: theme.spacing.sm,
    fontSize: theme.fontSize.xs,
    ...theme.font.medium,
  },
  groupsList: {
    marginTop: theme.spacing.xl,
    gap: theme.spacing.xl,
  },
  group: {},
  categoryHeader: {
    fontSize: theme.fontSize.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    ...theme.font.semibold,
    marginBottom: theme.spacing.sm,
  },
  adapterList: {
    gap: theme.spacing.sm,
  },
  adapterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    gap: theme.spacing.md,
  },
  priority: {
    width: 20,
    textAlign: 'center',
    fontSize: theme.fontSize.xs,
    ...theme.font.bold,
  },
  adapterText: {
    flex: 1,
    minWidth: 0,
  },
  adapterName: {
    fontSize: theme.fontSize.sm,
    ...theme.font.medium,
  },
  rating: {
    fontSize: theme.fontSize.xs,
    ...theme.font.medium,
  },
  onlySource: {
    fontSize: 10,
  },
  arrowControls: {
    flexDirection: 'row',
    gap: 4,
  },
  arrowButton: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radius.sm,
  },
  arrowDisabled: {
    opacity: 0.4,
  },
  reorderHint: {
    marginTop: theme.spacing.sm,
    fontSize: 11,
  },
  // Upsell
  upsellRoot: {
    flex: 1,
    paddingHorizontal: SPACING.screenH,
    paddingTop: theme.spacing['3xl'],
  },
  upsellCard: {
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    padding: theme.spacing.xl,
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  upsellIcon: {
    width: 56,
    height: 56,
    borderRadius: theme.radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.sm,
  },
  upsellBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.radius.sm,
  },
  upsellBadgeText: {
    fontSize: 10,
    ...theme.font.bold,
    letterSpacing: 0.5,
  },
  upsellTitle: {
    marginTop: theme.spacing.xs,
    fontSize: theme.fontSize.lg,
    ...theme.font.bold,
  },
  upsellDescription: {
    fontSize: theme.fontSize.sm,
    textAlign: 'center',
    lineHeight: 20,
  },
  upsellCta: {
    marginTop: theme.spacing.lg,
    width: '100%',
    height: 44,
    borderRadius: theme.radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  upsellCtaText: {
    fontSize: theme.fontSize.sm,
    ...theme.font.semibold,
  },
});
