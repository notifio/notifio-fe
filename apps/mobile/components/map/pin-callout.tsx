import { IconChevronRight } from '@tabler/icons-react-native';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';

import { formatRelativeTime, type RelativeTimeLocale } from '@notifio/shared/format';
import type { MapPin } from '@notifio/shared/map';

import { MAP_PIN_STYLES } from '../../lib/map-pin-config';
import { theme } from '../../lib/theme';
import { useAppTheme } from '../../providers/theme-provider';
import { EventStatusBadge } from '../ui/event-status-badge';

interface PinCalloutProps {
  pin: MapPin;
}

export function PinCallout({ pin }: PinCalloutProps) {
  const { colors } = useAppTheme();
  const { t, i18n } = useTranslation();
  const locale = i18n.language as RelativeTimeLocale;
  const style = MAP_PIN_STYLES[pin.source];
  // Post-M2: TomTom incidents now flow through `/events` with proper
  // UUIDs, so traffic pins navigate to /events/{id} like every other
  // category. Teasers never render this callout — map.tsx skips
  // <Callout> entirely when pin.isTeaser.
  const showViewDetails = !!pin.id;

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
          {pin.locality ? (
            <Text style={[styles.meta, { color: colors.textMuted }]}>{pin.locality}</Text>
          ) : null}
          <Text style={[styles.meta, { color: colors.textMuted }]}>
            {formatRelativeTime(pin.timestamp, locale)}
          </Text>
        </View>
        <EventStatusBadge status={pin.status} />
      </View>

      {showViewDetails && (
        <View style={[styles.cta, { borderTopColor: colors.border }]}>
          <Text style={[styles.ctaLabel, { color: colors.primary }]}>{t('map.viewDetails')}</Text>
          <IconChevronRight size={14} color={colors.primary} />
        </View>
      )}
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
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginTop: theme.spacing.sm,
    paddingTop: theme.spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  ctaLabel: {
    fontSize: theme.fontSize.xs,
    ...theme.font.semibold,
  },
});
