import { IconRefresh } from '@tabler/icons-react-native';
import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { useMembership, useUserEvents } from '@notifio/shared/hooks';

import { TierBadge } from '../../components/ui/tier-badge';
import { useAuth } from '../../hooks/use-auth';
import { useNotificationHistory } from '../../hooks/use-notification-history';
import { useProfile } from '../../hooks/use-profile';
import { useReminders } from '../../hooks/use-reminders';
import { formatDate } from '../../lib/format';
import { theme } from '../../lib/theme';
import { useAppTheme } from '../../providers/theme-provider';

export default function ProfileScreen() {
  const { colors } = useAppTheme();
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const { profile, isLoading, error, refetch } = useProfile();
  const { tier } = useMembership();

  // Stats row — three lifetime/active counts shown after the details
  // card. Each hook owns its own loading state; we display "—" while
  // pending so the row doesn't lie about a fresh account.
  const { total: notificationsTotal, isLoading: notificationsLoading } = useNotificationHistory();
  const { events, isLoading: eventsLoading } = useUserEvents();
  const { reminders, isLoading: remindersLoading } = useReminders();
  const eventsCount = events.length;
  const remindersActive = reminders.filter((r) => r.enabled).length;

  const displayName =
    user?.user_metadata?.full_name ??
    user?.user_metadata?.name ??
    profile?.email?.split('@')[0] ??
    '';
  const initial = displayName ? displayName.charAt(0).toUpperCase() : '?';

  return (
    <>
      <Stack.Screen options={{ title: t('settings.profile') }} />
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {isLoading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : error ? (
          <View style={styles.centered}>
            <Text style={[styles.errorText, { color: colors.danger }]}>{error}</Text>
            <Pressable onPress={refetch} style={[styles.retryButton, { backgroundColor: colors.surface }]}>
              <IconRefresh size={16} color={colors.primary} />
              <Text style={[styles.retryText, { color: colors.primary }]}>{t('common.retry')}</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.content}>
            {/* Avatar */}
            <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
              <Text style={styles.avatarText}>{initial}</Text>
            </View>

            {/* Name + email */}
            <Text style={[styles.name, { color: colors.text }]}>{displayName}</Text>
            {profile?.email && (
              <Text style={[styles.email, { color: colors.textMuted }]}>{profile.email}</Text>
            )}

            {/* Tier */}
            <View style={styles.tierRow}>
              <TierBadge tier={tier ?? 'FREE'} size="md" />
            </View>

            {/* Details card */}
            <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              {profile?.country && (
                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, { color: colors.textMuted }]}>{t('settings.profileCountry')}</Text>
                  <Text style={[styles.detailValue, { color: colors.text }]}>{profile.country.name}</Text>
                </View>
              )}
              {profile?.createdAt && (
                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, { color: colors.textMuted }]}>{t('settings.profileMemberSince')}</Text>
                  <Text style={[styles.detailValue, { color: colors.text }]}>{formatDate(profile.createdAt, i18n.language)}</Text>
                </View>
              )}
            </View>

            {/* Stats row */}
            <View style={[styles.statsRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <StatCell
                value={notificationsLoading ? '—' : notificationsTotal}
                label={t('profile.stats.notifications')}
              />
              <View style={[styles.statsDivider, { backgroundColor: colors.border }]} />
              <StatCell
                value={eventsLoading ? '—' : eventsCount}
                label={t('profile.stats.events')}
              />
              <View style={[styles.statsDivider, { backgroundColor: colors.border }]} />
              <StatCell
                value={remindersLoading ? '—' : remindersActive}
                label={t('profile.stats.reminders')}
              />
            </View>
          </View>
        )}
      </View>
    </>
  );
}

function StatCell({ value, label }: { value: number | string; label: string }) {
  const { colors } = useAppTheme();
  return (
    <View style={styles.statCell}>
      <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
      <Text
        style={[styles.statLabel, { color: colors.textMuted }]}
        numberOfLines={2}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.md,
  },
  errorText: {
    fontSize: theme.fontSize.md,
    textAlign: 'center',
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.lg,
  },
  retryText: {
    fontSize: theme.fontSize.sm,
    ...theme.font.medium,
  },
  content: {
    alignItems: 'center',
    paddingTop: theme.spacing['3xl'],
    paddingHorizontal: theme.spacing.xl,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 28,
    color: '#FFFFFF',
    ...theme.font.bold,
  },
  name: {
    marginTop: theme.spacing.lg,
    fontSize: theme.fontSize.xl,
    ...theme.font.bold,
  },
  email: {
    marginTop: theme.spacing.xs,
    fontSize: theme.fontSize.md,
  },
  tierRow: {
    marginTop: theme.spacing.md,
  },
  card: {
    marginTop: theme.spacing['2xl'],
    width: '100%',
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    padding: theme.spacing.lg,
    gap: theme.spacing.lg,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: theme.fontSize.sm,
  },
  detailValue: {
    fontSize: theme.fontSize.sm,
    ...theme.font.medium,
  },
  statsRow: {
    marginTop: theme.spacing.lg,
    width: '100%',
    flexDirection: 'row',
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    overflow: 'hidden',
  },
  statsDivider: {
    width: StyleSheet.hairlineWidth,
  },
  statCell: {
    flex: 1,
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.sm,
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: 24,
    ...theme.font.semibold,
  },
  statLabel: {
    fontSize: 11,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
