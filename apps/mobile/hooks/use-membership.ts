import { useCallback, useEffect, useState } from 'react';

import type { MembershipTier } from '@notifio/api-client';

import { api } from '../lib/api';

/**
 * Actual shape returned by GET /me/membership.
 * The @notifio/shared MembershipDetails type is flat, but the API
 * nests plan details under `current`. Mirrors the local
 * MembershipResponse type in apps/web/src/hooks/use-membership.ts.
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

interface UseMembershipResult {
  membership: MembershipResponse | null;
  tier: MembershipTier;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useMembership(): UseMembershipResult {
  const [membership, setMembership] = useState<MembershipResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getMembership();
      setMembership(data as unknown as MembershipResponse);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load membership');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  // BE response nests plan details under `current` — flat membership.tier
  // (matching the stale shared MembershipDetails type) was always
  // undefined, defaulting users with real PRO subscriptions to FREE
  // and showing them the upsell card on Reminders tab.
  const tier: MembershipTier = membership?.current?.tier ?? 'FREE';

  return { membership, tier, isLoading, error, refetch: fetch };
}
