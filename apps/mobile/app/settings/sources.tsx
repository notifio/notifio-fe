import {
  IconStar,
  IconStarFilled,
  IconTrash,
} from '@tabler/icons-react-native';
import { Stack } from 'expo-router';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Alert,
  LayoutAnimation,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import type { SourceSummary } from '@notifio/api-client';

import { useSources } from '../../hooks/use-sources';
import { theme } from '../../lib/theme';
import { useAppTheme } from '../../providers/theme-provider';

function StarRating({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const { colors } = useAppTheme();
  return (
    <View style={styles.starRow}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Pressable key={star} onPress={() => onChange(star)} hitSlop={4}>
          {star <= value ? (
            <IconStarFilled size={24} color={colors.primary} />
          ) : (
            <IconStar size={24} color={colors.textMuted} />
          )}
        </Pressable>
      ))}
    </View>
  );
}

interface SourceCardProps {
  source: SourceSummary;
  expanded: boolean;
  onToggle: () => void;
  onRate: (accuracy: number, timeliness: number, comment?: string) => Promise<void>;
  onDelete: () => void;
}

function SourceCard({ source, expanded, onToggle, onRate, onDelete }: SourceCardProps) {
  const { colors } = useAppTheme();
  const { t } = useTranslation();

  const [accuracy, setAccuracy] = useState(source.ownRating?.numAccuracy ?? 0);
  const [timeliness, setTimeliness] = useState(source.ownRating?.numTimeliness ?? 0);
  const [comment, setComment] = useState(source.ownRating?.txtComment ?? '');
  const [saving, setSaving] = useState(false);

  const handleSave = useCallback(async () => {
    if (accuracy === 0 || timeliness === 0) return;
    setSaving(true);
    await onRate(accuracy, timeliness, comment || undefined);
    setSaving(false);
  }, [accuracy, timeliness, comment, onRate]);

  const avgAccuracy = source.avgAccuracy !== null ? source.avgAccuracy.toFixed(1) : '-';
  const avgTimeliness = source.avgTimeliness !== null ? source.avgTimeliness.toFixed(1) : '-';

  return (
    <View style={[styles.sourceCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Pressable onPress={onToggle} style={styles.sourceHeader}>
        <View style={styles.sourceInfo}>
          <Text style={[styles.sourceName, { color: colors.text }]}>{source.name}</Text>
          <Text style={[styles.sourceStats, { color: colors.textMuted }]}>
            {t('sources.accuracy')}: {avgAccuracy}/5 &middot; {t('sources.timeliness')}: {avgTimeliness}/5
          </Text>
          <Text style={[styles.ratingCount, { color: colors.textMuted }]}>
            {source.ratingCount > 0
              ? t('sources.ratings', { count: source.ratingCount })
              : t('sources.noRatings')}
          </Text>
        </View>
      </Pressable>

      {expanded && (
        <View style={[styles.ratingForm, { borderTopColor: colors.border }]}>
          <View style={styles.ratingRow}>
            <Text style={[styles.ratingLabel, { color: colors.textSecondary }]}>
              {t('sources.accuracy')}
            </Text>
            <StarRating value={accuracy} onChange={setAccuracy} />
          </View>

          <View style={styles.ratingRow}>
            <Text style={[styles.ratingLabel, { color: colors.textSecondary }]}>
              {t('sources.timeliness')}
            </Text>
            <StarRating value={timeliness} onChange={setTimeliness} />
          </View>

          <Text style={[styles.commentLabel, { color: colors.textSecondary }]}>
            {t('sources.comment')}
          </Text>
          <TextInput
            style={[
              styles.commentInput,
              {
                color: colors.text,
                backgroundColor: colors.background,
                borderColor: colors.border,
              },
            ]}
            value={comment}
            onChangeText={setComment}
            placeholder={t('sources.commentPlaceholder')}
            placeholderTextColor={colors.textMuted}
            multiline
            numberOfLines={3}
          />

          <Pressable
            onPress={handleSave}
            disabled={saving || accuracy === 0 || timeliness === 0}
            style={[
              styles.saveButton,
              { backgroundColor: colors.primary },
              (saving || accuracy === 0 || timeliness === 0) && styles.saveButtonDisabled,
            ]}
          >
            <Text style={styles.saveButtonText}>
              {saving ? t('sources.saving') : t('sources.save')}
            </Text>
          </Pressable>

          {source.ownRating && (
            <Pressable onPress={onDelete} style={styles.deleteRow}>
              <IconTrash size={16} color={colors.danger} />
              <Text style={[styles.deleteText, { color: colors.danger }]}>
                {t('sources.deleteRating')}
              </Text>
            </Pressable>
          )}
        </View>
      )}
    </View>
  );
}

export default function SourcesScreen() {
  const { colors } = useAppTheme();
  const { t } = useTranslation();
  const { sources, isLoading, rateSource, deleteRating } = useSources();
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const toggleExpand = useCallback((id: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedId((prev) => (prev === id ? null : id));
  }, []);

  const handleRate = useCallback(
    (sourceAdapterId: number) =>
      async (accuracy: number, timeliness: number, comment?: string) => {
        await rateSource(sourceAdapterId, {
          numAccuracy: accuracy,
          numTimeliness: timeliness,
          txtComment: comment ?? null,
        });
      },
    [rateSource],
  );

  const handleDelete = useCallback(
    (sourceAdapterId: number) => () => {
      Alert.alert(t('sources.deleteRating'), t('sources.deleteConfirm'), [
        { text: 'Cancel', style: 'cancel' },
        {
          text: t('sources.deleteRating'),
          style: 'destructive',
          onPress: () => deleteRating(sourceAdapterId),
        },
      ]);
    },
    [deleteRating, t],
  );

  return (
    <>
      <Stack.Screen options={{ title: t('sources.title') }} />
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.content}>
            {sources.map((source) => (
              <SourceCard
                key={source.sourceAdapterId}
                source={source}
                expanded={expandedId === source.sourceAdapterId}
                onToggle={() => toggleExpand(source.sourceAdapterId)}
                onRate={handleRate(source.sourceAdapterId)}
                onDelete={handleDelete(source.sourceAdapterId)}
              />
            ))}
          </ScrollView>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: theme.spacing.xl,
    gap: theme.spacing.md,
    paddingBottom: theme.spacing['3xl'],
  },
  sourceCard: {
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    overflow: 'hidden',
  },
  sourceHeader: {
    padding: theme.spacing.lg,
  },
  sourceInfo: {
    gap: theme.spacing.xs,
  },
  sourceName: {
    fontSize: theme.fontSize.md,
    ...theme.font.semibold,
  },
  sourceStats: {
    fontSize: theme.fontSize.sm,
  },
  ratingCount: {
    fontSize: theme.fontSize.xs,
  },
  ratingForm: {
    padding: theme.spacing.lg,
    borderTopWidth: 1,
    gap: theme.spacing.md,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ratingLabel: {
    fontSize: theme.fontSize.sm,
    ...theme.font.medium,
  },
  starRow: {
    flexDirection: 'row',
    gap: theme.spacing.xs,
  },
  commentLabel: {
    fontSize: theme.fontSize.sm,
    ...theme.font.medium,
  },
  commentInput: {
    borderWidth: 1,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    fontSize: theme.fontSize.sm,
    minHeight: 72,
    textAlignVertical: 'top',
  },
  saveButton: {
    paddingVertical: theme.spacing.md,
    borderRadius: theme.radius.md,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: theme.fontSize.md,
    ...theme.font.semibold,
  },
  deleteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    paddingTop: theme.spacing.sm,
  },
  deleteText: {
    fontSize: theme.fontSize.sm,
    ...theme.font.medium,
  },
});
