import { IconClock } from '@tabler/icons-react-native';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Calendar, type DateData } from 'react-native-calendars';

import type { PersonalReminder } from '@notifio/api-client';

import { useReminders } from '../../hooks/use-reminders';
import { theme } from '../../lib/theme';
import { useAppTheme } from '../../providers/theme-provider';

interface ReminderCalendarViewProps {
  selectedDate: string;
  onSelectedDateChange: (date: string) => void;
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

/**
 * "PONDELOK 3. MÁJA" style header for the inline reminder list.
 * Uses native toLocaleDateString — locale comes from the active i18n
 * language so it follows the app's setting without a date-fns dep.
 */
function formatDayHeader(iso: string, locale: string): string {
  const d = new Date(`${iso}T00:00:00`);
  const weekday = d.toLocaleDateString(locale, { weekday: 'long' });
  const day = d.toLocaleDateString(locale, { day: 'numeric', month: 'long' });
  return `${weekday} ${day}`.toUpperCase();
}

export function ReminderCalendarView({
  selectedDate,
  onSelectedDateChange,
  onReminderPress,
}: ReminderCalendarViewProps) {
  const { t, i18n } = useTranslation();
  const { colors, isDark } = useAppTheme();
  const { reminders } = useReminders();

  const todayKey = ymd(new Date());
  const isToday = selectedDate === todayKey;

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

  const calendarKey = isDark ? 'dark' : 'light';

  const headerLabel = formatDayHeader(selectedDate, i18n.language);
  const headerPrefix = isToday ? `${t('common.today').toUpperCase()} · ` : '';

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
        {headerPrefix}{headerLabel}
      </Text>

      <View style={styles.dayList}>
        {remindersOnSelectedDate.length === 0 ? (
          <View style={styles.emptyInline}>
            <IconClock size={16} color={colors.textMuted} />
            <Text style={[styles.emptyInlineText, { color: colors.textMuted }]}>
              {t('reminders.calendar.emptyInline')}
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
  sectionHeader: {
    fontSize: theme.fontSize.xs,
    letterSpacing: 0.5,
    ...theme.font.semibold,
    marginBottom: theme.spacing.sm,
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
  emptyInline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.md,
  },
  emptyInlineText: {
    fontSize: theme.fontSize.sm,
  },
});
