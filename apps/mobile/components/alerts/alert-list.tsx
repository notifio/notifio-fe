import { IconBell } from '@tabler/icons-react-native';
import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';

import type { NotificationHistoryItem } from '@notifio/api-client';

import { AlertCard } from './alert-card';
import { useNotificationHistory } from '../../hooks/use-notification-history';
import { theme } from '../../lib/theme';
import { useAppTheme } from '../../providers/theme-provider';
import { Icon } from '../ui/icon';

interface AlertListProps {
  onAlertPress?: (notification: NotificationHistoryItem) => void;
}

function ItemSeparator() {
  return <View style={styles.separator} />;
}

export function AlertList({ onAlertPress }: AlertListProps) {
  const { colors } = useAppTheme();
  const [activeOnly, setActiveOnly] = useState(false);
  const { items, isLoading, hasMore, loadMore, refresh } = useNotificationHistory({
    activeOnly,
  });

  const renderItem = useCallback(
    ({ item }: { item: NotificationHistoryItem }) => (
      <AlertCard notification={item} onPress={onAlertPress ? () => onAlertPress(item) : undefined} />
    ),
    [onAlertPress],
  );

  return (
    <View style={styles.container}>
      <View style={styles.filterBar}>
        <Pressable
          onPress={() => setActiveOnly(false)}
          style={[styles.filterButton, !activeOnly && { backgroundColor: colors.text }]}
        >
          <Text style={[styles.filterText, { color: colors.textMuted }, !activeOnly && { color: colors.background }]}>All</Text>
        </Pressable>
        <Pressable
          onPress={() => setActiveOnly(true)}
          style={[styles.filterButton, activeOnly && { backgroundColor: colors.text }]}
        >
          <Text style={[styles.filterText, { color: colors.textMuted }, activeOnly && { color: colors.background }]}>Sent</Text>
        </Pressable>
      </View>

      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={(item) => String(item.id)}
        ItemSeparatorComponent={ItemSeparator}
        contentContainerStyle={[styles.list, items.length === 0 && styles.emptyList]}
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
              <Text style={[styles.emptyText, { color: colors.textMuted }]}>No notifications yet</Text>
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
  filterBar: {
    flexDirection: 'row',
    gap: theme.spacing.xs,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.sm,
  },
  filterButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radius.md,
  },
  filterText: {
    fontSize: theme.fontSize.sm,
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
