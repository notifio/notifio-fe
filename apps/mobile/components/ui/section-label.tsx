import { type StyleProp, StyleSheet, Text, type TextStyle } from 'react-native';

import { theme } from '../../lib/theme';

interface SectionLabelProps {
  label: string;
  style?: StyleProp<TextStyle>;
}

export function SectionLabel({ label, style }: SectionLabelProps) {
  return <Text style={[styles.label, style]}>{label}</Text>;
}

const styles = StyleSheet.create({
  label: {
    textTransform: 'uppercase',
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
    letterSpacing: 1,
    marginTop: theme.spacing['3xl'],
    marginBottom: theme.spacing.md,
    ...theme.font.semibold,
  },
});
