import { type StyleProp, StyleSheet, Switch, Text, View, type ViewStyle } from 'react-native';

import { Icon, type TablerIcon } from './icon';
import { theme } from '../../lib/theme';
import { useAppTheme } from '../../providers/theme-provider';

interface ToggleRowProps {
  icon?: TablerIcon;
  iconColor?: string;
  iconBgColor?: string;
  label: string;
  description?: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  style?: StyleProp<ViewStyle>;
}

export function ToggleRow({
  icon,
  iconColor,
  iconBgColor,
  label,
  description,
  value,
  onValueChange,
  style,
}: ToggleRowProps) {
  const { colors } = useAppTheme();

  return (
    <View style={[styles.container, style]}>
      {icon && iconBgColor && (
        <View style={[styles.iconContainer, { backgroundColor: iconBgColor }]}>
          <Icon icon={icon} size={18} color={iconColor} />
        </View>
      )}
      <View style={styles.textContainer}>
        <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
        {description && <Text style={[styles.description, { color: colors.textMuted }]}>{description}</Text>}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: colors.border, true: colors.primary }}
        thumbColor={colors.background}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  label: {
    fontSize: theme.fontSize.md,
    ...theme.font.medium,
  },
  description: {
    fontSize: theme.fontSize.sm,
    marginTop: theme.spacing.xs,
  },
});
