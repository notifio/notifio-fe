import { StyleSheet, Text, View } from 'react-native';

import type { MembershipTier } from '@notifio/api-client';
import { tierColors } from '@notifio/ui';

import { theme } from '../../lib/theme';

interface TierBadgeProps {
  tier: MembershipTier;
  size?: 'sm' | 'md';
}

const COLOR_MAP: Record<MembershipTier, string> = {
  FREE: tierColors.free,
  PLUS: tierColors.plus,
  PRO: tierColors.pro,
};

export function TierBadge({ tier, size = 'sm' }: TierBadgeProps) {
  const color = COLOR_MAP[tier];
  const isSmall = size === 'sm';

  return (
    <View style={[styles.badge, { backgroundColor: `${color}18` }, isSmall ? styles.sm : styles.md]}>
      <Text style={[styles.label, { color }, isSmall ? styles.labelSm : styles.labelMd]}>
        {tier}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: theme.radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sm: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
  },
  md: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
  },
  label: {
    ...theme.font.semibold,
  },
  labelSm: {
    fontSize: theme.fontSize.xs,
  },
  labelMd: {
    fontSize: theme.fontSize.sm,
  },
});
