import { StyleSheet, Text, View, type ViewStyle } from 'react-native';

import { Icon, type TablerIcon } from './icon';
import { SPACING } from '../../lib/spacing';
import { theme } from '../../lib/theme';
import { useAppTheme } from '../../providers/theme-provider';

type Variant = 'default' | 'compact';

interface EmptyStateProps {
  icon: TablerIcon;
  title?: string;
  message: string;
  variant?: Variant;
  style?: ViewStyle;
}

export function EmptyState({
  icon,
  title,
  message,
  variant = 'default',
  style,
}: EmptyStateProps) {
  const { colors } = useAppTheme();

  if (variant === 'compact') {
    return (
      <View style={[styles.compactContainer, style]}>
        <Icon icon={icon} size={16} color={colors.textMuted} />
        <Text style={[styles.compactText, { color: colors.textMuted }]}>{message}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <Icon icon={icon} size={48} color={colors.textMuted} />
      {title && (
        <Text style={[styles.title, { color: colors.textMuted }]}>{title}</Text>
      )}
      <Text style={[styles.message, { color: colors.textMuted }]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.md,
  },
  title: {
    fontSize: theme.fontSize.md,
    ...theme.font.medium,
  },
  message: {
    fontSize: theme.fontSize.sm,
    textAlign: 'center',
  },
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.emptyStateIconToText,
    paddingVertical: theme.spacing.md,
  },
  compactText: {
    fontSize: theme.fontSize.sm,
  },
});
