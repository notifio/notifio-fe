import { ApiError } from '@notifio/api-client';

/**
 * Extract a user-readable message from an unknown error thrown by the
 * api client. Generic toasts ("Something went wrong") used to swallow
 * specific BE messages like "Location limit reached (1)" or "Custom
 * labels require a higher membership tier" — the user had no idea why
 * a save failed.
 *
 * Used by hooks that want to forward the BE's `error` string to a
 * toast or inline error UI. Falls back to the supplied default when
 * the error isn't an `ApiError` or the body can't be parsed.
 */
export function extractApiErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof ApiError) {
    try {
      const parsed = JSON.parse(err.body) as { error?: unknown };
      if (typeof parsed.error === 'string' && parsed.error.length > 0) {
        return parsed.error;
      }
    } catch {
      // body wasn't JSON — fall through
    }
    if (err.body && err.body.length > 0 && err.body.length < 200) {
      return err.body;
    }
  }
  if (err instanceof Error && err.message) {
    return err.message;
  }
  return fallback;
}

/** Pull the BE's error code (e.g. `MEMBERSHIP_REQUIRED`) for branching UI. */
export function extractApiErrorCode(err: unknown): string | null {
  if (!(err instanceof ApiError)) return null;
  try {
    const parsed = JSON.parse(err.body) as { code?: unknown };
    if (typeof parsed.code === 'string' && parsed.code.length > 0) {
      return parsed.code;
    }
  } catch {
    return null;
  }
  return null;
}
