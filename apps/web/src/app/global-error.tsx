'use client';

import { useEffect } from 'react';

import { reportClientError } from '@/lib/error-reporter';

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    reportClientError({
      severity: 'error',
      errorType: 'react_render',
      message: error.message,
      stack: error.stack,
      context: error.digest ? { digest: error.digest } : undefined,
    });
  }, [error]);

  return (
    <html>
      <body
        style={{
          fontFamily: 'system-ui, sans-serif',
          padding: '40px 24px',
          color: '#0E223F',
          background: '#F7F8FA',
        }}
      >
        <h1 style={{ fontSize: 22, fontWeight: 700 }}>Something went wrong</h1>
        <p style={{ marginTop: 8, color: '#5C6B82', fontSize: 14 }}>
          The page hit an unexpected error. We&apos;ve been notified.
        </p>
        <button
          type="button"
          onClick={reset}
          style={{
            marginTop: 16,
            padding: '10px 18px',
            border: 'none',
            borderRadius: 8,
            background: '#FF7A2F',
            color: '#fff',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Try again
        </button>
      </body>
    </html>
  );
}
