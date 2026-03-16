import { Bell } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';

import { shadows, theme } from '../../lib/theme';
import { Card } from '../ui/card';
import { Icon } from '../ui/icon';

interface MapStatusCardProps {
  alertCount: number;
}

export function MapStatusCard({ alertCount }: MapStatusCardProps) {
  const hasAlerts = alertCount > 0;

  return (
    <View style={styles.wrapper}>
      <Card style={styles.card}>
        <View style={styles.row}>
          {hasAlerts ? (
            <View style={styles.dot} />
          ) : (
            <Icon icon={Bell} size={18} color={theme.colors.textMuted} />
          )}
          <Text style={[styles.text, hasAlerts && styles.textActive]}>
            {hasAlerts
              ? `${alertCount} active incident${alertCount === 1 ? '' : 's'} nearby`
              : 'No active incidents in this area'}
          </Text>
        </View>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: theme.spacing['3xl'],
    left: theme.spacing.xl,
    right: theme.spacing.xl,
  },
  card: {
    ...shadows.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.danger,
  },
  text: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textMuted,
    ...theme.font.medium,
  },
  textActive: {
    color: theme.colors.text,
  },
});
