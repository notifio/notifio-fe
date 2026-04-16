'use client';

import { useCallback, useMemo } from 'react';

import type { MembershipTier } from '@notifio/api-client';

import { api } from '@/lib/api';

import { useApiQuery } from './use-api-query';

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

function parseMembershipResponse(data: unknown): MembershipResponse {
  return data as MembershipResponse;
}

export function useMembership() {
  const { data: rawData, isLoading, error, refetch } = useApiQuery(
    async () => {
      const data = await api.getMembership();
      return parseMembershipResponse(data);
    },
    [],
  );

  const membership = rawData;
  const tier = membership?.current?.tier ?? null;

  const { isFree, isPlus, isPro } = useMemo(() => ({
    isFree: tier === 'FREE',
    isPlus: tier === 'PLUS',
    isPro: tier === 'PRO',
  }), [tier]);

  const upgrade = useCallback(async (targetTier: 'PLUS' | 'PRO') => {
    await api.upgradeMembership({ targetTier });
    await refetch();
  }, [refetch]);

  const downgrade = useCallback(async (targetTier: 'FREE' | 'PLUS') => {
    await api.downgradeMembership({ targetTier });
    await refetch();
  }, [refetch]);

  return {
    membership,
    isLoading,
    error,
    tier,
    isFree,
    isPlus,
    isPro,
    upgrade,
    downgrade,
    refetch,
  };
}
