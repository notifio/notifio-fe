import { IconChevronRight } from '@tabler/icons-react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { getPinStyle } from '../../lib/map-pin-config';
import type { MapPin } from '../../lib/normalize-pins';
import { theme, withOpacity } from '../../lib/theme';
import { useAppTheme } from '../../providers/theme-provider';
import { BottomSheet } from '../ui/bottom-sheet';

interface ClusterEventsSheetProps {
  visible: boolean;
  events: MapPin[];
  onClose: () => void;
}

/**
 * Bottom sheet listing every event in a tapped cluster. Solves the
 * identical-coord stack problem (multiple events at the same lat/lng
 * are otherwise unreachable — only the top pin opens its callout).
 *
 * Tap row → close sheet → /events/{eventId}. Teasers are filtered
 * upstream so this sheet only ever sees real events with valid IDs.
 */
export function ClusterEventsSheet({ visible, events, onClose }: ClusterEventsSheetProps) {
  const { t } = useTranslation();
  const { colors, isDark } = useAppTheme();

  const subtitleColor = isDark ? 'rgba(255,255,255,0.55)' : 'rgba(14,34,63,0.55)';
  const chevronColor = isDark ? 'rgba(255,255,255,0.3)' : 'rgba(14,34,63,0.3)';

  // All children at the exact same coord = "at this location";
  // mixed coords (rare with our radius) = "nearby".
  const first = events[0];
  const sameCoord =
    !!first && events.every((e) => e.lat === first.lat && e.lng === first.lng);

  const headerKey = sameCoord
    ? 'mapCluster.eventsAtLocation'
    : 'mapCluster.eventsNearby';

  const handleEventTap = (eventId: string) => {
    onClose();
    router.push(`/events/${eventId}`);
  };

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title={t(headerKey, { count: events.length })}
      maxHeight="75%"
      minHeight="40%"
      scrollable
    >
      {events.map((event) => {
        const style = getPinStyle(event);
        const Icon = style.icon;
        const subtitle = event.locality || event.description;

        return (
          <TouchableOpacity
            key={event.id}
            style={styles.row}
            onPress={() => handleEventTap(event.id)}
            activeOpacity={0.7}
          >
            <View style={[styles.iconWrap, { backgroundColor: withOpacity(style.color, 0.16) }]}>
              <Icon size={18} color={style.color} strokeWidth={2.2} />
            </View>
            <View style={styles.rowText}>
              <Text style={[styles.rowTitle, { color: colors.text }]} numberOfLines={1}>
                {event.title || t('mapCluster.untitledEvent')}
              </Text>
              {!!subtitle && (
                <Text
                  style={[styles.rowSubtitle, { color: subtitleColor }]}
                  numberOfLines={1}
                >
                  {subtitle}
                </Text>
              )}
            </View>
            <IconChevronRight size={16} color={chevronColor} />
          </TouchableOpacity>
        );
      })}
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowText: {
    flex: 1,
    minWidth: 0,
  },
  rowTitle: {
    fontSize: theme.fontSize.sm,
    ...theme.font.medium,
  },
  rowSubtitle: {
    fontSize: theme.fontSize.xs,
    marginTop: 2,
  },
});
