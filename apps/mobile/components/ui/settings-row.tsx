import { IconChevronRight } from '@tabler/icons-react-native';
import { Pressable, StyleSheet, Text } from 'react-native';

import type { TablerIcon } from './icon';
import { Icon } from './icon';
import { TierBadge } from './tier-badge';
import { theme } from '../../lib/theme';
import { useAppTheme } from '../../providers/theme-provider';

interface SettingsRowProps {
  icon: TablerIcon;
  label: string;
  onPress: () => void;
  badge?: 'PLUS' | 'PRO';
  danger?: boolean;
  value?: string;
  disabled?: boolean;
}

export function SettingsRow({
  icon,
  label,
  onPress,
  badge,
  danger,
  value,
  disabled,
}: SettingsRowProps) {
  const { colors } = useAppTheme();

  const labelColor = danger ? colors.danger : disabled ? colors.textMuted : colors.text;
  const iconColor = danger ? colors.danger : disabled ? colors.textMuted : colors.textSecondary;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [styles.container, pressed && !disabled && styles.pressed]}
    >
      <Icon icon={icon} size={20} color={iconColor} />
      <Text style={[styles.label, { color: labelColor }]}>{label}</Text>
      {badge && <TierBadge tier={badge} />}
      {value && <Text style={[styles.value, { color: colors.textMuted }]}>{value}</Text>}
      {!danger && <IconChevronRight size={18} color={colors.textMuted} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    paddingVertical: theme.spacing.md,
  },
  pressed: {
    opacity: 0.7,
  },
  label: {
    flex: 1,
    fontSize: theme.fontSize.md,
    ...theme.font.medium,
  },
  value: {
    fontSize: theme.fontSize.sm,
  },
});
