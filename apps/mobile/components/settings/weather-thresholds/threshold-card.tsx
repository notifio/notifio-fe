import { IconChevronRight } from '@tabler/icons-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { formatThresholdValue } from './codes';
import { theme, withOpacity } from '../../../lib/theme';
import { useAppTheme } from '../../../providers/theme-provider';
import type { TablerIcon } from '../../ui/icon';
import { Icon } from '../../ui/icon';

interface ThresholdCardProps {
  icon: TablerIcon;
  label: string;
  unit: string;
  warningValue: number | null;
  severeValue: number | null;
  warningLabel: string;
  severeLabel: string;
  notSetLabel: string;
  onPress: () => void;
}

export function ThresholdCard({
  icon,
  label,
  unit,
  warningValue,
  severeValue,
  warningLabel,
  severeLabel,
  notSetLabel,
  onPress,
}: ThresholdCardProps) {
  const { colors } = useAppTheme();
  const hasWarning = warningValue !== null && warningValue !== undefined;
  const hasSevere = severeValue !== null && severeValue !== undefined;
  const isSet = hasWarning || hasSevere;

  const statusParts: string[] = [];
  if (hasWarning) statusParts.push(`${warningLabel} ${formatThresholdValue(warningValue, unit)}`);
  if (hasSevere) statusParts.push(`${severeLabel} ${formatThresholdValue(severeValue, unit)}`);
  const statusText = statusParts.join(' · ');

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        { backgroundColor: colors.surface, borderColor: colors.border },
        pressed && styles.pressed,
      ]}
    >
      <View style={[styles.iconCircle, { backgroundColor: withOpacity(colors.primary, 0.094) }]}>
        <Icon icon={icon} size={20} color={colors.primary} />
      </View>
      <View style={styles.textCol}>
        <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
        {isSet ? (
          <Text
            style={[styles.value, { color: colors.textSecondary }]}
            numberOfLines={1}
          >
            {statusText}
          </Text>
        ) : (
          <Text style={[styles.notSet, { color: colors.textMuted }]}>{notSetLabel}</Text>
        )}
      </View>
      <IconChevronRight size={18} color={colors.textMuted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    padding: theme.spacing.lg,
    borderRadius: theme.radius.xl,
    borderWidth: 1,
  },
  pressed: {
    opacity: 0.7,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: theme.radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textCol: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  label: {
    fontSize: theme.fontSize.md,
    ...theme.font.semibold,
  },
  value: {
    fontSize: theme.fontSize.sm,
  },
  notSet: {
    fontSize: theme.fontSize.sm,
    fontStyle: 'italic',
  },
});
