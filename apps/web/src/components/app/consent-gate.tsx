'use client';

import { IconLoader2 } from '@tabler/icons-react';
import { useCallback, useEffect, useState } from 'react';

import { ConsentModal } from '@/components/app/consent-modal';
import { useConsents } from '@/hooks/use-consents';
import { api } from '@/lib/api';
import { CONSENT_REQUIRED_EVENT } from '@/lib/api';

interface ConsentGateProps {
  children: React.ReactNode;
}

export function ConsentGate({ children }: ConsentGateProps) {
  const { consents, loading, refetch } = useConsents();
  const [forceShow, setForceShow] = useState(false);

  // Listen for CONSENT_REQUIRED events from the API layer
  useEffect(() => {
    const handler = () => setForceShow(true);
    window.addEventListener(CONSENT_REQUIRED_EVENT, handler);
    return () => window.removeEventListener(CONSENT_REQUIRED_EVENT, handler);
  }, []);

  const handleSave = useCallback(
    async (decisions: Array<{ categoryCode: string; granted: boolean }>) => {
      await Promise.all(
        decisions.map((d) => api.updateConsent(d.categoryCode, d.granted)),
      );
      await refetch();
      setForceShow(false);
    },
    [refetch],
  );

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <IconLoader2 size={28} className="animate-spin text-accent" />
      </div>
    );
  }

  const needsConsent = consents.length === 0 || forceShow;

  if (needsConsent) {
    return (
      <>
        {/* Render children behind the modal so the page shell is visible */}
        <div className="pointer-events-none opacity-30">{children}</div>
        <ConsentModal consents={consents} onSave={handleSave} />
      </>
    );
  }

  return <>{children}</>;
}
