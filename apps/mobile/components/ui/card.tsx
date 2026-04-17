import { Pressable, type StyleProp, StyleSheet, View, type ViewStyle } from 'react-native';

import { shadows, theme } from '../../lib/theme';
import { useAppTheme } from '../../providers/theme-provider';

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
}

export function Card({ children, style, onPress }: CardProps) {
  const { colors } = useAppTheme();

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [styles.card, { backgroundColor: colors.background, borderColor: colors.border }, pressed && styles.pressed, style]}
      >
        {children}
      </Pressable>
    );
  }

  return <View style={[styles.card, { backgroundColor: colors.background, borderColor: colors.border }, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    padding: theme.spacing.lg,
    ...shadows.sm,
  },
  pressed: {
    opacity: 0.7,
  },
});
