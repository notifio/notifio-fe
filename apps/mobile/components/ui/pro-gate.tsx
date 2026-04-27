import { IconCrown } from '@tabler/icons-react-native';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import type { MembershipTier } from '@notifio/api-client';

import { useMembership } from '../../hooks/use-membership';
import { theme } from '../../lib/theme';
import { showToast } from '../../lib/toast';
import { useAppTheme } from '../../providers/theme-provider';

const TIER_ORDER: Record<MembershipTier, number> = { FREE: 0, PLUS: 1, PRO: 2 };

interface ProGateProps {
  requiredTier: 'PLUS' | 'PRO';
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function ProGate({ requiredTier, children, fallback }: ProGateProps) {
  const { colors } = useAppTheme();
  const { tier, isLoading } = useMembership();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={colors.textMuted} />
      </View>
    );
  }

  const userOrder = TIER_ORDER[tier] ?? 0;
  const requiredOrder = TIER_ORDER[requiredTier] ?? 0;

  if (userOrder >= requiredOrder) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <View style={[styles.container, { borderColor: colors.border, backgroundColor: colors.surface }]}>
      <View style={[styles.iconCircle, { backgroundColor: `${colors.primary}18` }]}>
        <IconCrown size={24} color={colors.primary} />
      </View>
      <Text style={[styles.title, { color: colors.text }]}>
        {requiredTier} Feature
      </Text>
      <Text style={[styles.description, { color: colors.textMuted }]}>
        This feature requires a {requiredTier} subscription.
      </Text>
      <Pressable
        onPress={() => showToast.info('Coming soon', 'Upgrade will be available soon.')}
        style={[styles.button, { backgroundColor: colors.primary }]}
      >
        <Text style={[styles.buttonText, { color: colors.textInverse }]}>Upgrade</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    padding: theme.spacing['3xl'],
    alignItems: 'center',
  },
  container: {
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    borderStyle: 'dashed',
    padding: theme.spacing.xl,
    alignItems: 'center',
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: theme.radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    marginTop: theme.spacing.md,
    fontSize: theme.fontSize.md,
    ...theme.font.semibold,
  },
  description: {
    marginTop: theme.spacing.xs,
    fontSize: theme.fontSize.sm,
    textAlign: 'center',
  },
  button: {
    marginTop: theme.spacing.lg,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.radius.lg,
  },
  buttonText: {
    fontSize: theme.fontSize.sm,
    ...theme.font.medium,
  },
});
