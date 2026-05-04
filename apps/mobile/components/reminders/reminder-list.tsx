import { IconClock } from '@tabler/icons-react-native';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
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
import { confirmDestructive } from '../../lib/confirm';
import { formatDateTime } from '../../lib/format';
import { SPACING } from '../../lib/spacing';
import { theme, withOpacity } from '../../lib/theme';
import { useAppTheme } from '../../providers/theme-provider';
import { EmptyState } from '../ui/empty-state';

export function ReminderList() {
  const { colors } = useAppTheme();
  const { t, i18n } = useTranslation();
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
      confirmDestructive({
        t,
        titleKey: 'reminders.delete',
        descKey: 'reminders.deleteConfirm',
        confirmKey: 'reminders.delete',
        onConfirm: () => deleteReminder(item.reminderId),
      });
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
              {formatDateTime(item.triggerAt, i18n.language)}
            </Text>
            {item.recurrence !== 'ONCE' && (
              <View style={[styles.badge, { backgroundColor: withOpacity(colors.primary, 0.094) }]}>
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
          trackColor={{ false: colors.border, true: withOpacity(colors.primary, 0.4) }}
          thumbColor={item.enabled ? colors.primary : colors.textMuted}
        />
      </Pressable>
    ),
    [colors, handleDelete, handleItemPress, t, i18n.language, toggleEnabled],
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
          <EmptyState
            icon={IconClock}
            title={t('reminders.empty')}
            message={t('reminders.emptyMessage')}
          />
        }
      />

      {/* Edit-only modal — create flow is owned by RemindersTabContent
          parent so its FAB is visible on both List and Calendar views.
          This instance only opens via row tap (handleItemPress). */}
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
    paddingHorizontal: SPACING.screenH,
    paddingBottom: theme.spacing['4xl'],
  },
  emptyList: {
    flex: 1,
  },
  separator: {
    height: SPACING.cardGap,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    padding: SPACING.cardPad,
    gap: theme.spacing.md,
  },
  itemContent: {
    flex: 1,
    gap: SPACING.cardTitleToMeta,
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
  errorText: {
    fontSize: theme.fontSize.md,
  },
  retryText: {
    fontSize: theme.fontSize.md,
    ...theme.font.medium,
  },
});
