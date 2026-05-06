import { focusManager } from '@tanstack/react-query';
import { useEffect } from 'react';
import { AppState, type AppStateStatus } from 'react-native';

/**
 * Bridges React Native's `AppState` to React Query's `focusManager` so
 * queries that opt into `refetchOnWindowFocus` fire on app foreground
 * instead of waiting for the next `staleTime` boundary.
 *
 * RN doesn't have a window-focus concept, so this is the canonical way
 * to wire the two together (per @tanstack/react-query docs:
 * https://tanstack.com/query/latest/docs/framework/react/react-native).
 *
 * Defaults in `query-client.ts` keep `refetchOnWindowFocus: false`, so
 * this hook is dormant until a query opts in. Call this once at the app
 * root regardless — it's a single global subscription, ~zero cost when
 * unused.
 */
export function useReactQueryAppStateBridge(): void {
  useEffect(() => {
    function onAppStateChange(status: AppStateStatus): void {
      focusManager.setFocused(status === 'active');
    }
    const sub = AppState.addEventListener('change', onAppStateChange);
    return () => sub.remove();
  }, []);
}
