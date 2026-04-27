import { useCallback, useEffect, useRef, useState } from 'react';

import { api } from '../lib/api';

type ExportState = 'idle' | 'processing' | 'ready';

const MAX_POLLS = 30;
const POLL_INTERVAL_MS = 3000;

interface UseDataExportResult {
  state: ExportState;
  downloadUrl: string | null;
  expiresAt: string | null;
  error: string | null;
  requestExport: () => Promise<void>;
  dismiss: () => void;
}

export function useDataExport(): UseDataExportResult {
  const [state, setState] = useState<ExportState>('idle');
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const cancelledRef = useRef(false);

  const poll = useCallback(async (jobId: string) => {
    cancelledRef.current = false;
    let attempts = 0;

    const tick = async () => {
      if (cancelledRef.current) return;
      if (attempts >= MAX_POLLS) {
        setError('timeout');
        setState('idle');
        return;
      }
      attempts++;
      try {
        const result = await api.getDataExportStatus(jobId);
        if (cancelledRef.current) return;

        if (result.status === 'completed') {
          setDownloadUrl(result.downloadUrl);
          setExpiresAt(result.expiresAt);
          setState('ready');
          return;
        }
        if (result.status === 'failed') {
          setError('failed');
          setState('idle');
          return;
        }
        setTimeout(tick, POLL_INTERVAL_MS);
      } catch {
        if (!cancelledRef.current) {
          setError('failed');
          setState('idle');
        }
      }
    };

    tick();
  }, []);

  const requestExport = useCallback(async () => {
    setState('processing');
    setError(null);
    setDownloadUrl(null);
    setExpiresAt(null);
    try {
      const job = await api.requestDataExport();
      poll(job.jobId);
    } catch {
      setError('failed');
      setState('idle');
    }
  }, [poll]);

  const dismiss = useCallback(() => {
    cancelledRef.current = true;
    setState('idle');
    setDownloadUrl(null);
    setExpiresAt(null);
  }, []);

  useEffect(() => {
    return () => { cancelledRef.current = true; };
  }, []);

  return { state, downloadUrl, expiresAt, error, requestExport, dismiss };
}
