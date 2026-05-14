import { IconChevronRight } from '@tabler/icons-react-native';
import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { EventFeedItem } from '@notifio/api-client';
import { eventToCard } from '@notifio/shared/alert-card';

import { useAppTheme } from '../../providers/theme-provider';
import { AlertCard } from '../alerts/alert-card';

interface AlertsPreviewProps {
  events: EventFeedItem[];
}

const ORANGE = '#FF7A2F';

export function AlertsPreview({ events }: AlertsPreviewProps) {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const router = useRouter();

  const active = useMemo(
    () => events.filter((e) => e.status === 'active'),
    [events],
  );

  const top3 = useMemo(() => {
    return [...active]
      .sort((a, b) => {
        if (a.materialityLevel !== b.materialityLevel) {
          return b.materialityLevel - a.materialityLevel;
        }
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      })
      .slice(0, 3);
  }, [active]);

  if (top3.length === 0) return null;

  return (
    <View>
      <View style={styles.header}>
        <Text style={[styles.label, { color: colors.textMuted }]}>
          {t('overview.activeNearby')} · {active.length}
        </Text>
        <Pressable onPress={() => router.push('/alerts')} style={styles.linkRow}>
          <Text style={[styles.link, { color: ORANGE }]}>
            {t('overview.showAll')}
          </Text>
          <IconChevronRight size={11} color={ORANGE} />
        </Pressable>
      </View>
      <View style={styles.stack}>
        {top3.map((event) => (
          <AlertCard
            key={event.eventId}
            item={eventToCard(event)}
            onPress={() => router.push(`/events/${event.eventId}`)}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 2,
    paddingBottom: 6,
  },
  label: {
    fontSize: 10,
    fontWeight: '500',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  link: { fontSize: 11, fontWeight: '500' },
  stack: { gap: 8 },
});
