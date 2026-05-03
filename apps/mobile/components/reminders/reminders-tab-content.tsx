import { IconPlus } from '@tabler/icons-react-native';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ReminderCalendarView } from './reminder-calendar-view';
import { ReminderFormModal } from './reminder-form-modal';
import { ReminderList } from './reminder-list';
import { useReminders } from '../../hooks/use-reminders';
import { theme } from '../../lib/theme';
import { useAppTheme } from '../../providers/theme-provider';

type ViewMode = 'list' | 'calendar';

/**
 * Wraps the Reminders tab content with a List/Calendar view toggle
 * and a parent-level FAB. The FAB owns the create flow so it stays
 * visible (and functional) on both views — without this, the calendar
 * view had no way to create a new reminder. ReminderList still owns
 * its own edit modal (opened by row tap → handleItemPress); the
 * calendar view is read-only browsing for v1.
 */
export function RemindersTabContent() {
  const { colors } = useAppTheme();
  const { t } = useTranslation();
  const [view, setView] = useState<ViewMode>('list');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const { createReminder } = useReminders();

  const handleCloseCreate = useCallback(() => {
    setShowCreateForm(false);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.toggleRow}>
        <View style={[styles.toggle, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {(['list', 'calendar'] as const).map((v) => {
            const isActive = view === v;
            return (
              <Pressable
                key={v}
                onPress={() => setView(v)}
                style={[
                  styles.toggleButton,
                  isActive && { backgroundColor: colors.primary },
                ]}
              >
                <Text
                  style={[
                    styles.toggleText,
                    { color: isActive ? '#FFFFFF' : colors.textMuted },
                  ]}
                >
                  {t(v === 'list' ? 'reminders.list' : 'reminders.calendar.label')}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {view === 'list' ? <ReminderList /> : <ReminderCalendarView />}

      {/* FAB — parent-level, visible on both List and Calendar views.
          Tapping it opens the create-only ReminderFormModal below. */}
      <Pressable
        onPress={() => setShowCreateForm(true)}
        style={[styles.fab, { backgroundColor: colors.primary }]}
      >
        <IconPlus size={24} color={colors.textInverse} />
      </Pressable>

      <ReminderFormModal
        visible={showCreateForm}
        onClose={handleCloseCreate}
        onSave={createReminder}
        editReminder={undefined}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  toggleRow: {
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.sm,
  },
  toggle: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 3,
  },
  toggleButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 6,
    borderRadius: 999,
  },
  toggleText: {
    fontSize: theme.fontSize.xs,
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
