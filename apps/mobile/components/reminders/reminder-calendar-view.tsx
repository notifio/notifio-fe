import { IconClock } from '@tabler/icons-react-native';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import type { PersonalReminder } from '@notifio/api-client';

import { useReminders } from '../../hooks/use-reminders';
import { formatDateKey, formatDayHeader, formatTime } from '../../lib/format';
import { SPACING } from '../../lib/spacing';
import { theme } from '../../lib/theme';
import { useAppTheme } from '../../providers/theme-provider';
import { EmptyState } from '../ui/empty-state';
import { MonthGrid } from '../ui/month-grid';

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
  const { colors } = useAppTheme();
  const { reminders } = useReminders();

  // Derive viewed (year, month) from `selectedDate` so external state
  // changes (e.g. tab content lifting the date) move the grid; user
  // navigation between months is held locally so paging doesn't reset
  // the selection.
  const initialDate = useMemo(() => {
    const parsed = new Date(`${selectedDate}T00:00:00`);
    return Number.isFinite(parsed.getTime()) ? parsed : new Date();
  }, [selectedDate]);
  const [viewYear, setViewYear] = useState(initialDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(initialDate.getMonth());

  const dotsByDay = useMemo(() => {
    const set = new Set<string>();
    for (const r of reminders) {
      set.add(formatDateKey(new Date(r.triggerAt)));
    }
    return set;
  }, [reminders]);

  const today = useMemo(() => new Date(), []);

  const remindersOnSelectedDate = useMemo(
    () => reminders.filter((r) => formatDateKey(new Date(r.triggerAt)) === selectedDate),
    [reminders, selectedDate],
  );

  const headerLabel = formatDayHeader(selectedDate, i18n.language, t('common.today'));

  const selectedDay =
    initialDate.getFullYear() === viewYear && initialDate.getMonth() === viewMonth
      ? initialDate.getDate()
      : null;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.calendar, { borderColor: colors.border }]}>
        <MonthGrid
          year={viewYear}
          month={viewMonth}
          selectedDay={selectedDay}
          today={today}
          hasDot={(day) => {
            const key = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            return dotsByDay.has(key);
          }}
          locale={i18n.language}
          onSelectDay={(day) => {
            const next = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            onSelectedDateChange(next);
          }}
          onMonthChange={(y, m) => {
            setViewYear(y);
            setViewMonth(m);
          }}
        />
      </View>

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
    paddingBottom: theme.spacing['4xl'],
  },
  calendar: {
    borderRadius: theme.radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: theme.spacing.md,
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
