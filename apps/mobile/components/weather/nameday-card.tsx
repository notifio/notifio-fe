import { IconCake } from '@tabler/icons-react-native';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';

import type { NamedayResponse } from '@notifio/api-client';

import { theme } from '../../lib/theme';
import { useAppTheme } from '../../providers/theme-provider';

interface NamedayCardProps {
  nameday: NamedayResponse | null;
  isLoading: boolean;
}

export function NamedayCard({ nameday, isLoading }: NamedayCardProps) {
  const { colors } = useAppTheme();
  const { t } = useTranslation();

  if (isLoading || !nameday) return null;

  const todayNames = nameday.today.names;
  const upcoming = nameday.upcoming;
  const firstUpcoming = upcoming?.[0];
  const tomorrowNames = firstUpcoming ? firstUpcoming.names : null;

  if (todayNames.length === 0) return null;

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.header}>
        <IconCake size={18} color={colors.primary} />
        <Text style={[styles.todayLabel, { color: colors.textSecondary }]}>
          {t('nameday.today')}:
        </Text>
        <Text style={[styles.names, { color: colors.text }]} numberOfLines={1}>
          {todayNames.join(', ')}
        </Text>
      </View>
      {tomorrowNames && tomorrowNames.length > 0 && (
        <View style={styles.tomorrowRow}>
          <Text style={[styles.tomorrowLabel, { color: colors.textMuted }]}>
            {t('nameday.tomorrow')}:
          </Text>
          <Text style={[styles.tomorrowNames, { color: colors.textMuted }]} numberOfLines={1}>
            {tomorrowNames.join(', ')}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  todayLabel: {
    fontSize: theme.fontSize.sm,
    ...theme.font.medium,
  },
  names: {
    flex: 1,
    fontSize: theme.fontSize.sm,
    ...theme.font.semibold,
  },
  tomorrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.xs,
    marginLeft: 26, // icon size (18) + gap (8)
    gap: theme.spacing.xs,
  },
  tomorrowLabel: {
    fontSize: theme.fontSize.xs,
  },
  tomorrowNames: {
    flex: 1,
    fontSize: theme.fontSize.xs,
  },
});
