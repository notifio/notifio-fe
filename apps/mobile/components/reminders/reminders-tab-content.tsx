import { IconPlus } from '@tabler/icons-react-native';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ReminderCalendarView } from './reminder-calendar-view';
import { ReminderFormModal } from './reminder-form-modal';
import { ReminderList } from './reminder-list';
import { useReminders } from '../../hooks/use-reminders';
import { SPACING } from '../../lib/spacing';
import { theme } from '../../lib/theme';
import { useAppTheme } from '../../providers/theme-provider';
import { FAB } from '../ui/fab';

type ViewMode = 'list' | 'calendar';

function ymd(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * Wraps the Reminders tab content with a List/Calendar view toggle
 * and a parent-level FAB. The FAB owns the create flow so it stays
 * visible (and functional) on both views. selectedDate is lifted here
 * so that tapping the FAB in calendar view can pre-fill the form with
 * the day the user picked. ReminderList still owns its own edit modal
 * (opened by row tap → handleItemPress).
 */
export function RemindersTabContent() {
  const { colors } = useAppTheme();
  const { t } = useTranslation();
  const [view, setView] = useState<ViewMode>('list');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>(() => ymd(new Date()));
  const { createReminder } = useReminders();

  const handleCloseCreate = useCallback(() => {
    setShowCreateForm(false);
  }, []);

  // Calendar view: prefill form with the selected day. List view: no
  // prefill (form opens on today). Convert YYYY-MM-DD to a local Date.
  const createDefaultDate =
    view === 'calendar' ? new Date(`${selectedDate}T00:00:00`) : undefined;

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

      {view === 'list' ? (
        <ReminderList />
      ) : (
        <ReminderCalendarView
          selectedDate={selectedDate}
          onSelectedDateChange={setSelectedDate}
        />
      )}

      {/* FAB — parent-level, visible on both List and Calendar views.
          Tapping it opens the create-only ReminderFormModal below. */}
      <FAB icon={IconPlus} onPress={() => setShowCreateForm(true)} />

      {/* Conditionally mounted so `defaultDate` is read fresh on each
          open (FAB tap from List view = today; Calendar view = the
          currently-selected day). */}
      {showCreateForm && (
        <ReminderFormModal
          onClose={handleCloseCreate}
          onSave={createReminder}
          editReminder={undefined}
          defaultDate={createDefaultDate}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  toggleRow: {
    paddingHorizontal: SPACING.screenH,
    paddingVertical: SPACING.subControlPadV,
    marginBottom: SPACING.subControlBottom,
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
});
