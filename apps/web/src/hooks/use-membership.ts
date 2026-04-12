'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import type { MembershipTier } from '@notifio/api-client';

import { api } from '@/lib/api';

/**
 * Actual shape returned by GET /me/membership.
 * The @notifio/shared MembershipDetails type is flat, but the API nests
 * plan details under `current`.
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

interface UseMembershipResult {
  membership: MembershipResponse | null;
  loading: boolean;
  error: string | null;
  tier: MembershipTier | null;
  isFree: boolean;
  isPlus: boolean;
  isPro: boolean;
  upgrade: (targetTier: 'PLUS' | 'PRO') => Promise<void>;
  downgrade: (targetTier: 'FREE' | 'PLUS') => Promise<void>;
  refetch: () => void;
}

export function useMembership(): UseMembershipResult {
  const [membership, setMembership] = useState<MembershipResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMembership = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // The API returns a nested shape that doesn't match the flat MembershipDetails type
      const data = await api.getMembership() as unknown as MembershipResponse;
      setMembership(data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load membership';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMembership();
  }, [fetchMembership]);

  const tier = membership?.current?.tier ?? null;

  const { isFree, isPlus, isPro } = useMemo(() => ({
    isFree: tier === 'FREE',
    isPlus: tier === 'PLUS',
    isPro: tier === 'PRO',
  }), [tier]);

  const upgrade = useCallback(async (targetTier: 'PLUS' | 'PRO') => {
    await api.upgradeMembership({ targetTier });
    await fetchMembership();
  }, [fetchMembership]);

  const downgrade = useCallback(async (targetTier: 'FREE' | 'PLUS') => {
    await api.downgradeMembership({ targetTier });
    await fetchMembership();
  }, [fetchMembership]);

  return {
    membership,
    loading,
    error,
    tier,
    isFree,
    isPlus,
    isPro,
    upgrade,
    downgrade,
    refetch: fetchMembership,
  };
}
