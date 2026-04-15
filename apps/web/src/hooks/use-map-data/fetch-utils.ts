import { ApiError } from '@notifio/api-client';

export function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Fetch with a single 429 retry after 2 s. */
export async function safeFetch<T>(fn: () => Promise<T>): Promise<T | null> {
  try {
    return await fn();
  } catch (err) {
    if (err instanceof ApiError && err.status === 429) {
      await delay(2000);
      try {
        return await fn();
      } catch (retryErr) {
        console.error('[useMapData] retry failed:', retryErr);
        return null;
      }
    }
    console.error('[useMapData] fetch failed:', err);
    return null;
  }
}
