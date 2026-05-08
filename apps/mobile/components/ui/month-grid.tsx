import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react-native';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { theme } from '../../lib/theme';
import { useAppTheme } from '../../providers/theme-provider';

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

/** Monday=0 .. Sunday=6 */
function getFirstDayOfWeek(year: number, month: number): number {
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1;
}

function buildWeekdayLabels(locale: string): string[] {
  const fmt = new Intl.DateTimeFormat(locale, { weekday: 'short' });
  const sundayUtc = Date.UTC(1970, 0, 4);
  // Render Monday-first to match BE recurrenceDays expectations and the
  // web grid. Walk from 1970-01-05 (a Monday) for seven days.
  return Array.from({ length: 7 }, (_, i) =>
    fmt.format(new Date(sundayUtc + (i + 1) * 86400000)),
  );
}

function buildMonthLabel(year: number, month: number, locale: string): string {
  return new Date(year, month).toLocaleString(locale, {
    month: 'long',
    year: 'numeric',
  });
}

interface MonthGridProps {
  year: number;
  month: number;
  selectedDay: number | null;
  today?: Date;
  hasDot?: (day: number) => boolean;
  isDisabled?: (day: number) => boolean;
  locale: string;
  onSelectDay: (day: number) => void;
  onMonthChange: (year: number, month: number) => void;
}

/**
 * RN equivalent of the web `MonthGrid`. Same behaviour and look:
 * Monday-first headers, accent-coloured selected day, today highlight
 * via accent ring, optional dot + isDisabled predicate (used to gray
 * out past days inside the datetime picker).
 */
export function MonthGrid({
  year,
  month,
  selectedDay,
  today,
  hasDot,
  isDisabled,
  locale,
  onSelectDay,
  onMonthChange,
}: MonthGridProps) {
  const { colors } = useAppTheme();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDayOffset = getFirstDayOfWeek(year, month);

  const weekdayLabels = useMemo(() => buildWeekdayLabels(locale), [locale]);
  const monthLabel = useMemo(() => buildMonthLabel(year, month, locale), [year, month, locale]);

  const prevMonth = () => {
    if (month === 0) onMonthChange(year - 1, 11);
    else onMonthChange(year, month - 1);
  };
  const nextMonth = () => {
    if (month === 11) onMonthChange(year + 1, 0);
    else onMonthChange(year, month + 1);
  };

  const isToday = (day: number) =>
    today != null &&
    today.getFullYear() === year &&
    today.getMonth() === month &&
    today.getDate() === day;

  return (
    <View>
      <View style={styles.headerRow}>
        <Pressable onPress={prevMonth} hitSlop={8} style={styles.navBtn}>
          <IconChevronLeft size={18} color={colors.textMuted} />
        </Pressable>
        <Text style={[styles.monthLabel, { color: colors.text }]}>{monthLabel}</Text>
        <Pressable onPress={nextMonth} hitSlop={8} style={styles.navBtn}>
          <IconChevronRight size={18} color={colors.textMuted} />
        </Pressable>
      </View>

      <View style={styles.weekHeaderRow}>
        {weekdayLabels.map((label, i) => (
          <Text key={i} style={[styles.weekHeader, { color: colors.textMuted }]}>
            {label}
          </Text>
        ))}
      </View>

      <View style={styles.grid}>
        {Array.from({ length: firstDayOffset }).map((_, i) => (
          <View key={`empty-${i}`} style={styles.dayCell} />
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const sel = selectedDay === day;
          const todayHl = isToday(day);
          const disabled = isDisabled?.(day) ?? false;
          const dot = hasDot?.(day) ?? false;

          return (
            <Pressable
              key={day}
              onPress={() => !disabled && onSelectDay(day)}
              disabled={disabled}
              style={[
                styles.dayCell,
                styles.dayCellInteractive,
                sel && { backgroundColor: colors.primary },
                !sel && todayHl && { borderColor: colors.primary, borderWidth: 1 },
                disabled && styles.dayCellDisabled,
              ]}
            >
              <Text
                style={[
                  styles.dayLabel,
                  {
                    color: sel
                      ? colors.textInverse
                      : todayHl
                        ? colors.primary
                        : colors.text,
                  },
                ]}
              >
                {day}
              </Text>
              {dot && (
                <View
                  style={[
                    styles.dot,
                    { backgroundColor: sel ? colors.textInverse : colors.primary },
                  ]}
                />
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const CELL_SIZE = 36;

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.xs,
  },
  navBtn: {
    padding: theme.spacing.xs,
  },
  monthLabel: {
    fontSize: theme.fontSize.sm,
    ...theme.font.semibold,
    textTransform: 'capitalize',
  },
  weekHeaderRow: {
    flexDirection: 'row',
    marginTop: theme.spacing.sm,
  },
  weekHeader: {
    flex: 1,
    textAlign: 'center',
    fontSize: 10,
    ...theme.font.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingVertical: 4,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
  },
  dayCell: {
    width: `${100 / 7}%`,
    height: CELL_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCellInteractive: {
    borderRadius: CELL_SIZE / 2,
  },
  dayCellDisabled: {
    opacity: 0.4,
  },
  dayLabel: {
    fontSize: theme.fontSize.sm,
  },
  dot: {
    position: 'absolute',
    bottom: 4,
    width: 4,
    height: 4,
    borderRadius: 2,
  },
});
