import { StyleSheet, Text, View } from 'react-native';

import { Icon, type TablerIcon } from './icon';
import { theme } from '../../lib/theme';
import { useAppTheme } from '../../providers/theme-provider';

interface PlaceholderCardProps {
  icon: TablerIcon;
  title: string;
  subtitle: string;
}

export function PlaceholderCard({ icon, title, subtitle }: PlaceholderCardProps) {
  const { colors } = useAppTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <Icon icon={icon} size={24} color={colors.textMuted} />
      <View style={styles.text}>
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>{subtitle}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    borderRadius: theme.radius.xl,
    padding: theme.spacing.xl,
  },
  text: {
    flex: 1,
  },
  title: {
    fontSize: theme.fontSize.md,
    ...theme.font.medium,
  },
  subtitle: {
    fontSize: theme.fontSize.sm,
    marginTop: theme.spacing.xs,
  },
});
