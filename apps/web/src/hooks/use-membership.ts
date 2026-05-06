'use client';

import { useQuery } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';

import type { MembershipTier } from '@notifio/api-client';

import { api } from '@/lib/api';

/**
 * Actual shape returned by GET /me/membership.
 * The @notifio/shared MembershipDetails type is flat, but the API nests
 * plan details under `current`.
 * TODO: Fix this type gap in @notifio/shared so the cast isn't needed.
 */
export interface MembershipResponse {
  current: {
    tier: MembershipTier;
    name: string;
    maxLocations: number;
    priceMonthly: string;
    priceYearly: string;
    features: string[];
  };
  usage: {
    locations: number;
  };
  availableUpgrades: MembershipTier[];
}

export function useMembership() {
  const query = useQuery<MembershipResponse>({
    queryKey: ['membership'],
    queryFn: async () => {
      const data = await api.getMembership();
      return data as unknown as MembershipResponse;
    },
  });

  const membership = query.data ?? null;
  const tier = membership?.current?.tier ?? null;

  const { isFree, isPlus, isPro } = useMemo(
    () => ({
      isFree: tier === 'FREE',
      isPlus: tier === 'PLUS',
      isPro: tier === 'PRO',
    }),
    [tier],
  );

  const refetch = useCallback(async () => {
    await query.refetch();
  }, [query]);

  const upgrade = useCallback(
    async (targetTier: 'PLUS' | 'PRO') => {
      await api.upgradeMembership({ targetTier });
      await query.refetch();
    },
    [query],
  );

  const downgrade = useCallback(
    async (targetTier: 'FREE' | 'PLUS') => {
      await api.downgradeMembership({ targetTier });
      await query.refetch();
    },
    [query],
  );

  return {
    membership,
    isLoading: query.isPending,
    error: query.error ? (query.error.message || 'Failed to load membership') : null,
    tier,
    isFree,
    isPlus,
    isPro,
    upgrade,
    downgrade,
    refetch,
  };
}
