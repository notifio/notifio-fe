import DateTimePicker from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { theme } from '../../lib/theme';
import { useAppTheme } from '../../providers/theme-provider';
import { Card } from '../ui/card';
import { ToggleRow } from '../ui/toggle-row';

/**
 * Sprint 2: global quiet-hours section. Per Filip's product decision
 * we expose a single set of times that applies across every category;
 * the BE service mirrors the values onto every preference row for the
 * user. Gated on the `quiet_hours` membership feature.
 *
 * Format: HH:MM strings (matches `time` Postgres column the BE writes).
 */
interface QuietHoursSectionProps {
  start: string | null;
  end: string | null;
  available: boolean;
  onChange: (start: string | null, end: string | null) => void;
  disabled?: boolean;
}

function parseTime(value: string | null): Date {
  const d = new Date();
  d.setSeconds(0, 0);
  if (!value) {
    d.setHours(22, 0, 0, 0);
    return d;
  }
  const [hh, mm] = value.split(':').map(Number);
  d.setHours(hh ?? 22, mm ?? 0, 0, 0);
  return d;
}

function formatTime(d: Date): string {
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
}

export function QuietHoursSection({
  start,
  end,
  available,
  onChange,
  disabled,
}: QuietHoursSectionProps) {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const [pickerOpen, setPickerOpen] = useState<'start' | 'end' | null>(null);

  const enabled = start !== null && end !== null;

  return (
    <Card>
      <ToggleRow
        label={t('notificationPreferences.quietHoursEnabled')}
        value={enabled}
        onValueChange={(v) => {
          if (!available) return;
          onChange(v ? '22:00' : null, v ? '07:00' : null);
        }}
        disabled={disabled || !available}
      />
      {!available && (
        <Text style={[styles.proHint, { color: colors.textSecondary }]}>
          {t('notificationPreferences.quietHoursProOnly')}
        </Text>
      )}
      {available && enabled && (
        <View style={styles.times}>
          <TimeButton
            label={t('notificationPreferences.quietHoursFrom')}
            value={start ?? '22:00'}
            onPress={() => setPickerOpen('start')}
            disabled={disabled}
          />
          <TimeButton
            label={t('notificationPreferences.quietHoursTo')}
            value={end ?? '07:00'}
            onPress={() => setPickerOpen('end')}
            disabled={disabled}
          />
        </View>
      )}
      {pickerOpen !== null && (
        <DateTimePicker
          mode="time"
          display="default"
          value={parseTime(pickerOpen === 'start' ? start : end)}
          onChange={(event, date) => {
            const which = pickerOpen;
            setPickerOpen(null);
            if (event.type === 'set' && date) {
              const newValue = formatTime(date);
              if (which === 'start') onChange(newValue, end);
              else onChange(start, newValue);
            }
          }}
        />
      )}
    </Card>
  );
}

interface TimeButtonProps {
  label: string;
  value: string;
  onPress: () => void;
  disabled?: boolean;
}

function TimeButton({ label, value, onPress, disabled }: TimeButtonProps) {
  const { colors } = useAppTheme();
  return (
    <Pressable onPress={onPress} disabled={disabled} style={[styles.timeButton, disabled && styles.disabled]}>
      <Text style={[styles.timeLabel, { color: colors.textSecondary }]}>{label}</Text>
      <Text style={[styles.timeValue, { color: colors.text }]}>{value}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  proHint: {
    fontSize: theme.fontSize.sm,
    marginTop: theme.spacing.xs,
  },
  times: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginTop: theme.spacing.sm,
  },
  timeButton: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.radius.md,
    alignItems: 'center',
  },
  timeLabel: {
    fontSize: theme.fontSize.xs,
    textTransform: 'uppercase',
    marginBottom: theme.spacing.xs,
  },
  timeValue: {
    fontSize: theme.fontSize.lg,
    ...theme.font.medium,
  },
  disabled: {
    opacity: 0.5,
  },
});
