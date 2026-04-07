import { StyleSheet, Text, View } from 'react-native';

import type { AlertCategory, NotificationHistoryItem } from '@notifio/api-client';
import { CATEGORY_DISPLAY_NAMES } from '@notifio/shared/constants';

import { formatRelativeTime } from '../../lib/format';
import { theme } from '../../lib/theme';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';

interface AlertCardProps {
  notification: NotificationHistoryItem;
  onPress?: () => void;
}

const SEVERITY_VARIANT: Record<string, 'info' | 'warning' | 'critical'> = {
  info: 'info',
  warning: 'warning',
  critical: 'critical',
};

export function AlertCard({ notification, onPress }: AlertCardProps) {
  const categoryNames = CATEGORY_DISPLAY_NAMES[notification.category as AlertCategory];
  const categoryLabel = categoryNames?.en ?? notification.category;
  const severityVariant = SEVERITY_VARIANT[notification.severity] ?? 'info';

  return (
    <Card onPress={onPress}>
      <View style={styles.topRow}>
        <View style={styles.textContainer}>
          <Text style={styles.title} numberOfLines={2}>{notification.title}</Text>
          {notification.body ? (
            <Text style={styles.body} numberOfLines={2}>{notification.body}</Text>
          ) : null}
        </View>
        <Badge variant={severityVariant} label={notification.severity} />
      </View>
      <View style={styles.bottomRow}>
        <Text style={styles.meta}>{categoryLabel}</Text>
        <Text style={styles.metaDot}>·</Text>
        <Text style={styles.meta}>{formatRelativeTime(notification.createdAt)}</Text>
        {notification.status !== 'sent' && (
          <>
            <Text style={styles.metaDot}>·</Text>
            <Text style={styles.metaStatus}>{notification.status}</Text>
          </>
        )}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.md,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    ...theme.font.semibold,
  },
  body: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.md,
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
  metaStatus: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.severity.warning.text,
  },
});
