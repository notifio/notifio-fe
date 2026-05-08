import { IconCalendar } from '@tabler/icons-react-native';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { theme } from '../lib/theme';
import { useAppTheme } from '../providers/theme-provider';
import { MonthGrid } from './ui/month-grid';

interface NotifioDateTimePickerProps {
  /** Current value. Empty/invalid => placeholder shown. */
  value: Date | null;
  onChange: (next: Date) => void;
}

const pad = (n: number) => String(n).padStart(2, '0');

const HOUR_VALUES = Array.from({ length: 24 }, (_, i) => i);
const MINUTE_VALUES = Array.from({ length: 60 }, (_, i) => i);
const WHEEL_ROW_HEIGHT = 36;
const WHEEL_VISIBLE_ROWS = 5;

function startOfDay(d: Date): Date {
  const c = new Date(d);
  c.setHours(0, 0, 0, 0);
  return c;
}

/** 11:00 → 12:00, 11:02 → 13:00, 22:30 → 23:00, 23:30 → 23:00. */
function nextRoundHourFromNow(): { hour: number; minute: number } {
  const inOneHour = new Date(Date.now() + 60 * 60 * 1000);
  let hour = inOneHour.getHours();
  if (inOneHour.getMinutes() > 0) hour += 1;
  return { hour: Math.min(23, hour), minute: 0 };
}

interface QuickChip {
  label: string;
  hour: number;
  minute: number;
  dynamic?: boolean;
}

/**
 * Inline-section datetime picker. Mirrors the web component shape:
 * trigger button + collapsible section in normal flow, no Modal,
 * no scroll wheels. Edits write to the parent immediately; the
 * "Zatvoriť" button just collapses the section.
 */
export function NotifioDateTimePicker({ value, onChange }: NotifioDateTimePickerProps) {
  const { colors } = useAppTheme();
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);

  const today = startOfDay(new Date());
  const seedDate = value ?? today;

  const [calYear, setCalYear] = useState(seedDate.getFullYear());
  const [calMonth, setCalMonth] = useState(seedDate.getMonth());

  const currentHour = value?.getHours() ?? 9;
  const currentMinute = value?.getMinutes() ?? 0;

  const selectedDay =
    value && value.getFullYear() === calYear && value.getMonth() === calMonth
      ? value.getDate()
      : null;

  const isPastDay = (day: number) => {
    const candidate = new Date(calYear, calMonth, day);
    return startOfDay(candidate) < today;
  };

  const writeValue = (date: Date, hour: number, minute: number) => {
    const next = new Date(date);
    next.setHours(hour, minute, 0, 0);
    onChange(next);
  };

  const handleSelectDay = (day: number) => {
    if (isPastDay(day)) return;
    writeValue(new Date(calYear, calMonth, day), currentHour, currentMinute);
  };

  const setTime = (h: number, m: number) => {
    const clampedH = Math.max(0, Math.min(23, h));
    const clampedM = Math.max(0, Math.min(59, m));
    writeValue(value ?? today, clampedH, clampedM);
  };

  const plusOneHour = nextRoundHourFromNow();
  const quickChips: QuickChip[] = [
    { label: '08:00', hour: 8, minute: 0 },
    { label: '12:00', hour: 12, minute: 0 },
    { label: '18:00', hour: 18, minute: 0 },
    {
      label: t('picker.plusOneHour'),
      hour: plusOneHour.hour,
      minute: plusOneHour.minute,
      dynamic: true,
    },
  ];

  const triggerLabel = value
    ? `${value.toLocaleDateString(i18n.language, { day: 'numeric', month: 'long', year: 'numeric' })}, ${pad(currentHour)}:${pad(currentMinute)}`
    : null;

  return (
    <View>
      <Pressable
        onPress={() => setOpen((v) => !v)}
        style={[
          styles.trigger,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <Text style={[styles.triggerText, { color: triggerLabel ? colors.text : colors.textMuted }]}>
          {triggerLabel ?? t('picker.placeholder')}
        </Text>
        <IconCalendar size={16} color={colors.textMuted} />
      </Pressable>

      {open && (
        <View style={styles.section}>
          <MonthGrid
            year={calYear}
            month={calMonth}
            selectedDay={selectedDay}
            today={today}
            isDisabled={isPastDay}
            locale={i18n.language}
            onSelectDay={handleSelectDay}
            onMonthChange={(y, m) => {
              setCalYear(y);
              setCalMonth(m);
            }}
          />

          <View style={[styles.divider, { backgroundColor: 'rgba(255,255,255,0.08)' }]} />

          <View style={styles.timeRow}>
            <Text style={[styles.timeLabel, { color: '#5A6A85' }]}>{t('picker.time')}</Text>
            <View style={styles.wheelGroup}>
              <Wheel
                values={HOUR_VALUES}
                value={currentHour}
                onChange={(h) => setTime(h, currentMinute)}
              />
              <Text style={styles.timeColon}>:</Text>
              <Wheel
                values={MINUTE_VALUES}
                value={currentMinute}
                onChange={(m) => setTime(currentHour, m)}
              />
            </View>
          </View>

          <View style={styles.quickWrap}>
            <Text style={[styles.timeLabel, { color: '#5A6A85' }]}>{t('picker.quickOptions')}</Text>
            <View style={styles.chipRow}>
              {quickChips.map((chip) => {
                const active = !chip.dynamic && chip.hour === currentHour && chip.minute === currentMinute;
                return (
                  <Pressable
                    key={chip.label}
                    onPress={() => {
                      if (chip.dynamic) {
                        const fresh = nextRoundHourFromNow();
                        setTime(fresh.hour, fresh.minute);
                      } else {
                        setTime(chip.hour, chip.minute);
                      }
                    }}
                    style={[
                      styles.chip,
                      {
                        backgroundColor: active ? '#FF7A2F' : 'rgba(255,255,255,0.06)',
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.chipLabel,
                        { color: active ? '#FFFFFF' : 'rgba(255,255,255,0.75)' },
                      ]}
                    >
                      {chip.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <Pressable
            onPress={() => setOpen(false)}
            style={[styles.closeBtn, { borderColor: 'rgba(255,255,255,0.1)' }]}
          >
            <Text style={[styles.closeLabel, { color: 'rgba(255,255,255,0.8)' }]}>
              {t('picker.close')}
            </Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

// ── Scroll wheel ───────────────────────────────────────────────────

interface WheelProps {
  values: number[];
  value: number;
  onChange: (next: number) => void;
}

/**
 * iOS-style scroll wheel column. Padding rows above/below push the
 * central row into the viewport; `snapToInterval` locks the scroll
 * position to row boundaries; the central row gets larger font + full
 * opacity, neighbours render smaller and dimmer. `onMomentumScrollEnd`
 * commits the new value to the parent.
 */
function Wheel({ values, value, onChange }: WheelProps) {
  const scrollRef = useRef<ScrollView>(null);
  const isFirstScroll = useRef(true);

  // Drive scroll position from the external value so quick-chip taps
  // animate the wheel to the new time.
  useEffect(() => {
    const idx = values.indexOf(value);
    if (idx < 0) return;
    scrollRef.current?.scrollTo({
      y: idx * WHEEL_ROW_HEIGHT,
      animated: !isFirstScroll.current,
    });
    isFirstScroll.current = false;
  }, [value, values]);

  const handleMomentumEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const idx = Math.round(e.nativeEvent.contentOffset.y / WHEEL_ROW_HEIGHT);
    const clamped = Math.max(0, Math.min(values.length - 1, idx));
    const next = values[clamped]!;
    if (next !== value) onChange(next);
  };

  const padRows = Math.floor(WHEEL_VISIBLE_ROWS / 2);

  return (
    <View style={styles.wheel}>
      <View pointerEvents="none" style={styles.wheelCenter} />
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        snapToInterval={WHEEL_ROW_HEIGHT}
        decelerationRate="fast"
        onMomentumScrollEnd={handleMomentumEnd}
        contentContainerStyle={{ paddingVertical: padRows * WHEEL_ROW_HEIGHT }}
      >
        {values.map((v) => {
          const focused = v === value;
          return (
            <View key={v} style={styles.wheelRow}>
              <Text
                style={[
                  styles.wheelLabel,
                  {
                    fontSize: focused ? 22 : 16,
                    opacity: focused ? 1 : 0.5,
                  },
                ]}
              >
                {pad(v)}
              </Text>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 44,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
  },
  triggerText: {
    fontSize: theme.fontSize.sm,
  },
  section: {
    marginTop: theme.spacing.sm,
    backgroundColor: '#0E223F',
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
  },
  divider: {
    height: 1,
    marginVertical: theme.spacing.md,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  timeLabel: {
    fontSize: theme.fontSize.xs,
    ...theme.font.medium,
  },
  wheelGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  wheel: {
    width: 64,
    height: WHEEL_ROW_HEIGHT * WHEEL_VISIBLE_ROWS,
    overflow: 'hidden',
    position: 'relative',
  },
  wheelCenter: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: WHEEL_ROW_HEIGHT * Math.floor(WHEEL_VISIBLE_ROWS / 2),
    height: WHEEL_ROW_HEIGHT,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.15)',
    zIndex: 1,
  },
  wheelRow: {
    height: WHEEL_ROW_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wheelLabel: {
    color: '#FFFFFF',
    ...theme.font.semibold,
  },
  timeColon: {
    fontSize: 18,
    color: '#5A6A85',
    ...theme.font.medium,
  },
  quickWrap: {
    marginTop: theme.spacing.md,
    gap: theme.spacing.xs,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: theme.radius.md,
  },
  chipLabel: {
    fontSize: theme.fontSize.xs,
    ...theme.font.medium,
  },
  closeBtn: {
    marginTop: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255,255,255,0.04)',
    alignItems: 'center',
  },
  closeLabel: {
    fontSize: theme.fontSize.sm,
    ...theme.font.medium,
  },
});
