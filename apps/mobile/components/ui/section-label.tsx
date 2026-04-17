import { type StyleProp, StyleSheet, Text, type TextStyle } from 'react-native';

import { theme } from '../../lib/theme';
import { useAppTheme } from '../../providers/theme-provider';

interface SectionLabelProps {
  label: string;
  style?: StyleProp<TextStyle>;
}

export function SectionLabel({ label, style }: SectionLabelProps) {
  const { colors } = useAppTheme();

  return <Text style={[styles.label, { color: colors.textMuted }, style]}>{label}</Text>;
}

const styles = StyleSheet.create({
  label: {
    textTransform: 'uppercase',
    fontSize: theme.fontSize.xs,
    letterSpacing: 1,
    marginTop: theme.spacing['3xl'],
    marginBottom: theme.spacing.md,
    ...theme.font.semibold,
  },
});
