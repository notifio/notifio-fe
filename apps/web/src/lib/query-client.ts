import { QueryClient } from '@tanstack/react-query';

/**
 * Factory rather than a singleton. Next.js App Router renders client
 * components on both server (during the initial RSC pass) and client,
 * and a shared singleton would leak query state across requests on the
 * server. The pattern is: each call to `Providers` creates its own
 * client via `useState(() => makeQueryClient())`, which gives us one
 * client per browser session without sharing across server requests.
 *
 * Tuning rationale:
 * - `staleTime: 5 min` — most upstream data (weather, AQI, traffic)
 *   only updates on multi-minute cadences. Treating responses as fresh
 *   for 5 minutes prevents tab-switching from refiring requests.
 * - `retry: 2` — silent retries for transient failures, matches mobile.
 * - `refetchOnWindowFocus: true` — browser windows DO fire focus events
 *   (unlike RN), so we let RQ refetch on tab return. The previous
 *   `useApiQuery` had no equivalent; users explicitly refreshed via
 *   the `refresh()` callback.
 */
export function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5,
        retry: 2,
        refetchOnWindowFocus: true,
      },
    },
  });
}
