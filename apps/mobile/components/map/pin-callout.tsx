import { StyleSheet, Text, View } from 'react-native';

import { formatTimeAgo } from '@notifio/shared/weather';

import { MAP_PIN_STYLES } from '../../lib/map-pin-config';
import type { MapPin } from '../../lib/normalize-pins';
import { theme } from '../../lib/theme';
import { useAppTheme } from '../../providers/theme-provider';

interface PinCalloutProps {
  pin: MapPin;
}

export function PinCallout({ pin }: PinCalloutProps) {
  const { colors } = useAppTheme();
  const style = MAP_PIN_STYLES[pin.source];
  const isScheduled = pin.status === 'scheduled';

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <View style={[styles.dot, { backgroundColor: style.color }]} />
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>
          {pin.title}
        </Text>
      </View>

      <Text style={[styles.description, { color: colors.textMuted }]} numberOfLines={2}>
        {pin.description}
      </Text>

      <View style={styles.footer}>
        <View style={styles.footerLeft}>
          {pin.locality ? <Text style={[styles.meta, { color: colors.textMuted }]}>{pin.locality}</Text> : null}
          <Text style={[styles.meta, { color: colors.textMuted }]}>{formatTimeAgo(pin.timestamp)}</Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            isScheduled
              ? { backgroundColor: colors.severity.info.bg }
              : { backgroundColor: colors.severity.critical.bg },
          ]}
        >
          <Text
            style={[
              styles.statusText,
              { color: isScheduled ? colors.severity.info.text : colors.severity.critical.text },
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
    ...theme.font.medium,
  },
  description: {
    marginTop: theme.spacing.xs,
    fontSize: theme.fontSize.xs,
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
  },
  statusBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.radius.full,
  },
  statusText: {
    fontSize: 10,
    ...theme.font.medium,
  },
});
