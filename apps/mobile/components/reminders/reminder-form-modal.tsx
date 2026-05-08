import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import type { CreatePersonalReminderInput, PersonalReminder, ReminderRecurrence, UpdatePersonalReminderInput } from '@notifio/api-client';

import { theme } from '../../lib/theme';
import { useAppTheme } from '../../providers/theme-provider';
import { NotifioDateTimePicker } from '../notifio-date-time-picker';
import { FullScreenModal } from '../ui/fullscreen-modal';
import { TogglePill } from '../ui/toggle-pill';

interface ReminderFormModalProps {
  onClose: () => void;
  onSave: (body: CreatePersonalReminderInput) => Promise<void>;
  onUpdate?: (id: string, body: UpdatePersonalReminderInput) => Promise<void>;
  editReminder?: PersonalReminder;
  /**
   * When opening for create from the calendar view, prefill the date
   * portion to the day the user selected. Time defaults to now.
   * Ignored when editReminder is set.
   */
  defaultDate?: Date;
}

const RECURRENCE_OPTIONS: ReminderRecurrence[] = [
  'ONCE',
  'DAILY',
  'WEEKLY',
  'BIWEEKLY',
  'MONTHLY',
  'YEARLY',
];

// Sunday-first values to match BE's `recurrenceDays` CSV (where
// 0=Sunday). Labels are derived per-render from Intl in the locale
// the user is on, so we don't need to ship a `weekDayShort.*` key
// table in shared.
const WEEK_DAY_VALUES = [0, 1, 2, 3, 4, 5, 6] as const;

function buildWeekDayShort(locale: string): Record<number, string> {
  const fmt = new Intl.DateTimeFormat(locale, { weekday: 'short' });
  // 1970-01-04 (UTC) was a Sunday; walk seven days forward.
  const sunday = Date.UTC(1970, 0, 4);
  const map: Record<number, string> = {};
  for (const i of WEEK_DAY_VALUES) {
    map[i] = fmt.format(new Date(sunday + i * 86400000));
  }
  return map;
}

function parseDays(csv: string | null | undefined): Set<number> {
  if (!csv) return new Set();
  return new Set(csv.split(',').map(Number).filter((n) => Number.isFinite(n)));
}

export function ReminderFormModal({
  onClose,
  onSave,
  onUpdate,
  editReminder,
  defaultDate,
}: ReminderFormModalProps) {
  const { colors } = useAppTheme();
  const { t, i18n } = useTranslation();

  const [title, setTitle] = useState(editReminder?.title ?? '');
  const [description, setDescription] = useState(editReminder?.description ?? '');
  const [date, setDate] = useState(() => {
    if (editReminder) return new Date(editReminder.triggerAt);
    if (defaultDate) {
      // Keep the picked day, but set time to now so the user gets a
      // sensible default time component (calendar only picks a day).
      const now = new Date();
      const d = new Date(defaultDate);
      d.setHours(now.getHours(), now.getMinutes(), 0, 0);
      return d;
    }
    return new Date();
  });
  const [recurrence, setRecurrence] = useState<ReminderRecurrence>(
    editReminder?.recurrence ?? 'ONCE',
  );
  const [selectedDays, setSelectedDays] = useState<Set<number>>(
    () => parseDays(editReminder?.recurrenceDays ?? null),
  );
  const [saving, setSaving] = useState(false);

  const isEditing = !!editReminder;
  const canSave =
    title.trim().length > 0 && (recurrence !== 'WEEKLY' || selectedDays.size > 0);

  const weekDayShort = useMemo(
    () => buildWeekDayShort(i18n.language),
    [i18n.language],
  );

  const toggleDay = (day: number) => {
    setSelectedDays((prev) => {
      const next = new Set(prev);
      if (next.has(day)) next.delete(day);
      else next.add(day);
      return next;
    });
  };

  const handleSave = async () => {
    if (!canSave || saving) return;
    setSaving(true);
    try {
      const recurrenceDays =
        recurrence === 'WEEKLY' && selectedDays.size > 0
          ? [...selectedDays].sort((a, b) => a - b).join(',')
          : undefined;

      const body: CreatePersonalReminderInput = {
        title: title.trim(),
        description: description.trim() || undefined,
        triggerAt: date.toISOString(),
        recurrence,
        ...(recurrenceDays !== undefined ? { recurrenceDays } : {}),
      };

      if (isEditing && onUpdate) {
        await onUpdate(editReminder.reminderId, body);
      } else {
        await onSave(body);
      }
      onClose();
    } catch {
      // Error handled by hook toast
    } finally {
      setSaving(false);
    }
  };

  const footer = (
    <Pressable
      onPress={handleSave}
      disabled={!canSave || saving}
      style={[
        styles.saveButton,
        { backgroundColor: canSave ? colors.primary : colors.border },
      ]}
    >
      {saving ? (
        <ActivityIndicator size="small" color={colors.textInverse} />
      ) : (
        <Text style={[styles.saveText, { color: colors.textInverse }]}>
          {saving ? t('reminders.saving') : t('reminders.save')}
        </Text>
      )}
    </Pressable>
  );

  return (
    <FullScreenModal
      visible
      onClose={onClose}
      title={isEditing ? t('reminders.edit') : t('reminders.create')}
      footer={footer}
    >
      <View style={styles.bodyContent}>
        {/* Title */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>
            {t('reminders.titleLabel')}
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                color: colors.text,
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
            value={title}
            onChangeText={setTitle}
            placeholder={t('reminders.titlePlaceholder')}
            placeholderTextColor={colors.textMuted}
          />
        </View>

        {/* Description */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>
            {t('reminders.descriptionLabel')}
          </Text>
          <TextInput
            style={[
              styles.input,
              styles.multilineInput,
              {
                color: colors.text,
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
            value={description}
            onChangeText={setDescription}
            placeholder={t('reminders.descriptionPlaceholder')}
            placeholderTextColor={colors.textMuted}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        {/* Date & Time — inline section picker; trigger + collapsible
            section live inside NotifioDateTimePicker. */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>
            {t('reminders.dateLabel')}
          </Text>
          <NotifioDateTimePicker value={date} onChange={setDate} />
        </View>

        {/* Recurrence */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>
            {t('reminders.recurrence')}
          </Text>
          <View style={styles.pillGrid}>
            {[0, 1].map((rowIdx) => (
              <View key={rowIdx} style={styles.pillRow}>
                {RECURRENCE_OPTIONS.slice(rowIdx * 3, rowIdx * 3 + 3).map((option) => (
                  <TogglePill
                    key={option}
                    active={recurrence === option}
                    label={t(`reminders.recurrenceOptions.${option}`)}
                    onPress={() => setRecurrence(option)}
                    style={styles.pillCell}
                  />
                ))}
              </View>
            ))}
          </View>
        </View>

        {/* WEEKLY day picker — Sunday-first to match BE recurrenceDays
            CSV (0=Sunday). Day labels come from i18n with locale-aware
            short names already shipped in shared 0.31. */}
        {recurrence === 'WEEKLY' && (
          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>
              {t('reminders.form.weekDays')}
            </Text>
            <View style={styles.weekDayRow}>
              {WEEK_DAY_VALUES.map((value) => {
                const active = selectedDays.has(value);
                return (
                  <Pressable
                    key={value}
                    onPress={() => toggleDay(value)}
                    style={[
                      styles.weekDayChip,
                      active
                        ? { backgroundColor: colors.primary, borderColor: colors.primary }
                        : { backgroundColor: 'transparent', borderColor: colors.border },
                    ]}
                  >
                    <Text
                      style={[
                        styles.weekDayLabel,
                        { color: active ? colors.textInverse : colors.textMuted },
                      ]}
                    >
                      {weekDayShort[value]}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        )}
      </View>
    </FullScreenModal>
  );
}

const styles = StyleSheet.create({
  bodyContent: {
    padding: theme.spacing.xl,
    gap: theme.spacing.xl,
  },
  field: {
    gap: theme.spacing.sm,
  },
  label: {
    fontSize: theme.fontSize.sm,
    ...theme.font.medium,
  },
  input: {
    borderWidth: 1,
    borderRadius: theme.radius.lg,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    fontSize: theme.fontSize.md,
  },
  multilineInput: {
    minHeight: 80,
  },
  pillGrid: {
    gap: theme.spacing.sm,
  },
  pillRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  pillCell: {
    flex: 1,
  },
  weekDayRow: {
    flexDirection: 'row',
    gap: theme.spacing.xs,
  },
  weekDayChip: {
    flex: 1,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radius.full,
    borderWidth: 1,
  },
  weekDayLabel: {
    fontSize: theme.fontSize.xs,
    ...theme.font.medium,
  },
  saveButton: {
    borderRadius: theme.radius.lg,
    paddingVertical: theme.spacing.lg,
    alignItems: 'center',
  },
  saveText: {
    fontSize: theme.fontSize.md,
    ...theme.font.semibold,
  },
});
