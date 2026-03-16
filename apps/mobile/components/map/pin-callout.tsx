import { StyleSheet, Text, View } from 'react-native';

import { formatTimeAgo } from '@notifio/shared/weather';

import { MAP_PIN_STYLES } from '../../lib/map-pin-config';
import type { MapPin } from '../../lib/normalize-pins';
import { theme } from '../../lib/theme';

interface PinCalloutProps {
  pin: MapPin;
}

export function PinCallout({ pin }: PinCalloutProps) {
  const style = MAP_PIN_STYLES[pin.source];
  const isScheduled = pin.status === 'scheduled';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={[styles.dot, { backgroundColor: style.color }]} />
        <Text style={styles.title} numberOfLines={2}>
          {pin.title}
        </Text>
      </View>

      <Text style={styles.description} numberOfLines={2}>
        {pin.description}
      </Text>

      <View style={styles.footer}>
        <View style={styles.footerLeft}>
          {pin.locality ? <Text style={styles.meta}>{pin.locality}</Text> : null}
          <Text style={styles.meta}>{formatTimeAgo(pin.timestamp)}</Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            isScheduled ? styles.statusScheduled : styles.statusActive,
          ]}
        >
          <Text
            style={[
              styles.statusText,
              isScheduled ? styles.statusTextScheduled : styles.statusTextActive,
            ]}
          >
            {isScheduled ? 'Scheduled' : 'Active'}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 250,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background,
    borderRadius: theme.radius.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: theme.radius.full,
  },
  title: {
    flex: 1,
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
    ...theme.font.medium,
  },
  description: {
    marginTop: theme.spacing.xs,
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
  },
  footer: {
    marginTop: theme.spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  footerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  meta: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
  },
  statusBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.radius.full,
  },
  statusScheduled: {
    backgroundColor: '#EFF6FF',
  },
  statusActive: {
    backgroundColor: '#FEF2F2',
  },
  statusText: {
    fontSize: 10,
    ...theme.font.medium,
  },
  statusTextScheduled: {
    color: '#2563EB',
  },
  statusTextActive: {
    color: '#DC2626',
  },
});
