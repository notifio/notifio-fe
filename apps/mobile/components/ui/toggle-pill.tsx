import { Pressable, StyleSheet, Text } from 'react-native';

import { theme } from '../../lib/theme';
import { useAppTheme } from '../../providers/theme-provider';

interface TogglePillProps {
  active: boolean;
  label: string;
  onPress: () => void;
}

/**
 * Filled-toggle pill. Active = primary fill + inverse text; inactive =
 * transparent ghost with muted text and a 1px themed border. Caller
 * handles selection state and layout (row, scroll, wrap).
 */
export function TogglePill({ active, label, onPress }: TogglePillProps) {
  const { colors } = useAppTheme();

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.pill,
        active
          ? { backgroundColor: colors.primary, borderWidth: 0 }
          : { backgroundColor: 'transparent', borderColor: colors.border, borderWidth: 1 },
      ]}
    >
      <Text
        numberOfLines={1}
        style={[
          styles.label,
          { color: active ? colors.textInverse : colors.textMuted },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pill: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radius.full,
  },
  label: {
    fontSize: theme.fontSize.xs,
    ...theme.font.medium,
  },
});
