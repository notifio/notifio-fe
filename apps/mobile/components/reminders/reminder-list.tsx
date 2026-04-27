import { IconClock, IconPlus } from '@tabler/icons-react-native';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';

import type { PersonalReminder } from '@notifio/api-client';

import { ReminderFormModal } from './reminder-form-modal';
import { useReminders } from '../../hooks/use-reminders';
import { theme } from '../../lib/theme';
import { useAppTheme } from '../../providers/theme-provider';

function formatTriggerDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function ReminderList() {
  const { colors } = useAppTheme();
  const { t } = useTranslation();
  const {
    reminders,
    isLoading,
    error,
    refetch,
    createReminder,
    updateReminder,
    deleteReminder,
    toggleEnabled,
  } = useReminders();

  const [showForm, setShowForm] = useState(false);
  const [editingReminder, setEditingReminder] = useState<PersonalReminder | undefined>(
    undefined,
  );

  const sorted = [...reminders].sort(
    (a, b) => new Date(a.triggerAt).getTime() - new Date(b.triggerAt).getTime(),
  );

  const handleItemPress = useCallback((item: PersonalReminder) => {
    setEditingReminder(item);
    setShowForm(true);
  }, []);

  const handleDelete = useCallback(
    (item: PersonalReminder) => {
      Alert.alert(t('reminders.delete'), t('reminders.deleteConfirm'), [
        { text: t('common.ok'), style: 'cancel' },
        {
          text: t('reminders.delete'),
          style: 'destructive',
          onPress: () => deleteReminder(item.reminderId),
        },
      ]);
    },
    [deleteReminder, t],
  );

  const handleCloseForm = useCallback(() => {
    setShowForm(false);
    setEditingReminder(undefined);
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: PersonalReminder }) => (
      <Pressable
        onPress={() => handleItemPress(item)}
        onLongPress={() => handleDelete(item)}
        style={[styles.item, { backgroundColor: colors.surface, borderColor: colors.border }]}
      >
        <View style={styles.itemContent}>
          <Text style={[styles.itemTitle, { color: colors.text }]} numberOfLines={1}>
            {item.title}
          </Text>
          <View style={styles.itemMeta}>
            <Text style={[styles.itemDate, { color: colors.textMuted }]}>
              {formatTriggerDate(item.triggerAt)}
            </Text>
            {item.recurrence !== 'ONCE' && (
              <View style={[styles.badge, { backgroundColor: `${colors.primary}18` }]}>
                <Text style={[styles.badgeText, { color: colors.primary }]}>
                  {t(`reminders.recurrenceOptions.${item.recurrence}`)}
                </Text>
              </View>
            )}
          </View>
        </View>
        <Switch
          value={item.enabled}
          onValueChange={(val) => toggleEnabled(item.reminderId, val)}
          trackColor={{ false: colors.border, true: `${colors.primary}66` }}
          thumbColor={item.enabled ? colors.primary : colors.textMuted}
        />
      </Pressable>
    ),
    [colors, handleDelete, handleItemPress, t, toggleEnabled],
  );

  if (isLoading && reminders.length === 0) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error && reminders.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={[styles.errorText, { color: colors.danger }]}>{error}</Text>
        <Pressable onPress={refetch}>
          <Text style={[styles.retryText, { color: colors.primary }]}>{t('common.tryAgain')}</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={sorted}
        renderItem={renderItem}
        keyExtractor={(item) => item.reminderId}
        contentContainerStyle={[styles.list, sorted.length === 0 && styles.emptyList]}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        refreshControl={
          <RefreshControl
            refreshing={isLoading && reminders.length > 0}
            onRefresh={refetch}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <IconClock size={48} color={colors.textMuted} />
            <Text style={[styles.emptyTitle, { color: colors.textMuted }]}>
              {t('reminders.empty')}
            </Text>
            <Text style={[styles.emptyMessage, { color: colors.textMuted }]}>
              {t('reminders.emptyMessage')}
            </Text>
          </View>
        }
      />

      {/* FAB */}
      <Pressable
        onPress={() => {
          setEditingReminder(undefined);
          setShowForm(true);
        }}
        style={[styles.fab, { backgroundColor: colors.primary }]}
      >
        <IconPlus size={24} color={colors.textInverse} />
      </Pressable>

      <ReminderFormModal
        visible={showForm}
        onClose={handleCloseForm}
        onSave={createReminder}
        onUpdate={updateReminder}
        editReminder={editingReminder}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.md,
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
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  itemContent: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  itemTitle: {
    fontSize: theme.fontSize.md,
    ...theme.font.medium,
  },
  itemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  itemDate: {
    fontSize: theme.fontSize.sm,
  },
  badge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.radius.sm,
  },
  badgeText: {
    fontSize: theme.fontSize.xs,
    ...theme.font.medium,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.md,
  },
  emptyTitle: {
    fontSize: theme.fontSize.md,
    ...theme.font.medium,
  },
  emptyMessage: {
    fontSize: theme.fontSize.sm,
    textAlign: 'center',
  },
  errorText: {
    fontSize: theme.fontSize.md,
  },
  retryText: {
    fontSize: theme.fontSize.md,
    ...theme.font.medium,
  },
  fab: {
    position: 'absolute',
    bottom: theme.spacing.xl,
    right: theme.spacing.xl,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});
