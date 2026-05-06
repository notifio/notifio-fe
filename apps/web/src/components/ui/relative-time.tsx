'use client';

import { useLocale } from 'next-intl';
import { useEffect, useState } from 'react';

import { formatRelativeTime, type RelativeTimeLocale } from '@notifio/shared/format';

interface RelativeTimeProps {
  iso: string;
}

export function RelativeTime({ iso }: RelativeTimeProps) {
  const [text, setText] = useState('');
  const locale = useLocale() as RelativeTimeLocale;

  useEffect(() => {
    setText(formatRelativeTime(iso, locale));
  }, [iso, locale]);

  return <>{text}</>;
}
