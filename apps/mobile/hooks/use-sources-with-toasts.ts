import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import { useSources } from '@notifio/shared/hooks';

import { showToast } from '../lib/toast';

/**
 * Mobile wrapper around the side-effect-free `useSources` from
 * `@notifio/shared/hooks`. Re-adds the i18n-resolved success/error
 * toasts that mobile's prior local hook emitted on rate / delete-rating.
 *
 * Keys preserved verbatim from the deleted `apps/mobile/hooks/use-sources.ts`:
 *   - `sources.saved`   — rate succeeded
 *   - `sources.deleted` — delete-rating succeeded
 *   - `sources.error`   — either op failed
 *
 * Single-arg `showToast.success/error` matches mobile's existing toast
 * style (no separate title + message split). Errors are swallowed for
 * the toast UX but NOT re-thrown — the prior hook also discarded them
 * silently after surfacing the toast.
 */
export function useSourcesWithToasts() {
  const { t } = useTranslation();
  const result = useSources();

  const rateSource = useCallback<typeof result.rateSource>(
    async (sourceAdapterId, body) => {
      try {
        await result.rateSource(sourceAdapterId, body);
        showToast.success(t('sources.saved'));
      } catch {
        showToast.error(t('sources.error'));
      }
    },
    [result, t],
  );

  const deleteRating = useCallback<typeof result.deleteRating>(
    async (sourceAdapterId) => {
      try {
        await result.deleteRating(sourceAdapterId);
        showToast.success(t('sources.deleted'));
      } catch {
        showToast.error(t('sources.error'));
      }
    },
    [result, t],
  );

  return { ...result, rateSource, deleteRating };
}
