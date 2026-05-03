import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';

/**
 * Event lifecycle status. Currently surfaced on map pins (where
 * `resolved` is filtered out before render — see normalize-pins) and
 * on event-detail pages (future, once shared EventDetail schema gains
 * the field — refactor doc item 14). The `resolved` branch in this
 * component is reachable today only via the future event-detail
 * surface; map pins will only ever pass `active` or `upcoming`.
 */
export type EventStatus = 'active' | 'upcoming' | 'resolved';

const STATUS_STYLES: Record<EventStatus, { bg: string; color: string }> = {
  active:   { bg: 'rgba(255,122,47,0.12)', color: '#FF7A2F' },
  upcoming: { bg: 'rgba(58,134,255,0.12)',  color: '#3A86FF' },
  resolved: { bg: 'rgba(139,155,181,0.10)', color: '#8B9BB5' },
};

interface EventStatusBadgeProps {
  status: EventStatus;
}

export function EventStatusBadge({ status }: EventStatusBadgeProps) {
  const { t } = useTranslation();
  const style = STATUS_STYLES[status];
  return (
    <View style={[styles.badge, { backgroundColor: style.bg }]}>
      <Text style={[styles.text, { color: style.color }]}>
        {t(`event.status.${status}`)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 999,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 11,
    fontWeight: '500',
  },
});
