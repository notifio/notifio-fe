import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { theme } from '../../lib/theme';
import { useAppTheme } from '../../providers/theme-provider';

interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'ghost';
  disabled?: boolean;
  loading?: boolean;
}

export function PrimaryButton({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
}: PrimaryButtonProps) {
  const { colors } = useAppTheme();
  const isPrimary = variant === 'primary';
  const isInactive = disabled || loading;
  const fg = isPrimary ? colors.textInverse : colors.textMuted;

  return (
    <Pressable
      onPress={onPress}
      disabled={isInactive}
      style={({ pressed }) => [
        styles.base,
        isPrimary ? { backgroundColor: colors.primary } : styles.ghost,
        isInactive && styles.disabled,
        pressed && !isInactive && styles.pressed,
      ]}
    >
      <View style={styles.row}>
        {loading && (
          <ActivityIndicator size="small" color={fg} style={styles.spinner} />
        )}
        <Text style={[styles.text, { color: fg }]}>{title}</Text>
      </View>
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  spinner: {
    marginRight: theme.spacing.sm,
  },
});
