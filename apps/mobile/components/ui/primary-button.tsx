import { Pressable, StyleSheet, Text } from 'react-native';

import { theme } from '../../lib/theme';

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
  const isPrimary = variant === 'primary';

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        isPrimary ? styles.primary : styles.ghost,
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
      ]}
    >
      <Text style={[styles.text, isPrimary ? styles.textPrimary : styles.textGhost]}>
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
  primary: {
    backgroundColor: theme.colors.primary,
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
  textPrimary: {
    color: theme.colors.textInverse,
  },
  textGhost: {
    color: theme.colors.textMuted,
  },
});
