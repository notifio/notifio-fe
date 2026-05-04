import { IconClock } from '@tabler/icons-react-native';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Calendar, type DateData } from 'react-native-calendars';

import type { PersonalReminder } from '@notifio/api-client';

import { useReminders } from '../../hooks/use-reminders';
import { formatDateKey, formatDayHeader, formatTime } from '../../lib/format';
import { SPACING } from '../../lib/spacing';
import { theme } from '../../lib/theme';
import { useAppTheme } from '../../providers/theme-provider';
import { EmptyState } from '../ui/empty-state';

interface ReminderCalendarViewProps {
  selectedDate: string;
  onSelectedDateChange: (date: string) => void;
  onReminderPress?: (reminder: PersonalReminder) => void;
}

export function ReminderCalendarView({
  selectedDate,
  onSelectedDateChange,
  onReminderPress,
}: ReminderCalendarViewProps) {
  const { t, i18n } = useTranslation();
  const { colors, isDark } = useAppTheme();
  const { reminders } = useReminders();

  const markedDates = useMemo(() => {
    const map: Record<string, { marked?: boolean; dotColor?: string; selected?: boolean; selectedColor?: string }> = {};
    for (const r of reminders) {
      const key = formatDateKey(new Date(r.triggerAt));
      map[key] = { ...(map[key] ?? {}), marked: true, dotColor: colors.primary };
    }
    map[selectedDate] = { ...(map[selectedDate] ?? {}), selected: true, selectedColor: colors.primary };
    return map;
  }, [reminders, selectedDate, colors.primary]);

  const remindersOnSelectedDate = useMemo(
    () => reminders.filter((r) => formatDateKey(new Date(r.triggerAt)) === selectedDate),
    [reminders, selectedDate],
  );

  const calendarKey = isDark ? 'dark' : 'light';

  const headerLabel = formatDayHeader(selectedDate, i18n.language, t('common.today'));

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Calendar
        key={calendarKey}
        onDayPress={(day: DateData) => onSelectedDateChange(day.dateString)}
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
          textDayFontSize: 13,
          textMonthFontSize: 15,
          textDayHeaderFontSize: 11,
          // Tighten the week-row spacing — these stylesheet overrides
          // are runtime-supported by react-native-calendars but not
          // present in its Theme types, hence the cast.
          ...({
            'stylesheet.calendar.main': {
              week: {
                marginVertical: 2,
                flexDirection: 'row',
                justifyContent: 'space-around',
              },
            },
          } as object),
        }}
        style={[styles.calendar, { borderColor: colors.border }]}
      />

      <Text style={[styles.sectionHeader, { color: colors.textMuted }]} numberOfLines={1}>
        {headerLabel}
      </Text>

      <View style={styles.dayList}>
        {remindersOnSelectedDate.length === 0 ? (
          <EmptyState
            variant="compact"
            icon={IconClock}
            message={t('reminders.calendar.emptyInline')}
          />
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
                  {formatTime(r.triggerAt, i18n.language)}
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
    paddingHorizontal: SPACING.screenH,
    paddingBottom: theme.spacing['4xl'],
  },
  calendar: {
    borderRadius: theme.radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    marginBottom: SPACING.calendarToDayHeader,
  },
  sectionHeader: {
    fontSize: theme.fontSize.xs,
    letterSpacing: 0.5,
    ...theme.font.semibold,
    marginBottom: SPACING.dayHeaderToContent,
  },
  dayList: {
    gap: SPACING.cardGap,
  },
  dayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    padding: SPACING.cardPad,
    borderRadius: theme.radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
  },
  pressed: {
    opacity: 0.7,
  },
  dayRowText: {
    flex: 1,
    minWidth: 0,
    gap: SPACING.cardTitleToMeta,
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
});
