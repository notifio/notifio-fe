import { useCallback, useEffect, useState } from 'react';

import type { MembershipDetails, MembershipTier } from '@notifio/api-client';

import { api } from '../lib/api';

interface UseMembershipResult {
  membership: MembershipDetails | null;
  tier: MembershipTier;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useMembership(): UseMembershipResult {
  const [membership, setMembership] = useState<MembershipDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getMembership();
      setMembership(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load membership');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const tier: MembershipTier = membership?.tier ?? 'FREE';

  return { membership, tier, isLoading, error, refetch: fetch };
}
