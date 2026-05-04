import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { theme, withOpacity } from '../../../lib/theme';
import { useAppTheme } from '../../../providers/theme-provider';
import { FullScreenModal } from '../../ui/fullscreen-modal';
import type { TablerIcon } from '../../ui/icon';
import { Icon } from '../../ui/icon';

interface EditSheetProps {
  visible: boolean;
  onClose: () => void;
  code: string | null;
  icon: TablerIcon | null;
  label: string;
  unit: string;
  currentValue: number | null;
  invalidValueLabel: string;
  saveLabel: string;
  removeLabel: string;
  onSave: (value: number) => Promise<void>;
  onRemove: () => Promise<void>;
}

export function EditSheet({
  visible,
  onClose,
  icon,
  label,
  unit,
  currentValue,
  invalidValueLabel,
  saveLabel,
  removeLabel,
  onSave,
  onRemove,
}: EditSheetProps) {
  const { colors } = useAppTheme();
  const [text, setText] = useState('');
  const [saving, setSaving] = useState(false);
  const [removing, setRemoving] = useState(false);

  useEffect(() => {
    if (visible) {
      setText(currentValue !== null && currentValue !== undefined ? String(currentValue) : '');
    }
  }, [visible, currentValue]);

  const trimmed = text.trim();
  const parsed = parseFloat(trimmed);
  const isValidNumber = trimmed.length > 0 && !isNaN(parsed);
  const showError = trimmed.length > 0 && !isValidNumber;
  const unchanged = isValidNumber && parsed === currentValue;
  const canSave = isValidNumber && !unchanged && !saving && !removing;

  const handleSave = async () => {
    if (!canSave) return;
    setSaving(true);
    try {
      await onSave(parsed);
      onClose();
    } catch {
      // Error toast handled by hook; keep sheet open
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async () => {
    if (currentValue === null || currentValue === undefined || removing || saving) return;
    setRemoving(true);
    try {
      await onRemove();
      onClose();
    } catch {
      // Error toast handled by hook; keep sheet open
    } finally {
      setRemoving(false);
    }
  };

  const keyboardType = Platform.OS === 'ios' ? 'numbers-and-punctuation' : 'numeric';
  const hasCurrent = currentValue !== null && currentValue !== undefined;

  const headerLeft = icon ? (
    <View style={[styles.iconCircle, { backgroundColor: withOpacity(colors.primary, 0.094) }]}>
      <Icon icon={icon} size={20} color={colors.primary} />
    </View>
  ) : undefined;

  const footer = (
    <View style={styles.footerRow}>
      {hasCurrent && (
        <Pressable
          onPress={handleRemove}
          disabled={removing || saving}
          style={[
            styles.removeButton,
            { borderColor: colors.danger },
            (removing || saving) && styles.disabled,
          ]}
        >
          {removing ? (
            <ActivityIndicator size="small" color={colors.danger} />
          ) : (
            <Text style={[styles.removeText, { color: colors.danger }]}>{removeLabel}</Text>
          )}
        </Pressable>
      )}
      <Pressable
        onPress={handleSave}
        disabled={!canSave}
        style={[
          styles.saveButton,
          { backgroundColor: colors.primary },
          !canSave && styles.disabled,
        ]}
      >
        {saving ? (
          <ActivityIndicator size="small" color={colors.textInverse} />
        ) : (
          <Text style={[styles.saveText, { color: colors.textInverse }]}>{saveLabel}</Text>
        )}
      </Pressable>
    </View>
  );

  return (
    <FullScreenModal
      visible={visible}
      onClose={onClose}
      title={label}
      headerLeft={headerLeft}
      footer={footer}
    >
      <View style={styles.bodyContent}>
        <View style={styles.field}>
          <View
            style={[
              styles.inputRow,
              {
                backgroundColor: colors.surface,
                borderColor: showError ? colors.danger : colors.border,
              },
            ]}
          >
            <TextInput
              style={[styles.input, { color: colors.text }]}
              value={text}
              onChangeText={setText}
              keyboardType={keyboardType}
              placeholder="0"
              placeholderTextColor={colors.textMuted}
              autoFocus
            />
            <Text style={[styles.unitSuffix, { color: colors.textMuted }]}>{unit}</Text>
          </View>
          {showError && (
            <Text style={[styles.error, { color: colors.danger }]}>{invalidValueLabel}</Text>
          )}
        </View>
      </View>
    </FullScreenModal>
  );
}

const styles = StyleSheet.create({
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: theme.radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bodyContent: {
    padding: theme.spacing.xl,
    gap: theme.spacing.xl,
  },
  field: {
    gap: theme.spacing.sm,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: theme.radius.lg,
    paddingHorizontal: theme.spacing.lg,
  },
  input: {
    flex: 1,
    fontSize: theme.fontSize.xl,
    paddingVertical: theme.spacing.md,
    ...theme.font.medium,
  },
  unitSuffix: {
    fontSize: theme.fontSize.md,
    ...theme.font.medium,
  },
  error: {
    fontSize: theme.fontSize.sm,
  },
  footerRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  saveButton: {
    flex: 1,
    borderRadius: theme.radius.lg,
    paddingVertical: theme.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveText: {
    fontSize: theme.fontSize.md,
    ...theme.font.semibold,
  },
  removeButton: {
    flex: 1,
    borderRadius: theme.radius.lg,
    paddingVertical: theme.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  removeText: {
    fontSize: theme.fontSize.md,
    ...theme.font.semibold,
  },
  disabled: {
    opacity: 0.5,
  },
});
