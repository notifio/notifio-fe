import { IconClock } from '@tabler/icons-react-native';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Calendar, type DateData } from 'react-native-calendars';

import type { PersonalReminder } from '@notifio/api-client';

import { useReminders } from '../../hooks/use-reminders';
import { theme } from '../../lib/theme';
import { useAppTheme } from '../../providers/theme-provider';

interface ReminderCalendarViewProps {
  onReminderPress?: (reminder: PersonalReminder) => void;
}

/**
 * Date → 'YYYY-MM-DD' (local time, react-native-calendars' expected
 * key format). Avoids the date-fns dep — same output as
 * date-fns.format(date, 'yyyy-MM-dd') in local TZ.
 */
function ymd(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function ReminderCalendarView({ onReminderPress }: ReminderCalendarViewProps) {
  const { t } = useTranslation();
  const { colors, isDark } = useAppTheme();
  const { reminders } = useReminders();
  const [selectedDate, setSelectedDate] = useState<string>(ymd(new Date()));

  const markedDates = useMemo(() => {
    const map: Record<string, { marked?: boolean; dotColor?: string; selected?: boolean; selectedColor?: string }> = {};
    for (const r of reminders) {
      const key = ymd(new Date(r.triggerAt));
      map[key] = { ...(map[key] ?? {}), marked: true, dotColor: colors.primary };
    }
    map[selectedDate] = { ...(map[selectedDate] ?? {}), selected: true, selectedColor: colors.primary };
    return map;
  }, [reminders, selectedDate, colors.primary]);

  const remindersOnSelectedDate = useMemo(
    () => reminders.filter((r) => ymd(new Date(r.triggerAt)) === selectedDate),
    [reminders, selectedDate],
  );

  // Theme keyed by isDark so toggling app theme re-mounts the
  // Calendar with fresh palette (the lib doesn't hot-swap colors).
  const calendarKey = isDark ? 'dark' : 'light';

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Calendar
        key={calendarKey}
        onDayPress={(day: DateData) => setSelectedDate(day.dateString)}
        markedDates={markedDates}
        theme={{
          backgroundColor: colors.background,
          calendarBackground: colors.background,
          textSectionTitleColor: colors.textMuted,
          dayTextColor: colors.text,
          monthTextColor: colors.text,
          arrowColor: colors.primary,
          todayTextColor: colors.primary,
          selectedDayBackgroundColor: colors.primary,
          selectedDayTextColor: '#FFFFFF',
          textDisabledColor: colors.textMuted,
          dotColor: colors.primary,
          selectedDotColor: '#FFFFFF',
        }}
        style={[styles.calendar, { borderColor: colors.border }]}
      />

      <View style={styles.dayList}>
        {remindersOnSelectedDate.length === 0 ? (
          <View style={styles.emptyContainer}>
            <IconClock size={32} color={colors.textMuted} />
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>
              {t('reminders.calendar.empty')}
            </Text>
          </View>
        ) : (
          remindersOnSelectedDate.map((r) => (
            <Pressable
              key={r.reminderId}
              onPress={() => onReminderPress?.(r)}
              style={({ pressed }) => [
                styles.dayRow,
                { backgroundColor: colors.surface, borderColor: colors.border },
                pressed && styles.pressed,
              ]}
            >
              <View style={styles.dayRowText}>
                <Text style={[styles.dayRowTitle, { color: colors.text }]} numberOfLines={1}>
                  {r.title}
                </Text>
                <Text style={[styles.dayRowMeta, { color: colors.textMuted }]}>
                  {new Date(r.triggerAt).toLocaleTimeString(undefined, {
                    hour: '2-digit', minute: '2-digit',
                  })}
                </Text>
              </View>
              {!r.enabled && (
                <View style={[styles.pausedBadge, { backgroundColor: colors.severity.warning.bg }]}>
                  <Text style={[styles.pausedText, { color: colors.severity.warning.text }]}>
                    {t('reminders.disabled')}
                  </Text>
                </View>
              )}
            </Pressable>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: theme.spacing.xl,
    paddingBottom: theme.spacing['4xl'],
  },
  calendar: {
    borderRadius: theme.radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    marginBottom: theme.spacing.lg,
  },
  dayList: {
    gap: theme.spacing.sm,
  },
  dayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    padding: theme.spacing.md,
    borderRadius: theme.radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
  },
  pressed: {
    opacity: 0.7,
  },
  dayRowText: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  dayRowTitle: {
    fontSize: theme.fontSize.sm,
    ...theme.font.medium,
  },
  dayRowMeta: {
    fontSize: theme.fontSize.xs,
  },
  pausedBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.radius.full,
  },
  pausedText: {
    fontSize: 10,
    ...theme.font.medium,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing['3xl'],
  },
  emptyText: {
    fontSize: theme.fontSize.sm,
    textAlign: 'center',
  },
});
