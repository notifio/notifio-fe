import { IconX } from '@tabler/icons-react-native';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { theme } from '../lib/theme';
import { useAppTheme } from '../providers/theme-provider';
import { MonthGrid } from './ui/month-grid';

interface NotifioDateTimePickerProps {
  visible: boolean;
  /** Initial value to seed the picker with on open. */
  initial: Date;
  onConfirm: (next: Date) => void;
  onClose: () => void;
}

const pad = (n: number) => String(n).padStart(2, '0');

function startOfDay(d: Date): Date {
  const c = new Date(d);
  c.setHours(0, 0, 0, 0);
  return c;
}

const HOUR_VALUES = Array.from({ length: 24 }, (_, i) => i);
const MINUTE_VALUES = Array.from({ length: 60 }, (_, i) => i);
const WHEEL_ROW_HEIGHT = 40;
const WHEEL_VISIBLE_ROWS = 5; // 2 above + selected + 2 below

interface QuickChip {
  label: string;
  hour: number;
  minute: number;
}

/**
 * Notifio-styled datetime picker presented over the reminder form.
 * Custom calendar grid + iOS-style scroll wheels for hours/minutes.
 * Replaces native `@react-native-community/datetimepicker` so the
 * surface matches the dark theme on both platforms and renders
 * weekday/month names in the app locale.
 */
export function NotifioDateTimePicker({
  visible,
  initial,
  onConfirm,
  onClose,
}: NotifioDateTimePickerProps) {
  const { colors } = useAppTheme();
  const { t, i18n } = useTranslation();
  const insets = useSafeAreaInsets();

  // Recompute on every render; the only cost is one Date allocation,
  // and refreshing it lets "today" tick over correctly if the picker
  // sits open across midnight.
  const today = startOfDay(new Date());

  const [draftDate, setDraftDate] = useState(() => startOfDay(initial));
  const [draftHour, setDraftHour] = useState(initial.getHours());
  const [draftMinute, setDraftMinute] = useState(initial.getMinutes());
  const [calYear, setCalYear] = useState(initial.getFullYear());
  const [calMonth, setCalMonth] = useState(initial.getMonth());

  // Re-seed every time the modal opens with the latest external value.
  useEffect(() => {
    if (!visible) return;
    setDraftDate(startOfDay(initial));
    setDraftHour(initial.getHours());
    setDraftMinute(initial.getMinutes());
    setCalYear(initial.getFullYear());
    setCalMonth(initial.getMonth());
  }, [visible, initial]);

  const selectedDay =
    draftDate.getFullYear() === calYear && draftDate.getMonth() === calMonth
      ? draftDate.getDate()
      : null;

  const isPastDay = (day: number) => {
    const candidate = new Date(calYear, calMonth, day);
    return startOfDay(candidate) < today;
  };

  const handleSelectDay = (day: number) => {
    if (isPastDay(day)) return;
    setDraftDate(new Date(calYear, calMonth, day));
  };

  const setTime = (h: number, m: number) => {
    setDraftHour(h);
    setDraftMinute(m);
  };

  // Spec: "+1h-from-now" recomputes on render. Keep the array inline
  // so that's literally what happens.
  const inOneHour = new Date(Date.now() + 60 * 60 * 1000);
  const quickChips: QuickChip[] = [
    { label: '08:00', hour: 8, minute: 0 },
    { label: '12:00', hour: 12, minute: 0 },
    { label: '18:00', hour: 18, minute: 0 },
    {
      label: `${pad(inOneHour.getHours())}:${pad(inOneHour.getMinutes())}`,
      hour: inOneHour.getHours(),
      minute: inOneHour.getMinutes(),
    },
  ];

  const commit = () => {
    const merged = new Date(draftDate);
    merged.setHours(draftHour, draftMinute, 0, 0);
    onConfirm(merged);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <Text style={[styles.title, { color: colors.text }]}>
            {t('reminders.form.dateTime')}
          </Text>
          <Pressable
            onPress={onClose}
            hitSlop={8}
            style={[styles.closeBtn, { backgroundColor: colors.surface }]}
          >
            <IconX size={16} color={colors.text} />
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={styles.body}
          showsVerticalScrollIndicator={false}
        >
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

          {/* Quick chips */}
          <View style={styles.chipRow}>
            {quickChips.map((chip) => {
              const active = chip.hour === draftHour && chip.minute === draftMinute;
              return (
                <Pressable
                  key={chip.label}
                  onPress={() => setTime(chip.hour, chip.minute)}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: active
                        ? `${colors.primary}26`
                        : colors.surface,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.chipLabel,
                      { color: active ? colors.primary : colors.textMuted },
                    ]}
                  >
                    {chip.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* Wheels */}
          <View style={styles.wheelsRow}>
            <Wheel
              values={HOUR_VALUES}
              value={draftHour}
              onChange={setDraftHour}
            />
            <Text style={[styles.wheelSeparator, { color: colors.text }]}>:</Text>
            <Wheel
              values={MINUTE_VALUES}
              value={draftMinute}
              onChange={setDraftMinute}
            />
          </View>
        </ScrollView>

        {/* Footer */}
        <View style={[styles.footer, { paddingBottom: insets.bottom + theme.spacing.lg }]}>
          <Pressable
            onPress={commit}
            style={[styles.confirmBtn, { backgroundColor: colors.primary }]}
          >
            <Text style={[styles.confirmLabel, { color: colors.textInverse }]}>
              {t('picker.confirm')}
            </Text>
          </Pressable>
          <Pressable onPress={onClose} style={styles.cancelBtn}>
            <Text style={[styles.cancelLabel, { color: colors.textMuted }]}>
              {t('common.cancel')}
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

// ── Wheel column ────────────────────────────────────────────────────

interface WheelProps {
  values: number[];
  value: number;
  onChange: (next: number) => void;
}

/**
 * iOS-style scroll wheel. Two padding rows above and below the content
 * push the central row into the viewport; `snapToInterval` locks the
 * scroll position to row boundaries; the central row gets larger font
 * + accent color via index distance from the focused value.
 */
function Wheel({ values, value, onChange }: WheelProps) {
  const { colors } = useAppTheme();
  const scrollRef = useRef<ScrollView>(null);

  // Programmatic scroll-to-value when external value changes (e.g. quick
  // chip tap). Skip the animation on the initial layout to avoid jumping
  // visibly on first paint.
  const isFirstScroll = useRef(true);
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
    <View style={[styles.wheel, { borderColor: colors.border }]}>
      {/* Center selection indicator */}
      <View
        pointerEvents="none"
        style={[
          styles.wheelCenter,
          { borderTopColor: colors.border, borderBottomColor: colors.border },
        ]}
      />
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
                    color: focused ? colors.text : colors.textMuted,
                    fontSize: focused ? 22 : 16,
                    opacity: focused ? 1 : 0.55,
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
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  title: {
    fontSize: theme.fontSize.lg,
    ...theme.font.semibold,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing['3xl'],
    gap: theme.spacing.xl,
  },
  chipRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  chip: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.lg,
    alignItems: 'center',
  },
  chipLabel: {
    fontSize: theme.fontSize.sm,
    ...theme.font.medium,
  },
  wheelsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.md,
  },
  wheelSeparator: {
    fontSize: 22,
    ...theme.font.semibold,
  },
  wheel: {
    width: 80,
    height: WHEEL_ROW_HEIGHT * WHEEL_VISIBLE_ROWS,
    borderRadius: theme.radius.lg,
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
    zIndex: 1,
  },
  wheelRow: {
    height: WHEEL_ROW_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wheelLabel: {
    ...theme.font.semibold,
  },
  footer: {
    paddingHorizontal: theme.spacing.xl,
    gap: theme.spacing.sm,
  },
  confirmBtn: {
    paddingVertical: theme.spacing.md,
    borderRadius: theme.radius.lg,
    alignItems: 'center',
  },
  confirmLabel: {
    fontSize: theme.fontSize.md,
    ...theme.font.semibold,
  },
  cancelBtn: {
    paddingVertical: theme.spacing.sm,
    alignItems: 'center',
  },
  cancelLabel: {
    fontSize: theme.fontSize.sm,
    ...theme.font.medium,
  },
});
