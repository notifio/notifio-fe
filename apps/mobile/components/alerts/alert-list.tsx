import { IconAdjustments, IconBell } from '@tabler/icons-react-native';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, FlatList, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';

import type { NotificationHistoryItem } from '@notifio/api-client';
import { notificationToCard, type NotificationHistoryItemInput } from '@notifio/shared/alert-card';

import { AlertCard } from './alert-card';
import { FilterSheet } from './filter-sheet';
import { useNotificationHistory } from '../../hooks/use-notification-history';
import { SPACING } from '../../lib/spacing';
import { theme } from '../../lib/theme';
import { useAppTheme } from '../../providers/theme-provider';
import { EmptyState } from '../ui/empty-state';
import { TogglePill } from '../ui/toggle-pill';

type TabFilter = 'active' | 'upcoming' | 'resolved' | 'all';

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
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);

  // Defaults: tab=active, category=all. Count any non-default.
  const activeFilterCount =
    (tab === 'active' ? 0 : 1) + (categoryFilter === 'all' ? 0 : 1);

  // Internal tab value now matches BE's status enum directly — no
  // remapping needed after `ended → resolved` rename.
  const { items, isLoading, error, hasMore, loadMore, refresh } = useNotificationHistory({
    status: tab,
  });

  const filtered = useMemo(() => {
    if (categoryFilter === 'all') return items;
    return items.filter((n) => matchesCategory(n.category, categoryFilter));
  }, [categoryFilter, items]);

  const renderItem = useCallback(
    ({ item }: { item: NotificationHistoryItem }) => {
      // Bypass adapter's broken `resolved` derivation — compute inline
      // from typed fields and override the adapter output. Delivery
      // status and title prefixes intentionally NOT consulted.
      const card = notificationToCard(item as unknown as NotificationHistoryItemInput);
      const resolved =
        item.notificationType === 'all_clear' || item.eventStatus === 'resolved';
      return (
        <AlertCard
          item={{ ...card, resolved }}
          onPress={onAlertPress ? () => onAlertPress(item) : undefined}
        />
      );
    },
    [onAlertPress],
  );

  return (
    <View style={styles.container}>
      {/* Top filter row: Filter button (status → bottom sheet) +
          inline category chips. Filter button shows active-count
          badge when status filter is non-default. */}
      <View style={styles.filterTopRow}>
        <Pressable
          onPress={() => setFilterSheetOpen(true)}
          style={[styles.filterButton, { borderColor: colors.border }]}
        >
          <IconAdjustments size={14} color={colors.text} />
          <Text style={[styles.filterButtonText, { color: colors.text }]}>
            {t('alerts.filter')}
          </Text>
          {activeFilterCount > 0 && (
            <View style={[styles.filterBadge, { backgroundColor: colors.primary }]}>
              <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
            </View>
          )}
        </Pressable>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipRowContent}
          style={styles.chipRow}
        >
          {CATEGORY_FILTERS.map((filter) => (
            <TogglePill
              key={filter.id}
              active={categoryFilter === filter.id}
              label={t(`alerts.filters.${filter.id}`)}
              onPress={() => setCategoryFilter(filter.id)}
            />
          ))}
        </ScrollView>
      </View>

      <FilterSheet
        open={filterSheetOpen}
        onClose={() => setFilterSheetOpen(false)}
        status={tab}
        onStatusChange={setTab}
      />

      <FlatList
        data={filtered}
        renderItem={renderItem}
        keyExtractor={(item) => String(item.id)}
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
          ) : error ? (
            <EmptyState icon={IconBell} message={t('notifications.error')} />
          ) : (
            <EmptyState icon={IconBell} message={t('notifications.empty')} />
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
    // parent's available height and chip Pressables stretch vertically.
    flex: 1,
    flexGrow: 0,
  },
  chipRowContent: {
    gap: 6,
    alignItems: 'center',
    // paddingLeft adds air after the parent row's gap so the first
    // chip doesn't visually touch the Filter button.
    paddingLeft: 4,
    paddingRight: SPACING.screenH,
  },
  filterTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.screenH,
    paddingVertical: SPACING.subControlPadV,
    marginBottom: SPACING.subControlBottom,
    gap: 12,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 999,
  },
  filterButtonText: {
    fontSize: theme.fontSize.xs,
    ...theme.font.medium,
  },
  filterBadge: {
    minWidth: 16,
    height: 16,
    borderRadius: 999,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    ...theme.font.semibold,
  },
  list: {
    paddingHorizontal: SPACING.screenH,
    paddingBottom: theme.spacing['4xl'],
  },
  emptyList: {
    flex: 1,
  },
  separator: {
    height: SPACING.cardGap,
  },
  footer: {
    paddingVertical: theme.spacing.lg,
  },
  loading: {
    marginTop: theme.spacing['3xl'],
  },
});
