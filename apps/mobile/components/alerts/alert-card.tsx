import { StyleSheet, Text, View } from 'react-native';

import { ALERT_TYPE_CONFIG } from '../../lib/alert-config';
import { formatRelativeTime } from '../../lib/format';
import type { AlertSummary } from '../../lib/mock-data';
import { theme } from '../../lib/theme';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';
import { Icon } from '../ui/icon';

interface AlertCardProps {
  alert: AlertSummary;
  onPress?: () => void;
}

export function AlertCard({ alert, onPress }: AlertCardProps) {
  const config = ALERT_TYPE_CONFIG[alert.type];

  return (
    <Card onPress={onPress}>
      <View style={styles.topRow}>
        <View style={[styles.iconContainer, { backgroundColor: config.bgColor }]}>
          <Icon icon={config.icon} size={18} color={config.color} />
        </View>
        <Text style={styles.title} numberOfLines={2}>{alert.title}</Text>
        <Badge variant={alert.severity} label={alert.severity} />
      </View>
      <View style={styles.bottomRow}>
        <Text style={styles.meta}>{alert.source}</Text>
        <Text style={styles.metaDot}>·</Text>
        <Text style={styles.meta}>{formatRelativeTime(alert.startsAt)}</Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: theme.radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    flex: 1,
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    ...theme.font.semibold,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.md,
    paddingLeft: theme.spacing['4xl'],
  },
  meta: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textMuted,
  },
  metaDot: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textMuted,
    marginHorizontal: theme.spacing.xs,
  },
});
