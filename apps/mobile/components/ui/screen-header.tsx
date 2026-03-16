import type { LucideIcon } from 'lucide-react-native';
import { Pressable, type StyleProp, StyleSheet, Text, View, type ViewStyle } from 'react-native';

import { Icon } from './icon';
import { theme } from '../../lib/theme';

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  rightAction?: { icon: LucideIcon; onPress: () => void };
  style?: StyleProp<ViewStyle>;
}

export function ScreenHeader({ title, subtitle, rightAction, style }: ScreenHeaderProps) {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.textContainer}>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
      {rightAction && (
        <Pressable onPress={rightAction.onPress} hitSlop={theme.spacing.sm}>
          <Icon icon={rightAction.icon} color={theme.colors.text} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.lg,
    paddingHorizontal: theme.spacing.xl,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: theme.fontSize['2xl'],
    color: theme.colors.text,
    ...theme.font.bold,
  },
  subtitle: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textMuted,
    marginTop: theme.spacing.xs,
  },
});
