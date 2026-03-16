import { Bell } from 'lucide-react-native';
import { useCallback, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';

import { AlertCard } from './alert-card';
import type { AlertSummary } from '../../lib/mock-data';
import { theme } from '../../lib/theme';
import { Icon } from '../ui/icon';

interface AlertListProps {
  alerts: AlertSummary[];
  onAlertPress?: (alert: AlertSummary) => void;
  emptyMessage?: string;
}

function ItemSeparator() {
  return <View style={styles.separator} />;
}

export function AlertList({ alerts, onAlertPress, emptyMessage = 'No alerts right now' }: AlertListProps) {
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: AlertSummary }) => (
      <AlertCard alert={item} onPress={onAlertPress ? () => onAlertPress(item) : undefined} />
    ),
    [onAlertPress],
  );

  return (
    <FlatList
      data={alerts}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      ItemSeparatorComponent={ItemSeparator}
      contentContainerStyle={[styles.list, alerts.length === 0 && styles.emptyList]}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />
      }
      ListEmptyComponent={
        <View style={styles.emptyContainer}>
          <Icon icon={Bell} size={48} color={theme.colors.textMuted} />
          <Text style={styles.emptyText}>{emptyMessage}</Text>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
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
    color: theme.colors.textMuted,
  },
});
