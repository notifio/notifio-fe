import { Pressable, StyleSheet, Text } from 'react-native';

import { theme } from '../../lib/theme';
import { useAppTheme } from '../../providers/theme-provider';

interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'ghost';
  disabled?: boolean;
}

export function PrimaryButton({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
}: PrimaryButtonProps) {
  const { colors } = useAppTheme();
  const isPrimary = variant === 'primary';

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        isPrimary ? { backgroundColor: colors.primary } : styles.ghost,
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
      ]}
    >
      <Text style={[styles.text, { color: isPrimary ? colors.textInverse : colors.textMuted }]}>
        {title}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    width: '100%',
    alignItems: 'center',
    borderRadius: theme.radius.xl,
    paddingVertical: theme.spacing.lg,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  disabled: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.7,
  },
  text: {
    fontSize: theme.fontSize.md,
    ...theme.font.semibold,
  },
});
