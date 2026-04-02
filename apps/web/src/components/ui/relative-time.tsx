'use client';

import { useEffect, useState } from 'react';

import { formatRelativeTime } from '@/lib/format';

interface RelativeTimeProps {
  iso: string;
}

export function RelativeTime({ iso }: RelativeTimeProps) {
  const [text, setText] = useState('');

  useEffect(() => {
    setText(formatRelativeTime(iso));
  }, [iso]);

  return <>{text}</>;
}
