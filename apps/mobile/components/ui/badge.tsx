import { type StyleProp, StyleSheet, Text, View, type ViewStyle } from 'react-native';

import { theme } from '../../lib/theme';

type BadgeVariant = 'info' | 'warning' | 'critical';

interface BadgeProps {
  variant: BadgeVariant;
  label: string;
  style?: StyleProp<ViewStyle>;
}

export function Badge({ variant, label, style }: BadgeProps) {
  const colors = theme.colors.severity[variant];

  return (
    <View style={[styles.container, { backgroundColor: colors.bg, borderColor: colors.border }, style]}>
      <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: theme.radius.full,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderWidth: 1,
  },
  label: {
    fontSize: theme.fontSize.xs,
    ...theme.font.semibold,
  },
});
