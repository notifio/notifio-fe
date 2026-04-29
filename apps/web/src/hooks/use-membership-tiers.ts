'use client';

import type { PublicMembershipTier } from '@notifio/api-client';

import { api } from '@/lib/api';

import { useApiQuery } from './use-api-query';

/**
 * Fetches the public membership tier catalog from
 * `GET /api/v1/membership/tiers`. Used by the pricing page so prices,
 * descriptions, and feature lists live in the database (`c_membership` +
 * `r_membership_feature`) rather than being hardcoded in the FE bundle.
 *
 * The endpoint is public — safe to call before sign-in. No locale param
 * is sent because the descriptive copy on the pricing card (tier name,
 * description, feature labels) still flows through next-intl messages;
 * the BE supplies the canonical price + tier code only.
 */
export function useMembershipTiers() {
  const { data, isLoading, error, refetch } = useApiQuery<PublicMembershipTier[]>(
    () => api.getMembershipTiers(),
    [],
  );

  return {
    tiers: data ?? null,
    isLoading,
    error,
    refetch,
  };
}
