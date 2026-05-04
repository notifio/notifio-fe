import DateTimePicker from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import type { CreatePersonalReminderInput, PersonalReminder, ReminderRecurrence, UpdatePersonalReminderInput } from '@notifio/api-client';

import { formatDate, formatTime } from '../../lib/format';
import { theme } from '../../lib/theme';
import { useAppTheme } from '../../providers/theme-provider';
import { FullScreenModal } from '../ui/fullscreen-modal';
import { TogglePill } from '../ui/toggle-pill';

interface ReminderFormModalProps {
  visible: boolean;
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

const RECURRENCE_OPTIONS: ReminderRecurrence[] = ['ONCE', 'DAILY', 'WEEKLY', 'MONTHLY'];

export function ReminderFormModal({
  visible,
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
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [saving, setSaving] = useState(false);

  const isEditing = !!editReminder;
  const canSave = title.trim().length > 0;

  const handleDateChange = (_event: unknown, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      setDate(selectedDate);
      if (Platform.OS === 'android') {
        setShowTimePicker(true);
      }
    }
  };

  const handleTimeChange = (_event: unknown, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowTimePicker(false);
    }
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const handleSave = async () => {
    if (!canSave || saving) return;
    setSaving(true);
    try {
      const body: CreatePersonalReminderInput = {
        title: title.trim(),
        description: description.trim() || undefined,
        triggerAt: date.toISOString(),
        recurrence,
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

  const formattedDate = formatDate(date.toISOString(), i18n.language);
  const formattedTime = formatTime(date.toISOString(), i18n.language);

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
      visible={visible}
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

        {/* Date & Time */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>
            {t('reminders.dateLabel')}
          </Text>
          <Pressable
            onPress={() => setShowDatePicker(true)}
            style={[
              styles.dateButton,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            <Text style={[styles.dateText, { color: colors.text }]}>
              {formattedDate} {formattedTime}
            </Text>
          </Pressable>

          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display={Platform.OS === 'ios' ? 'inline' : 'default'}
              onChange={handleDateChange}
            />
          )}

          {Platform.OS === 'ios' && showDatePicker && (
            <Pressable
              onPress={() => {
                setShowDatePicker(false);
                setShowTimePicker(true);
              }}
              style={[styles.confirmPickerButton, { backgroundColor: colors.primary }]}
            >
              <Text style={[styles.confirmPickerText, { color: colors.textInverse }]}>
                {t('common.ok')}
              </Text>
            </Pressable>
          )}

          {showTimePicker && (
            <DateTimePicker
              value={date}
              mode="time"
              display={Platform.OS === 'ios' ? 'inline' : 'default'}
              onChange={handleTimeChange}
            />
          )}

          {Platform.OS === 'ios' && showTimePicker && (
            <Pressable
              onPress={() => setShowTimePicker(false)}
              style={[styles.confirmPickerButton, { backgroundColor: colors.primary }]}
            >
              <Text style={[styles.confirmPickerText, { color: colors.textInverse }]}>
                {t('common.ok')}
              </Text>
            </Pressable>
          )}
        </View>

        {/* Recurrence */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>
            {t('reminders.recurrence')}
          </Text>
          <View style={styles.pillRow}>
            {RECURRENCE_OPTIONS.map((option) => (
              <TogglePill
                key={option}
                active={recurrence === option}
                label={t(`reminders.recurrenceOptions.${option}`)}
                onPress={() => setRecurrence(option)}
              />
            ))}
          </View>
        </View>
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
  dateButton: {
    borderWidth: 1,
    borderRadius: theme.radius.lg,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  dateText: {
    fontSize: theme.fontSize.md,
  },
  confirmPickerButton: {
    alignSelf: 'flex-end',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.md,
  },
  confirmPickerText: {
    fontSize: theme.fontSize.sm,
    ...theme.font.medium,
  },
  pillRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
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
