import { type StyleProp, StyleSheet, Switch, Text, View, type ViewStyle } from 'react-native';

import { Icon, type TablerIcon } from './icon';
import { theme } from '../../lib/theme';

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
  return (
    <View style={[styles.container, style]}>
      {icon && iconBgColor && (
        <View style={[styles.iconContainer, { backgroundColor: iconBgColor }]}>
          <Icon icon={icon} size={18} color={iconColor} />
        </View>
      )}
      <View style={styles.textContainer}>
        <Text style={styles.label}>{label}</Text>
        {description && <Text style={styles.description}>{description}</Text>}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
        thumbColor={theme.colors.background}
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
    color: theme.colors.text,
    ...theme.font.medium,
  },
  description: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textMuted,
    marginTop: theme.spacing.xs,
  },
});
