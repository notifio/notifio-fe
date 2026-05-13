'use client';

import { IconAlertTriangle, IconLoader2 } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useState } from 'react';

import { ConsentModal } from '@/components/app/consent-modal';
import { useConsents } from '@/hooks/use-consents';
import { api } from '@/lib/api';
import { CONSENT_REQUIRED_EVENT } from '@/lib/api';

interface ConsentGateProps {
  children: React.ReactNode;
}

export function ConsentGate({ children }: ConsentGateProps) {
  const { consents, isLoading: loading, isError, refetch } = useConsents();
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

  if (isError) {
    return <ConsentGateError onRetry={refetch} />;
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

interface ConsentGateErrorProps {
  onRetry: () => void;
}

function ConsentGateError({ onRetry }: ConsentGateErrorProps) {
  const tc = useTranslations('common');
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-6 text-center">
      <IconAlertTriangle size={36} className="text-amber-500" />
      <div className="space-y-1">
        <h2 className="text-base font-semibold text-text-primary">
          {tc('loadError.title')}
        </h2>
        <p className="max-w-sm text-sm text-muted">
          {tc('loadError.body')}
        </p>
      </div>
      <button
        type="button"
        onClick={onRetry}
        className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent/90"
      >
        {tc('retry')}
      </button>
    </div>
  );
}
