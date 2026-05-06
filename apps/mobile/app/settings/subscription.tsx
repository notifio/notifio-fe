import { IconCheck } from '@tabler/icons-react-native';
import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import type { PublicMembershipTier, MembershipTier } from '@notifio/api-client';
import { useMembership } from '@notifio/shared/hooks';
import { tierColors } from '@notifio/ui';

import { api } from '../../lib/api';
import { SPACING } from '../../lib/spacing';
import { theme, withOpacity } from '../../lib/theme';
import { useAppTheme } from '../../providers/theme-provider';

const TIER_ORDER: Record<MembershipTier, number> = { FREE: 0, PLUS: 1, PRO: 2 };
const POPULAR_TIER: MembershipTier = 'PRO';
const TIER_KEY: Record<MembershipTier, 'free' | 'plus' | 'pro'> = {
  FREE: 'free',
  PLUS: 'plus',
  PRO: 'pro',
};

const WEB_URL = process.env.EXPO_PUBLIC_WEB_URL ?? 'https://notifio.app';

function formatPrice(raw: string): string {
  const n = Number.parseFloat(raw);
  if (!Number.isFinite(n) || n === 0) return '€0';
  return `€${n.toFixed(2)}`;
}

function tierColor(tier: MembershipTier): string {
  if (tier === 'PRO') return tierColors.pro;
  if (tier === 'PLUS') return tierColors.plus;
  return tierColors.free;
}

export default function SubscriptionScreen() {
  const { colors } = useAppTheme();
  const { t } = useTranslation();
  const { tier: currentTier } = useMembership();

  const [tiers, setTiers] = useState<PublicMembershipTier[] | null>(null);
  const [tiersLoading, setTiersLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setTiersLoading(true);
    api.getMembershipTiers()
      .then((data) => {
        if (!cancelled) setTiers(data);
      })
      .catch(() => {
        // Silent fail — render skeleton/empty state. User can retry by leaving + re-entering screen.
      })
      .finally(() => {
        if (!cancelled) setTiersLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const handleUpgrade = (target: MembershipTier) => {
    void Linking.openURL(`${WEB_URL}/pricing?upgrade=${target.toLowerCase()}`);
  };

  const handleManage = () => {
    void Linking.openURL(`${WEB_URL}/settings/subscription`);
  };

  return (
    <>
      <Stack.Screen options={{ title: t('settings.subscription') }} />
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {tiersLoading || !tiers ? (
          <SkeletonCards />
        ) : (
          tiers
            .slice()
            .sort((a, b) => (TIER_ORDER[a.tier as MembershipTier] ?? 0) - (TIER_ORDER[b.tier as MembershipTier] ?? 0))
            .map((tierDef) => {
              const tier = tierDef.tier as MembershipTier;
              const isCurrent = currentTier === tier;
              const currentOrder = TIER_ORDER[currentTier ?? 'FREE'] ?? 0;
              const tierOrd = TIER_ORDER[tier] ?? 0;
              const isUpgrade = tierOrd > currentOrder;
              const isPopular = tier === POPULAR_TIER;
              const accent = tierColor(tier);
              // i18n features (web's pattern — never raw API codes for display)
              const features = t(`membership.tiers.${tier}.features`, { returnObjects: true }) as string[];
              const features_ = Array.isArray(features) ? features : [];

              return (
                <TierCard
                  key={tier}
                  tier={tier}
                  accent={accent}
                  isCurrent={isCurrent}
                  isPopular={isPopular}
                  name={t(`membership.${TIER_KEY[tier]}.name`)}
                  description={t(`membership.${TIER_KEY[tier]}.description`)}
                  price={formatPrice(tierDef.priceMonthly)}
                  perPeriod={t('membership.perMonth')}
                  featuresLabel={t('membership.features')}
                  features={features_}
                  popularLabel={t('membership.popular')}
                  ctaCurrentLabel={t('membership.currentPlan')}
                  ctaUpgradeLabel={t('membership.upgradeOnWeb')}
                  ctaManageLabel={t('membership.manageOnWeb')}
                  onUpgrade={isUpgrade ? () => handleUpgrade(tier) : undefined}
                  onManage={isCurrent && tier !== 'FREE' ? handleManage : undefined}
                />
              );
            })
        )}
      </ScrollView>
    </>
  );
}

interface TierCardProps {
  tier: MembershipTier;
  accent: string;
  isCurrent: boolean;
  isPopular: boolean;
  name: string;
  description: string;
  price: string;
  perPeriod: string;
  featuresLabel: string;
  features: string[];
  popularLabel: string;
  ctaCurrentLabel: string;
  ctaUpgradeLabel: string;
  ctaManageLabel: string;
  onUpgrade?: () => void;
  onManage?: () => void;
}

function TierCard({
  accent,
  isCurrent,
  isPopular,
  name,
  description,
  price,
  perPeriod,
  featuresLabel,
  features,
  popularLabel,
  ctaCurrentLabel,
  ctaUpgradeLabel,
  ctaManageLabel,
  onUpgrade,
  onManage,
}: TierCardProps) {
  const { colors } = useAppTheme();

  // Border + bg emphasis for the user's current tier OR the "popular" PRO card.
  // If current AND popular, current wins (accent border, no popular tint flooding).
  const cardBorderColor = isCurrent ? colors.primary : isPopular ? accent : colors.border;
  const cardBackground = isCurrent
    ? withOpacity(colors.primary, 0.05)
    : isPopular
      ? withOpacity(accent, 0.05)
      : colors.surface;

  return (
    <View style={[styles.card, { backgroundColor: cardBackground, borderColor: cardBorderColor }]}>
      {isPopular && (
        <View style={[styles.popularPill, { backgroundColor: accent }]}>
          <Text style={styles.popularPillText}>{popularLabel}</Text>
        </View>
      )}

      <View style={styles.headerBlock}>
        <Text style={[styles.tierName, { color: colors.text }]}>{name}</Text>
        <Text style={[styles.tierDescription, { color: colors.textMuted }]}>{description}</Text>
      </View>

      <View style={styles.priceRow}>
        <Text style={[styles.price, { color: colors.text }]}>{price}</Text>
        <Text style={[styles.perPeriod, { color: colors.textMuted }]}>{perPeriod}</Text>
      </View>

      <Text style={[styles.featuresLabel, { color: colors.textMuted }]}>{featuresLabel}</Text>
      <View style={styles.featuresList}>
        {features.map((feature) => (
          <View key={feature} style={styles.featureRow}>
            <IconCheck size={16} color={accent} strokeWidth={2.5} />
            <Text style={[styles.featureText, { color: colors.textSecondary }]}>{feature}</Text>
          </View>
        ))}
      </View>

      {/* CTA */}
      {isCurrent ? (
        <View style={[styles.ctaCurrent, { borderColor: withOpacity(colors.primary, 0.3), backgroundColor: withOpacity(colors.primary, 0.094) }]}>
          <Text style={[styles.ctaCurrentText, { color: colors.primary }]}>{ctaCurrentLabel}</Text>
        </View>
      ) : null}

      {onManage && (
        <Pressable
          onPress={onManage}
          style={[styles.ctaSecondary, { borderColor: colors.border }]}
        >
          <Text style={[styles.ctaSecondaryText, { color: colors.text }]}>{ctaManageLabel}</Text>
        </Pressable>
      )}

      {onUpgrade && (
        <Pressable
          onPress={onUpgrade}
          style={[styles.ctaPrimary, { backgroundColor: colors.primary }]}
        >
          <Text style={[styles.ctaPrimaryText, { color: colors.textInverse }]}>{ctaUpgradeLabel}</Text>
        </Pressable>
      )}
    </View>
  );
}

function SkeletonCards() {
  const { colors } = useAppTheme();
  return (
    <View style={styles.skeletonWrap}>
      {[0, 1, 2].map((i) => (
        <View key={i} style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={[styles.skeletonBlock, { backgroundColor: colors.border, width: '40%', height: 24 }]} />
          <View style={[styles.skeletonBlock, { backgroundColor: colors.border, width: '70%', height: 14, marginTop: 8 }]} />
          <View style={[styles.skeletonBlock, { backgroundColor: colors.border, width: '30%', height: 32, marginTop: 16 }]} />
          <View style={[styles.skeletonBlock, { backgroundColor: colors.border, width: '90%', height: 12, marginTop: 16 }]} />
          <View style={[styles.skeletonBlock, { backgroundColor: colors.border, width: '85%', height: 12, marginTop: 8 }]} />
          <View style={[styles.skeletonBlock, { backgroundColor: colors.border, width: '80%', height: 12, marginTop: 8 }]} />
        </View>
      ))}
      <ActivityIndicator color={colors.primary} style={{ marginTop: theme.spacing.lg }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: SPACING.screenH,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing['4xl'],
    gap: theme.spacing.lg,
  },
  card: {
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    padding: theme.spacing.xl,
    position: 'relative',
  },
  popularPill: {
    position: 'absolute',
    top: -10,
    alignSelf: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 2,
    borderRadius: theme.radius.full,
  },
  popularPillText: {
    color: '#FFFFFF',
    fontSize: 10,
    ...theme.font.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  headerBlock: {
    marginBottom: theme.spacing.md,
  },
  tierName: {
    fontSize: theme.fontSize.lg,
    ...theme.font.bold,
  },
  tierDescription: {
    marginTop: 2,
    fontSize: theme.fontSize.sm,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: theme.spacing.lg,
  },
  price: {
    fontSize: 28,
    ...theme.font.bold,
  },
  perPeriod: {
    marginLeft: 4,
    fontSize: theme.fontSize.sm,
  },
  featuresLabel: {
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    ...theme.font.semibold,
    marginBottom: theme.spacing.sm,
  },
  featuresList: {
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.sm,
  },
  featureText: {
    flex: 1,
    fontSize: theme.fontSize.sm,
    lineHeight: 20,
  },
  ctaCurrent: {
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radius.lg,
    borderWidth: 1,
  },
  ctaCurrentText: {
    fontSize: theme.fontSize.sm,
    ...theme.font.medium,
  },
  ctaSecondary: {
    marginTop: theme.spacing.sm,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radius.lg,
    borderWidth: 1,
  },
  ctaSecondaryText: {
    fontSize: theme.fontSize.sm,
    ...theme.font.medium,
  },
  ctaPrimary: {
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radius.lg,
  },
  ctaPrimaryText: {
    fontSize: theme.fontSize.sm,
    ...theme.font.semibold,
  },
  skeletonWrap: {
    gap: theme.spacing.lg,
  },
  skeletonBlock: {
    borderRadius: theme.radius.sm,
    opacity: 0.5,
  },
});
