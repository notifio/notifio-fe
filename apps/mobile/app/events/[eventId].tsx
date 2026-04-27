import { IconCheck, IconMapPin, IconTrash, IconX } from '@tabler/icons-react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { sharedColors } from '@notifio/ui';

import { CredibilityBar } from '../../components/events/credibility-bar';
import { Card } from '../../components/ui/card';
import { Icon } from '../../components/ui/icon';
import { SectionLabel } from '../../components/ui/section-label';
import { useEventDetail } from '../../hooks/use-event-detail';
import { theme } from '../../lib/theme';
import { useAppTheme } from '../../providers/theme-provider';

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

export default function EventDetailScreen() {
  const { colors } = useAppTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const { eventId } = useLocalSearchParams<{ eventId: string }>();

  const {
    event, userVote, isOwner, isLoading, error, voting,
    vote, resolveEvent, removeEvent,
  } = useEventDetail(eventId!);

  const handleResolve = () => {
    Alert.alert(t('eventDetail.owner.resolve'), t('eventDetail.owner.resolveConfirm'), [
      { text: t('common.ok'), style: 'cancel' },
      { text: t('eventDetail.owner.resolve'), onPress: async () => {
        const ok = await resolveEvent();
        if (ok) router.back();
      }},
    ]);
  };

  const handleDelete = () => {
    Alert.alert(t('eventDetail.owner.delete'), t('eventDetail.owner.deleteConfirm'), [
      { text: t('common.ok'), style: 'cancel' },
      { text: t('eventDetail.owner.delete'), style: 'destructive', onPress: async () => {
        const ok = await removeEvent();
        if (ok) router.back();
      }},
    ]);
  };

  if (isLoading) {
    return (
      <>
        <Stack.Screen options={{ title: t('eventDetail.title') }} />
        <View style={[styles.centered, { backgroundColor: colors.background }]}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </>
    );
  }

  if (error || !event) {
    return (
      <>
        <Stack.Screen options={{ title: t('eventDetail.title') }} />
        <View style={[styles.centered, { backgroundColor: colors.background }]}>
          <Icon icon={IconMapPin} size={48} color={colors.textMuted} />
          <Text style={[styles.errorText, { color: colors.textMuted }]}>
            {error ?? 'Event not found'}
          </Text>
        </View>
      </>
    );
  }

  const isResolved = event.eventTo !== null && new Date(event.eventTo) <= new Date();

  return (
    <>
      <Stack.Screen options={{ title: t('eventDetail.title') }} />
      <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
        {/* Category + status */}
        <View style={styles.headerRow}>
          <View style={[styles.categoryBadge, { backgroundColor: colors.surface }]}>
            <Text style={[styles.categoryText, { color: colors.text }]}>
              {event.category.name}
              {event.subcategory ? ` — ${event.subcategory.name}` : ''}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: isResolved ? colors.border : `${sharedColors.success}20` }]}>
            <Text style={[styles.statusText, { color: isResolved ? colors.textMuted : sharedColors.success }]}>
              {isResolved ? t('eventDetail.status.resolved') : t('eventDetail.status.active')}
            </Text>
          </View>
        </View>

        {/* Title + description */}
        <Text style={[styles.title, { color: colors.text }]}>{event.type.name}</Text>

        {/* Details card */}
        <SectionLabel label={t('eventDetail.details.location')} />
        <Card>
          <View style={styles.detailRows}>
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: colors.textMuted }]}>{t('eventDetail.details.location')}</Text>
              <Text style={[styles.detailValue, { color: colors.text }]}>
                {event.location.lat.toFixed(4)}°, {event.location.lng.toFixed(4)}°
              </Text>
            </View>
            {event.materiality && (
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: colors.textMuted }]}>{t('eventDetail.details.radius')}</Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>{event.materiality.label}</Text>
              </View>
            )}
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: colors.textMuted }]}>{t('eventDetail.details.reportedAt')}</Text>
              <Text style={[styles.detailValue, { color: colors.text }]}>{formatDate(event.eventFrom)}</Text>
            </View>
            {event.eventTo && (
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: colors.textMuted }]}>
                  {isResolved ? t('eventDetail.details.resolvedAt') : t('eventDetail.details.expiresAt')}
                </Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>{formatDate(event.eventTo)}</Text>
              </View>
            )}
          </View>
        </Card>

        {/* Credibility */}
        <SectionLabel label={t('eventDetail.credibility.title')} />
        <Card>
          <CredibilityBar
            votesValid={event.votes.valid}
            votesInvalid={event.votes.invalid}
            total={event.votes.total}
            score={event.votes.score}
          />
        </Card>

        {/* Vote buttons */}
        {!isResolved && (
          <View style={styles.voteRow}>
            <Pressable
              onPress={() => vote(true)}
              disabled={voting || userVote?.voted}
              style={[
                styles.voteButton,
                { borderColor: sharedColors.success },
                userVote?.voted && userVote.isValid && { backgroundColor: `${sharedColors.success}20` },
                (voting || (userVote?.voted && !userVote.isValid)) && styles.voteDimmed,
              ]}
            >
              <IconCheck size={18} color={sharedColors.success} />
              <Text style={[styles.voteText, { color: sharedColors.success }]}>{t('eventDetail.vote.confirm')}</Text>
            </Pressable>
            <Pressable
              onPress={() => vote(false)}
              disabled={voting || userVote?.voted}
              style={[
                styles.voteButton,
                { borderColor: sharedColors.danger },
                userVote?.voted && userVote.isValid === false && { backgroundColor: `${sharedColors.danger}20` },
                (voting || (userVote?.voted && userVote.isValid !== false)) && styles.voteDimmed,
              ]}
            >
              <IconX size={18} color={sharedColors.danger} />
              <Text style={[styles.voteText, { color: sharedColors.danger }]}>{t('eventDetail.vote.deny')}</Text>
            </Pressable>
          </View>
        )}

        {/* Owner actions */}
        {isOwner && !isResolved && (
          <>
            <SectionLabel label="Owner Actions" />
            <Card>
              <Pressable onPress={handleResolve} style={styles.ownerRow}>
                <IconCheck size={18} color={colors.primary} />
                <Text style={[styles.ownerText, { color: colors.primary }]}>{t('eventDetail.owner.resolve')}</Text>
              </Pressable>
            </Card>
            <View style={styles.deleteSection}>
              <Pressable onPress={handleDelete} style={styles.ownerRow}>
                <IconTrash size={18} color={colors.danger} />
                <Text style={[styles.ownerText, { color: colors.danger }]}>{t('eventDetail.owner.delete')}</Text>
              </Pressable>
            </View>
          </>
        )}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.md,
  },
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: theme.spacing.xl,
    paddingBottom: theme.spacing['4xl'],
  },
  errorText: {
    fontSize: theme.fontSize.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.lg,
  },
  categoryBadge: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radius.full,
  },
  categoryText: {
    fontSize: theme.fontSize.xs,
    ...theme.font.semibold,
  },
  statusBadge: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radius.full,
  },
  statusText: {
    fontSize: theme.fontSize.xs,
    ...theme.font.semibold,
  },
  title: {
    marginTop: theme.spacing.lg,
    fontSize: theme.fontSize.xl,
    ...theme.font.bold,
  },
  detailRows: {
    gap: theme.spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: theme.fontSize.sm,
  },
  detailValue: {
    fontSize: theme.fontSize.sm,
    ...theme.font.medium,
  },
  voteRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginTop: theme.spacing.lg,
  },
  voteButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.radius.xl,
    borderWidth: 1.5,
  },
  voteText: {
    fontSize: theme.fontSize.md,
    ...theme.font.semibold,
  },
  voteDimmed: {
    opacity: 0.4,
  },
  ownerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  ownerText: {
    fontSize: theme.fontSize.md,
    ...theme.font.medium,
  },
  deleteSection: {
    marginTop: theme.spacing.md,
  },
});
