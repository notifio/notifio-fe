'use client';

import { useQuery } from '@tanstack/react-query';
import { useCallback } from 'react';

import type { PublicMembershipTier } from '@notifio/api-client';

import { api } from '@/lib/api';

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
 *
 * Returns `tiers: null` (not `[]`) while loading so the pricing card can
 * distinguish "loading" from "no tiers configured".
 */
export function useMembershipTiers() {
  const query = useQuery<PublicMembershipTier[]>({
    queryKey: ['membership-tiers'],
    queryFn: () => api.getMembershipTiers(),
  });

  const refetch = useCallback(async () => {
    await query.refetch();
  }, [query]);

  return {
    tiers: query.data ?? null,
    isLoading: query.isPending,
    error: query.error ? (query.error.message || 'Failed to load membership tiers') : null,
    refetch,
  };
}
