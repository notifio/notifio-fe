'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import type { NotificationHistoryItem, PaginatedNotifications } from '@notifio/api-client';

import { api } from '@/lib/api';

const REFRESH_INTERVAL_MS = 60_000;

interface UseNotificationHistoryOptions {
  limit?: number;
  status?: 'upcoming' | 'active' | 'resolved' | 'all';
}

interface UseNotificationHistoryResult {
  items: NotificationHistoryItem[];
  isLoading: boolean;
  error: string | null;
  page: number;
  total: number;
  hasMore: boolean;
  loadMore: () => void;
  refresh: () => void;
}

export function useNotificationHistory(
  options?: UseNotificationHistoryOptions,
): UseNotificationHistoryResult {
  const limit = options?.limit ?? 20;
  const status = options?.status;

  const [data, setData] = useState<PaginatedNotifications | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const pageRef = useRef(1);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    pageRef.current = page;
  }, [page]);

  const fetchPage = useCallback(
    async (p: number, append: boolean) => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await api.getNotificationHistory({ page: p, limit, status });
        setData((prev) => {
          if (!append || !prev) return result;
          return {
            ...result,
            items: [...prev.items, ...result.items],
          };
        });
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Failed to load notifications';
        setError(msg);
      } finally {
        setIsLoading(false);
      }
    },
    [limit, status],
  );

  useEffect(() => {
    setPage(1);
    fetchPage(1, false);
  }, [fetchPage]);

  // Auto-refresh — only when user is on page 1, otherwise paginated
  // state would get clobbered every minute.
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      if (pageRef.current === 1) fetchPage(1, false);
    }, REFRESH_INTERVAL_MS);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchPage]);

  const loadMore = useCallback(() => {
    if (!data || isLoading) return;
    const totalPages = Math.ceil(data.total / limit);
    if (page >= totalPages) return;
    const nextPage = page + 1;
    setPage(nextPage);
    fetchPage(nextPage, true);
  }, [data, isLoading, page, limit, fetchPage]);

  const refresh = useCallback(() => {
    setPage(1);
    fetchPage(1, false);
  }, [fetchPage]);

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const hasMore = data ? page < Math.ceil(total / limit) : false;

  return { items, isLoading, error, page, total, hasMore, loadMore, refresh };
}
