import { type StyleProp, StyleSheet, Text, View, type ViewStyle } from 'react-native';

import { theme } from '../../lib/theme';
import { useAppTheme } from '../../providers/theme-provider';

type BadgeVariant = 'info' | 'warning' | 'critical';

interface BadgeProps {
  variant: BadgeVariant;
  label: string;
  style?: StyleProp<ViewStyle>;
}

export function Badge({ variant, label, style }: BadgeProps) {
  const { colors } = useAppTheme();
  const severity = colors.severity[variant];

  return (
    <View style={[styles.container, { backgroundColor: severity.bg, borderColor: severity.border }, style]}>
      <Text style={[styles.label, { color: severity.text }]}>{label}</Text>
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
