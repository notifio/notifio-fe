'use client';

import { useEffect } from 'react';

import { installGlobalErrorHandlers } from '@/lib/error-reporter';

export function ErrorReporterInstaller() {
  useEffect(() => {
    installGlobalErrorHandlers();
  }, []);
  return null;
}
