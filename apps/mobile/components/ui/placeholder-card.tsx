import { StyleSheet, Text, View } from 'react-native';

import { Icon, type TablerIcon } from './icon';
import { theme } from '../../lib/theme';

interface PlaceholderCardProps {
  icon: TablerIcon;
  title: string;
  subtitle: string;
}

export function PlaceholderCard({ icon, title, subtitle }: PlaceholderCardProps) {
  return (
    <View style={styles.container}>
      <Icon icon={icon} size={24} color={theme.colors.textMuted} />
      <View style={styles.text}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    padding: theme.spacing.xl,
  },
  text: {
    flex: 1,
  },
  title: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    ...theme.font.medium,
  },
  subtitle: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textMuted,
    marginTop: theme.spacing.xs,
  },
});
