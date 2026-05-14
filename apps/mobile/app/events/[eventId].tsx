import { IconCheck, IconMapPin, IconTrash, IconUsers, IconX } from '@tabler/icons-react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

import type { EventDetail } from '@notifio/api-client';
import { sharedColors } from '@notifio/ui';

import { CredibilityBar } from '../../components/events/credibility-bar';
import { Card } from '../../components/ui/card';
import { Icon } from '../../components/ui/icon';
import { SectionLabel } from '../../components/ui/section-label';
import { useEventDetail } from '../../hooks/use-event-detail';
import { confirmDestructive } from '../../lib/confirm';
import { resolveSourceDisplay } from '../../lib/event-display';
import { formatDateTime } from '../../lib/format';
import { DARK_MAP_STYLE } from '../../lib/map-style-dark';
import { theme, withOpacity } from '../../lib/theme';
import { useAppTheme } from '../../providers/theme-provider';

export default function EventDetailScreen() {
  const { colors, isDark } = useAppTheme();
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const { eventId } = useLocalSearchParams<{ eventId: string }>();

  const {
    event, userVote, isOwner, isLoading, error, archived, voting,
    vote, resolveEvent, removeEvent,
  } = useEventDetail(eventId!);

  const handleResolve = () => {
    confirmDestructive({
      t,
      titleKey: 'eventDetail.owner.resolve',
      descKey: 'eventDetail.owner.resolveConfirm',
      confirmKey: 'eventDetail.owner.resolve',
      onConfirm: async () => {
        const ok = await resolveEvent();
        if (ok) router.back();
      },
    });
  };

  const handleDelete = () => {
    confirmDestructive({
      t,
      titleKey: 'eventDetail.owner.delete',
      descKey: 'eventDetail.owner.deleteConfirm',
      confirmKey: 'eventDetail.owner.delete',
      onConfirm: async () => {
        const ok = await removeEvent();
        if (ok) router.back();
      },
    });
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

  if (error || archived || !event) {
    return (
      <>
        <Stack.Screen options={{ title: t('eventDetail.title') }} />
        <View style={[styles.centered, { backgroundColor: colors.background }]}>
          <Icon icon={IconMapPin} size={48} color={colors.textMuted} />
          <Text style={[styles.errorText, { color: colors.textMuted }]}>
            {archived
              ? t('eventDetail.archived')
              : (error ?? t('eventDetail.notFound'))}
          </Text>
        </View>
      </>
    );
  }

  const isResolved = event.eventTo !== null && new Date(event.eventTo) <= new Date();

  // api-client `EventDetail` is stale (sourceId only); BE projects
  // `source`, `address`, `locality` since shared 0.29. Widen the cast
  // once and reuse across the header pill, attribution row, and the
  // new address / locality rows. Follow-up to mirror the canonical
  // shape lives in CLAUDE.md.
  const eventExt = event as EventDetail & {
    source?: { code?: string | null; name?: string | null; label?: string | null; url?: string | null } | null;
    address?: string | null;
    locality?: string | null;
  };
  const sourceCode = eventExt.source?.code ?? null;
  const source = resolveSourceDisplay(sourceCode, t);
  const address = eventExt.address ?? null;
  const locality = eventExt.locality ?? null;
  const showLocality =
    !!locality &&
    (!address || !address.toLowerCase().includes(locality.toLowerCase()));

  // Community detection — fragile short-term heuristic that matches
  // web's behaviour plus the `cod_source_id` prefix fallback from
  // AUDIT-COMMUNITY-EVENT-FLAG.md. Catches both Path 2 (user reports
  // without a provider, BE writes `cod_source_adapter='user_report'`)
  // AND Path 1 (user attributes a real provider like BVS, but
  // `cod_source_id` still carries the `user_report:` prefix per
  // user-event.service.ts:320). Replace with `event.isUserReported`
  // once BE projects it (see CLAUDE.md BE follow-ups). Mobile is
  // intentionally ahead of web here — web ports back when canonical.
  const isCommunity =
    sourceCode === 'user_report' ||
    event.sourceId?.startsWith('user_report:') === true;

  return (
    <>
      <Stack.Screen options={{ title: t('eventDetail.title') }} />
      <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
        {/* Map preview — non-interactive, brand-orange marker at the
            event's coords. Mirrors web's EventMapHeader; iOS uses
            Apple Maps native dark mode, Android uses the same custom
            dark JSON the main map tab uses. */}
        <View style={styles.mapPreview}>
          <MapView
            style={styles.mapPreviewMap}
            initialRegion={{
              latitude: event.location.lat,
              longitude: event.location.lng,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
            scrollEnabled={false}
            zoomEnabled={false}
            rotateEnabled={false}
            pitchEnabled={false}
            userInterfaceStyle={isDark ? 'dark' : 'light'}
            customMapStyle={Platform.OS === 'android' && isDark ? DARK_MAP_STYLE : undefined}
          >
            <Marker
              coordinate={{ latitude: event.location.lat, longitude: event.location.lng }}
              pinColor="#FF7A2F"
            />
          </MapView>
        </View>

        {/* Category + status */}
        <View style={styles.headerRow}>
          <View style={[styles.categoryBadge, { backgroundColor: colors.surface }]}>
            <Text style={[styles.categoryText, { color: colors.text }]}>
              {event.category.name}
              {event.subcategory ? ` — ${event.subcategory.name}` : ''}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: isResolved ? colors.border : withOpacity(sharedColors.success, 0.125) }]}>
            <Text style={[styles.statusText, { color: isResolved ? colors.textMuted : sharedColors.success }]}>
              {isResolved ? t('eventDetail.status.resolved') : t('eventDetail.status.active')}
            </Text>
          </View>
          {isCommunity && (
            <View style={styles.communityPill}>
              <IconUsers size={12} color="#8B5CF6" />
              <Text style={styles.communityPillText}>{t('alerts.sourceCommunity')}</Text>
            </View>
          )}
        </View>

        {/* Title + description */}
        <Text style={[styles.title, { color: colors.text }]}>{event.type.name}</Text>

        {/* Details card */}
        <SectionLabel label={t('eventDetail.details.location')} />
        <Card>
          <View style={styles.detailRows}>
            {address && (
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: colors.textMuted }]}>{t('events.detail.address')}</Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>{address}</Text>
              </View>
            )}
            {showLocality && locality && (
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: colors.textMuted }]}>{t('events.detail.locality')}</Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>{locality}</Text>
              </View>
            )}
            {source && (
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: colors.textMuted }]}>{t('alerts.sourceShortLabel')}</Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>{source.full}</Text>
              </View>
            )}
            {event.materiality && (
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: colors.textMuted }]}>{t('eventDetail.details.radius')}</Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>{event.materiality.label}</Text>
              </View>
            )}
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: colors.textMuted }]}>{t('eventDetail.details.reportedAt')}</Text>
              <Text style={[styles.detailValue, { color: colors.text }]}>{formatDateTime(event.eventFrom, i18n.language)}</Text>
            </View>
            {event.eventTo && (
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: colors.textMuted }]}>
                  {isResolved ? t('eventDetail.details.resolvedAt') : t('eventDetail.details.expiresAt')}
                </Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>{formatDateTime(event.eventTo, i18n.language)}</Text>
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
                userVote?.voted && userVote.isValid && { backgroundColor: withOpacity(sharedColors.success, 0.125) },
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
                userVote?.voted && userVote.isValid === false && { backgroundColor: withOpacity(sharedColors.danger, 0.125) },
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
            <SectionLabel label={t('eventDetail.owner.sectionTitle')} />
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
  mapPreview: {
    height: 160,
    borderRadius: theme.radius.lg,
    overflow: 'hidden',
    marginTop: theme.spacing.md,
  },
  mapPreviewMap: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.lg,
  },
  communityPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radius.full,
    backgroundColor: 'rgba(139,92,246,0.15)',
  },
  communityPillText: {
    fontSize: theme.fontSize.xs,
    ...theme.font.semibold,
    color: '#8B5CF6',
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
