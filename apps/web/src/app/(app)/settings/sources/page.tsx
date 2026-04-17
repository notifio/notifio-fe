'use client';

import {
  IconChevronDown,
  IconChevronUp,
  IconLoader2,
  IconTrash,
} from '@tabler/icons-react';
import { useTranslations } from 'next-intl';
import { useCallback, useState } from 'react';

import { StarRating } from '@/components/ui/star-rating';
import { useSources } from '@/hooks/use-sources';
import { cn } from '@/lib/utils';

export default function SourcesPage() {
  const t = useTranslations('sources');
  const { sources, isLoading: loading, error, rateSource, deleteRating } = useSources();
  const [expandedId, setExpandedId] = useState<number | null>(null);

  // Local draft state for the expanded source's rating form
  const [draftAccuracy, setDraftAccuracy] = useState(0);
  const [draftTimeliness, setDraftTimeliness] = useState(0);
  const [draftComment, setDraftComment] = useState('');
  const [saving, setSaving] = useState(false);
  const [removing, setRemoving] = useState(false);

  const toggleExpand = useCallback(
    (id: number) => {
      if (expandedId === id) {
        setExpandedId(null);
        return;
      }
      setExpandedId(id);
      const source = sources.find((s) => s.sourceAdapterId === id);
      setDraftAccuracy(source?.ownRating?.numAccuracy ?? 0);
      setDraftTimeliness(source?.ownRating?.numTimeliness ?? 0);
      setDraftComment(source?.ownRating?.txtComment ?? '');
    },
    [expandedId, sources],
  );

  const handleSave = useCallback(
    async (sourceAdapterId: number) => {
      if (draftAccuracy === 0 || draftTimeliness === 0) return;
      setSaving(true);
      try {
        await rateSource(sourceAdapterId, {
          numAccuracy: draftAccuracy,
          numTimeliness: draftTimeliness,
          ...(draftComment.trim() ? { txtComment: draftComment.trim() } : {}),
        });
        setExpandedId(null);
      } finally {
        setSaving(false);
      }
    },
    [draftAccuracy, draftTimeliness, draftComment, rateSource],
  );

  const handleRemove = useCallback(
    async (sourceAdapterId: number) => {
      setRemoving(true);
      try {
        await deleteRating(sourceAdapterId);
        setDraftAccuracy(0);
        setDraftTimeliness(0);
        setDraftComment('');
      } finally {
        setRemoving(false);
      }
    },
    [deleteRating],
  );

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 md:px-8 md:py-10">
      <h1 className="text-2xl font-bold text-text-primary">{t('title')}</h1>
      <p className="mt-1 text-sm text-muted">{t('description')}</p>

      <div className="mt-8">
        {loading ? (
          <div className="flex justify-center py-16">
            <IconLoader2 size={28} className="animate-spin text-accent" />
          </div>
        ) : error ? (
          <div className="rounded-xl bg-danger/10 px-4 py-3 text-sm text-danger">
            {error}
          </div>
        ) : sources.length === 0 ? (
          <div className="rounded-xl bg-card px-4 py-8 text-center text-sm text-muted">
            {t('noSources')}
          </div>
        ) : (
          <div className="space-y-3">
            {sources.map((source) => {
              const isExpanded = expandedId === source.sourceAdapterId;
              const hasOwn = !!source.ownRating;

              return (
                <div
                  key={source.sourceAdapterId}
                  className="rounded-xl bg-card"
                >
                  {/* Source header row */}
                  <button
                    type="button"
                    onClick={() => toggleExpand(source.sourceAdapterId)}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-text-primary">
                          {source.name}
                        </span>
                        {source.autoCredibility !== null && (
                          <span
                            className={cn(
                              'rounded-full px-2 py-0.5 text-[10px] font-semibold',
                              source.autoCredibility >= 70
                                ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                                : source.autoCredibility >= 40
                                  ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                                  : 'bg-danger/10 text-danger',
                            )}
                          >
                            {t('credibility')} {source.autoCredibility}%
                          </span>
                        )}
                      </div>

                      <div className="mt-1 flex items-center gap-4 text-xs text-muted">
                        {source.avgAccuracy !== null && (
                          <span className="flex items-center gap-1">
                            {t('accuracy')}
                            <StarRating
                              value={Math.round(source.avgAccuracy)}
                              readonly
                              size={14}
                            />
                          </span>
                        )}
                        {source.avgTimeliness !== null && (
                          <span className="flex items-center gap-1">
                            {t('timeliness')}
                            <StarRating
                              value={Math.round(source.avgTimeliness)}
                              readonly
                              size={14}
                            />
                          </span>
                        )}
                        <span>
                          {t('ratings', { count: source.ratingCount })}
                        </span>
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                      {hasOwn && (
                        <span className="rounded bg-accent/10 px-1.5 py-0.5 text-[10px] font-medium text-accent">
                          {t('yourRating')}
                        </span>
                      )}
                      {isExpanded ? (
                        <IconChevronUp size={16} className="text-muted" />
                      ) : (
                        <IconChevronDown size={16} className="text-muted" />
                      )}
                    </div>
                  </button>

                  {/* Expandable rating form */}
                  {isExpanded && (
                    <div className="border-t border-border px-4 py-4">
                      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted">
                        {t('yourRating')}
                      </p>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-text-secondary">
                            {t('accuracy')}
                          </span>
                          <StarRating
                            value={draftAccuracy}
                            onChange={setDraftAccuracy}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-text-secondary">
                            {t('timeliness')}
                          </span>
                          <StarRating
                            value={draftTimeliness}
                            onChange={setDraftTimeliness}
                          />
                        </div>

                        <div>
                          <label className="mb-1 block text-sm text-text-secondary">
                            {t('comment')}
                          </label>
                          <textarea
                            rows={2}
                            placeholder={t('commentPlaceholder')}
                            value={draftComment}
                            onChange={(e) => setDraftComment(e.target.value)}
                            className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-text-primary placeholder:text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                          />
                        </div>

                        <div className="flex items-center gap-2 pt-1">
                          <button
                            onClick={() =>
                              handleSave(source.sourceAdapterId)
                            }
                            disabled={
                              saving ||
                              draftAccuracy === 0 ||
                              draftTimeliness === 0
                            }
                            className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent/90 disabled:opacity-50"
                          >
                            {saving && (
                              <IconLoader2
                                size={14}
                                className="animate-spin"
                              />
                            )}
                            {t('save')}
                          </button>

                          {hasOwn && (
                            <button
                              onClick={() =>
                                handleRemove(source.sourceAdapterId)
                              }
                              disabled={removing}
                              className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-danger transition-colors hover:bg-danger/10 disabled:opacity-50"
                            >
                              {removing ? (
                                <IconLoader2
                                  size={14}
                                  className="animate-spin"
                                />
                              ) : (
                                <IconTrash size={14} />
                              )}
                              {t('remove')}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
