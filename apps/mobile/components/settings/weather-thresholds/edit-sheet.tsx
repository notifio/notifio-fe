import { useEffect, useState } from 'react';
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

import { sharedColors } from '@notifio/ui';

import type { WeatherThresholdMetricConfig } from './codes';
import { theme, withOpacity } from '../../../lib/theme';
import { useAppTheme } from '../../../providers/theme-provider';
import { FullScreenModal } from '../../ui/fullscreen-modal';
import { Icon } from '../../ui/icon';

interface EditSheetProps {
  visible: boolean;
  onClose: () => void;
  /** null when sheet is closed; the active metric otherwise */
  metric: WeatherThresholdMetricConfig | null;
  metricLabel: string;
  warningLabel: string;
  severeLabel: string;
  /** Currently saved warning-tier threshold (null = unset) */
  warningCurrent: number | null;
  /** Currently saved severe-tier threshold (null = unset) */
  severeCurrent: number | null;
  /** True when at least one tier is currently set on the user account */
  hasAnyValue: boolean;
  invalidValueLabel: string;
  saveLabel: string;
  removeLabel: string;
  /** Persist both tiers in parallel. Implementations: setThreshold(code, value) ×2. */
  onSave: (warning: number, severe: number) => Promise<void>;
  /** Clear both tiers in parallel */
  onRemove: () => Promise<void>;
}

export function EditSheet({
  visible,
  onClose,
  metric,
  metricLabel,
  warningLabel,
  severeLabel,
  warningCurrent,
  severeCurrent,
  hasAnyValue,
  invalidValueLabel,
  saveLabel,
  removeLabel,
  onSave,
  onRemove,
}: EditSheetProps) {
  const { colors } = useAppTheme();
  const { t } = useTranslation();
  const [warningText, setWarningText] = useState('');
  const [severeText, setSevereText] = useState('');
  const [saving, setSaving] = useState(false);
  const [removing, setRemoving] = useState(false);

  // When the sheet opens (or the active metric changes), seed the inputs
  // from saved values, falling back to the metric's defaults so the user
  // never sees a blank editor.
  useEffect(() => {
    if (!visible || !metric) return;
    setWarningText(
      String(warningCurrent ?? metric.defaults.warning),
    );
    setSevereText(
      String(severeCurrent ?? metric.defaults.severe),
    );
  }, [visible, metric, warningCurrent, severeCurrent]);

  if (!metric) return null;

  const warningParsed = parseFloat(warningText.trim());
  const severeParsed = parseFloat(severeText.trim());
  const warningValid = !isNaN(warningParsed);
  const severeValid = !isNaN(severeParsed);
  const showWarningError = warningText.trim().length > 0 && !warningValid;
  const showSevereError = severeText.trim().length > 0 && !severeValid;
  const canSave = warningValid && severeValid && !saving && !removing;

  const handleSave = async () => {
    if (!canSave) return;
    setSaving(true);
    try {
      await onSave(warningParsed, severeParsed);
      onClose();
    } catch {
      // hook surfaces the toast — keep sheet open
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async () => {
    if (!hasAnyValue || saving || removing) return;
    setRemoving(true);
    try {
      await onRemove();
      onClose();
    } catch {
      // hook surfaces the toast
    } finally {
      setRemoving(false);
    }
  };

  const keyboardType = Platform.OS === 'ios' ? 'numbers-and-punctuation' : 'numeric';

  const headerLeft = (
    <View style={[styles.iconCircle, { backgroundColor: withOpacity(colors.primary, 0.094) }]}>
      <Icon icon={metric.icon} size={20} color={colors.primary} />
    </View>
  );

  const footer = (
    <View style={styles.footerRow}>
      {hasAnyValue && (
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
      title={metricLabel}
      headerLeft={headerLeft}
      footer={footer}
    >
      <View style={styles.bodyContent}>
        <TierSection
          label={warningLabel}
          description={t(`weatherThresholds.tier.${metric.metric}.warningDescription`)}
          unit={metric.unit}
          value={warningText}
          onChangeValue={setWarningText}
          accentColor={colors.primary}
          showError={showWarningError}
          errorLabel={invalidValueLabel}
          keyboardType={keyboardType}
          textColor={colors.text}
          mutedColor={colors.textMuted}
          surfaceColor={colors.surface}
          borderColor={colors.border}
          dangerColor={colors.danger}
        />
        <TierSection
          label={severeLabel}
          description={t(`weatherThresholds.tier.${metric.metric}.severeDescription`)}
          unit={metric.unit}
          value={severeText}
          onChangeValue={setSevereText}
          accentColor={sharedColors.danger}
          showError={showSevereError}
          errorLabel={invalidValueLabel}
          keyboardType={keyboardType}
          textColor={colors.text}
          mutedColor={colors.textMuted}
          surfaceColor={colors.surface}
          borderColor={colors.border}
          dangerColor={colors.danger}
        />
      </View>
    </FullScreenModal>
  );
}

interface TierSectionProps {
  label: string;
  description: string;
  unit: string;
  value: string;
  onChangeValue: (s: string) => void;
  accentColor: string;
  showError: boolean;
  errorLabel: string;
  keyboardType: 'numbers-and-punctuation' | 'numeric';
  textColor: string;
  mutedColor: string;
  surfaceColor: string;
  borderColor: string;
  dangerColor: string;
}

function TierSection({
  label,
  description,
  unit,
  value,
  onChangeValue,
  accentColor,
  showError,
  errorLabel,
  keyboardType,
  textColor,
  mutedColor,
  surfaceColor,
  borderColor,
  dangerColor,
}: TierSectionProps) {
  return (
    <View style={styles.tierSection}>
      <View style={styles.tierHeader}>
        <View style={[styles.tierDot, { backgroundColor: accentColor }]} />
        <Text style={[styles.tierLabel, { color: accentColor }]}>{label}</Text>
      </View>
      <Text style={[styles.tierDescription, { color: mutedColor }]}>{description}</Text>
      <View
        style={[
          styles.inputRow,
          {
            backgroundColor: surfaceColor,
            borderColor: showError ? dangerColor : borderColor,
          },
        ]}
      >
        <TextInput
          style={[styles.input, { color: textColor }]}
          value={value}
          onChangeText={onChangeValue}
          keyboardType={keyboardType}
          placeholder="0"
          placeholderTextColor={mutedColor}
        />
        <Text style={[styles.unitSuffix, { color: mutedColor }]}>{unit}</Text>
      </View>
      {showError && (
        <Text style={[styles.errorText, { color: dangerColor }]}>{errorLabel}</Text>
      )}
    </View>
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
    gap: theme.spacing['2xl'],
  },
  tierSection: {
    gap: theme.spacing.sm,
  },
  tierHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  tierDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  tierLabel: {
    fontSize: theme.fontSize.sm,
    ...theme.font.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tierDescription: {
    fontSize: theme.fontSize.sm,
    lineHeight: 20,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: theme.radius.lg,
    paddingHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.xs,
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
  errorText: {
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
