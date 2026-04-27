import { Pressable, type StyleProp, StyleSheet, Text, View, type ViewStyle } from 'react-native';

import { Icon, type TablerIcon } from './icon';
import { theme } from '../../lib/theme';
import { useAppTheme } from '../../providers/theme-provider';

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  rightAction?: { icon: TablerIcon; onPress: () => void };
  style?: StyleProp<ViewStyle>;
}

export function ScreenHeader({ title, subtitle, rightAction, style }: ScreenHeaderProps) {
  const { colors } = useAppTheme();

  return (
    <View style={[styles.container, style]}>
      <View style={styles.textContainer}>
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
        {subtitle && <Text style={[styles.subtitle, { color: colors.textMuted }]}>{subtitle}</Text>}
      </View>
      {rightAction && (
        <Pressable onPress={rightAction.onPress} hitSlop={theme.spacing.sm}>
          <Icon icon={rightAction.icon} color={colors.text} />
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
    ...theme.font.bold,
  },
  subtitle: {
    fontSize: theme.fontSize.sm,
    marginTop: theme.spacing.xs,
  },
});
