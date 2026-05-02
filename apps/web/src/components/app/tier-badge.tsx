'use client';

import { tierColors } from '@notifio/ui';

interface TierBadgeProps {
  tier: 'PLUS' | 'PRO';
  size?: 'sm' | 'md';
}

const COLOR_MAP: Record<TierBadgeProps['tier'], string> = {
  PLUS: tierColors.plus,
  PRO: tierColors.pro,
};

/**
 * Step 8: pill badge surfaced on locked map filter rows so the user
 * can see at a glance which tier unlocks the source. Mobile already
 * has an equivalent component; this keeps the API + visual signature
 * identical so the components can be folded into a shared package
 * later.
 */
export function TierBadge({ tier, size = 'sm' }: TierBadgeProps) {
  const color = COLOR_MAP[tier];
  const isSmall = size === 'sm';
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: `${color}22`,
        color,
        borderRadius: '999px',
        padding: isSmall ? '2px 8px' : '4px 12px',
        fontSize: isSmall ? '10px' : '12px',
        fontWeight: 600,
        letterSpacing: '0.4px',
        textTransform: 'uppercase',
        lineHeight: 1.2,
      }}
    >
      {tier}
    </span>
  );
}
