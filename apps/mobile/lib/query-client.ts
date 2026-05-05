import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { QueryClient } from '@tanstack/react-query';

/**
 * Singleton React Query client for the mobile app.
 *
 * Tuning rationale:
 * - `staleTime: 5 min` — most data Notifio renders (weather, air quality,
 *   pollen, traffic incidents) only ticks on a multi-minute cadence
 *   upstream. Treat data as fresh for 5 minutes so screen tabs in/out
 *   don't refire the network on every focus.
 * - `gcTime: 24 h` — keep cache entries around for a day so cold-relaunches
 *   show the last-known data instantly while the background refetch fires.
 *   This is the persisted window, not the in-memory window.
 * - `retry: 2` — transient network blips on cellular shouldn't surface as
 *   errors to the user; two silent retries with exponential backoff cover
 *   the common case.
 * - `refetchOnWindowFocus: false` — RN doesn't fire `focus` events the way
 *   browsers do. The AppState bridge in `query-app-state.ts` translates
 *   foreground/background → focus instead, so we don't need RQ's
 *   built-in window-focus refetch (which is a no-op on RN anyway).
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 60 * 24,
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

/**
 * AsyncStorage-backed cache persister. Bumps to a new key on breaking
 * cache-shape changes via the `buster` arg passed to
 * `<PersistQueryClientProvider>` at the app root.
 */
export const asyncStoragePersister = createAsyncStoragePersister({
  storage: AsyncStorage,
  key: 'NOTIFIO_RQ_CACHE',
});
