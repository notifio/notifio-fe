import { IconRefresh } from '@tabler/icons-react-native';
import { Stack } from 'expo-router';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { TierBadge } from '../../components/ui/tier-badge';
import { useAuth } from '../../hooks/use-auth';
import { useMembership } from '../../hooks/use-membership';
import { useProfile } from '../../hooks/use-profile';
import { theme } from '../../lib/theme';
import { useAppTheme } from '../../providers/theme-provider';

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return iso;
  }
}

export default function ProfileScreen() {
  const { colors } = useAppTheme();
  const { user } = useAuth();
  const { profile, isLoading, error, refetch } = useProfile();
  const { tier } = useMembership();

  const displayName =
    user?.user_metadata?.full_name ??
    user?.user_metadata?.name ??
    profile?.email?.split('@')[0] ??
    '';
  const initial = displayName ? displayName.charAt(0).toUpperCase() : '?';

  return (
    <>
      <Stack.Screen options={{ title: 'Profile' }} />
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
              <Text style={[styles.retryText, { color: colors.primary }]}>Retry</Text>
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
              <TierBadge tier={tier} size="md" />
            </View>

            {/* Details card */}
            <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              {profile?.country && (
                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, { color: colors.textMuted }]}>Country</Text>
                  <Text style={[styles.detailValue, { color: colors.text }]}>{profile.country.name}</Text>
                </View>
              )}
              {profile?.createdAt && (
                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, { color: colors.textMuted }]}>Member since</Text>
                  <Text style={[styles.detailValue, { color: colors.text }]}>{formatDate(profile.createdAt)}</Text>
                </View>
              )}
            </View>
          </View>
        )}
      </View>
    </>
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
});
