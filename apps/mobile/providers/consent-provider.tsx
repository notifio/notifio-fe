import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { AppState } from 'react-native';

import type { ConsentState } from '@notifio/api-client';

import { ConsentModal } from '../components/consent/consent-modal';
import { useAuth } from '../hooks/use-auth';
import { api } from '../lib/api';
import { setConsentRequiredHandler } from '../lib/api';

interface ConsentContextValue {
  consents: ConsentState[];
  isLoaded: boolean;
  allRequiredGranted: boolean;
  refetch: () => Promise<void>;
}

const ConsentContext = createContext<ConsentContextValue | null>(null);

interface ConsentProviderProps {
  children: React.ReactNode;
}

export function ConsentProvider({ children }: ConsentProviderProps) {
  const { session } = useAuth();
  const isAuthenticated = !!session;

  const [consents, setConsents] = useState<ConsentState[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [forceShow, setForceShow] = useState(false);
  const fetchingRef = useRef(false);

  const fetchConsents = useCallback(async () => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;
    try {
      const data = await api.getConsents();
      setConsents(data);
      setIsLoaded(true);
    } catch {
      // If fetch fails (e.g. network), mark loaded so app isn't stuck.
      // Consents will be re-checked on next foreground.
      setIsLoaded(true);
    } finally {
      fetchingRef.current = false;
    }
  }, []);

  // Fetch on auth change
  useEffect(() => {
    if (isAuthenticated) {
      fetchConsents();
    } else {
      setConsents([]);
      setIsLoaded(false);
    }
  }, [isAuthenticated, fetchConsents]);

  // Refetch on app foreground
  useEffect(() => {
    if (!isAuthenticated) return;
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        fetchConsents();
      }
    });
    return () => sub.remove();
  }, [isAuthenticated, fetchConsents]);

  // Register 451 handler
  useEffect(() => {
    setConsentRequiredHandler(() => setForceShow(true));
    return () => setConsentRequiredHandler(null);
  }, []);

  const allRequiredGranted = useMemo(() => {
    if (consents.length === 0) return false;
    return consents
      .filter((c) => c.category.required)
      .every((c) => c.granted);
  }, [consents]);

  const handleSave = useCallback(
    async (decisions: Array<{ categoryCode: string; granted: boolean }>) => {
      await Promise.all(
        decisions.map((d) => api.updateConsent(d.categoryCode, d.granted)),
      );
      await fetchConsents();
      setForceShow(false);
    },
    [fetchConsents],
  );

  const needsConsent =
    isAuthenticated && isLoaded && (consents.length === 0 || !allRequiredGranted || forceShow);

  const value = useMemo<ConsentContextValue>(
    () => ({ consents, isLoaded, allRequiredGranted, refetch: fetchConsents }),
    [consents, isLoaded, allRequiredGranted, fetchConsents],
  );

  return (
    <ConsentContext.Provider value={value}>
      {children}
      {needsConsent && <ConsentModal consents={consents} onSave={handleSave} />}
    </ConsentContext.Provider>
  );
}

export function useConsents(): ConsentContextValue {
  const ctx = useContext(ConsentContext);
  if (!ctx) {
    return { consents: [], isLoaded: false, allRequiredGranted: false, refetch: async () => {} };
  }
  return ctx;
}
