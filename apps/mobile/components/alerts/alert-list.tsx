import { IconBell } from '@tabler/icons-react-native';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, FlatList, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';

import type { NotificationHistoryItem } from '@notifio/api-client';

import { AlertCard } from './alert-card';
import { useNotificationHistory } from '../../hooks/use-notification-history';
import { isResolved } from '../../lib/alert-card-utils';
import { theme } from '../../lib/theme';
import { useAppTheme } from '../../providers/theme-provider';
import { Icon } from '../ui/icon';

type TabFilter = 'active' | 'ended' | 'all';

const TABS: ReadonlyArray<{ id: TabFilter; labelKey: string }> = [
  { id: 'active', labelKey: 'alerts.active' },
  { id: 'ended', labelKey: 'alerts.ended' },
  { id: 'all', labelKey: 'alerts.all' },
];

// Category chip filters — mirrors web's CATEGORY_FILTERS in
// apps/web/src/app/(app)/notifications/history-section.tsx. Same
// prefix-matching against NotificationHistoryItem.category. 'events'
// chip dropped from both apps (overlaps with the new top Events tab).
// TODO Step 11.5: extract this + web's copy to shared.
type CategoryFilter = 'all' | 'weather' | 'traffic' | 'outages' | 'pollen';

const CATEGORY_FILTERS: ReadonlyArray<{ id: CategoryFilter; prefixes: string[] }> = [
  { id: 'all', prefixes: [] },
  { id: 'weather', prefixes: ['weather'] },
  { id: 'traffic', prefixes: ['traffic'] },
  { id: 'outages', prefixes: ['outage'] },
  { id: 'pollen', prefixes: ['pollen'] },
];

function matchesCategory(category: string, filter: CategoryFilter): boolean {
  if (filter === 'all') return true;
  const def = CATEGORY_FILTERS.find((f) => f.id === filter);
  if (!def) return true;
  return def.prefixes.some((p) => category.startsWith(p));
}

interface AlertListProps {
  onAlertPress?: (notification: NotificationHistoryItem) => void;
}

function ItemSeparator() {
  return <View style={styles.separator} />;
}

export function AlertList({ onAlertPress }: AlertListProps) {
  const { colors } = useAppTheme();
  const { t } = useTranslation();
  const [tab, setTab] = useState<TabFilter>('active');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');

  // Server fetches active-only when on the Active tab (cheaper round
  // trip); Ended + All fetch the full set so we can client-filter the
  // resolved subset via isResolved().
  const fetchActiveOnly = tab === 'active';
  const { items, isLoading, hasMore, loadMore, refresh } = useNotificationHistory({
    activeOnly: fetchActiveOnly,
  });

  const filtered = useMemo(() => {
    let base = items;
    if (tab === 'ended') base = base.filter((n) => isResolved(n));
    if (categoryFilter !== 'all') base = base.filter((n) => matchesCategory(n.category, categoryFilter));
    return base;
  }, [tab, categoryFilter, items]);

  const renderItem = useCallback(
    ({ item }: { item: NotificationHistoryItem }) => (
      <AlertCard notification={item} onPress={onAlertPress ? () => onAlertPress(item) : undefined} />
    ),
    [onAlertPress],
  );

  return (
    <View style={styles.container}>
      {/* Merged filter row — status sub-tabs + visual divider +
          category chips, all in ONE horizontal scroll row. Saves a
          full ~44pt of vertical space vs the earlier two-row layout
          (header → top tabs → status row → category row → list).
          Active state on either group uses brand-orange fill (chip
          style) so they read as related controls. */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipRowContent}
        style={styles.chipRow}
      >
        {TABS.map((tabDef) => {
          const active = tab === tabDef.id;
          return (
            <Pressable
              key={tabDef.id}
              onPress={() => setTab(tabDef.id)}
              style={[
                styles.chip,
                {
                  backgroundColor: active ? colors.primary : 'transparent',
                  borderColor: active ? colors.primary : colors.border,
                },
              ]}
            >
              <Text
                numberOfLines={1}
                style={[
                  styles.chipText,
                  { color: active ? '#FFFFFF' : colors.textMuted },
                ]}
              >
                {t(tabDef.labelKey)}
              </Text>
            </Pressable>
          );
        })}

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        {CATEGORY_FILTERS.map((filter) => {
          const active = categoryFilter === filter.id;
          return (
            <Pressable
              key={filter.id}
              onPress={() => setCategoryFilter(filter.id)}
              style={[
                styles.chip,
                {
                  backgroundColor: active ? colors.primary : 'transparent',
                  borderColor: active ? colors.primary : colors.border,
                },
              ]}
            >
              <Text
                numberOfLines={1}
                style={[
                  styles.chipText,
                  { color: active ? '#FFFFFF' : colors.textMuted },
                ]}
              >
                {t(`alerts.filters.${filter.id}`)}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <FlatList
        data={filtered}
        renderItem={renderItem}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        ItemSeparatorComponent={ItemSeparator}
        contentContainerStyle={[styles.list, filtered.length === 0 && styles.emptyList]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isLoading && items.length > 0} onRefresh={refresh} tintColor={colors.primary} />
        }
        onEndReached={hasMore ? loadMore : undefined}
        onEndReachedThreshold={0.3}
        ListFooterComponent={
          isLoading && items.length > 0 ? (
            <ActivityIndicator style={styles.footer} color={colors.primary} />
          ) : null
        }
        ListEmptyComponent={
          isLoading ? (
            <ActivityIndicator size="large" color={colors.primary} style={styles.loading} />
          ) : (
            <View style={styles.emptyContainer}>
              <Icon icon={IconBell} size={48} color={colors.textMuted} />
              <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                {t('alerts.noNotifications')}
              </Text>
            </View>
          )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  chipRow: {
    // flexGrow: 0 — without this the horizontal ScrollView fills the
    // parent's available height (FlatList parent has flex:1) and
    // chip Pressables stretch vertically to the viewport.
    flexGrow: 0,
    marginBottom: theme.spacing.sm,
  },
  chipRowContent: {
    paddingHorizontal: theme.spacing.xl,
    gap: theme.spacing.sm,
    // alignItems: center inside contentContainerStyle keeps each
    // child centered on the cross-axis instead of stretching them.
    alignItems: 'center',
  },
  chip: {
    height: 32,
    alignSelf: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.md,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
  },
  divider: {
    width: StyleSheet.hairlineWidth,
    height: 20,
    marginHorizontal: theme.spacing.xs,
    alignSelf: 'center',
  },
  chipText: {
    fontSize: theme.fontSize.xs,
    ...theme.font.medium,
  },
  list: {
    paddingHorizontal: theme.spacing.xl,
    paddingBottom: theme.spacing['4xl'],
  },
  emptyList: {
    flex: 1,
  },
  separator: {
    height: theme.spacing.md,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.md,
  },
  emptyText: {
    fontSize: theme.fontSize.md,
  },
  footer: {
    paddingVertical: theme.spacing.lg,
  },
  loading: {
    marginTop: theme.spacing['3xl'],
  },
});
