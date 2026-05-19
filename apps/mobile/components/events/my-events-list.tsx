import { IconCheck, IconMapPin, IconTrash } from '@tabler/icons-react-native';
import { useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Alert, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';

import type { UserEvent } from '@notifio/api-client';
import { useUserEvents } from '@notifio/shared/hooks';
import { sharedColors } from '@notifio/ui';

import { formatDateTime } from '../../lib/format';
import { SPACING } from '../../lib/spacing';
import { theme } from '../../lib/theme';
import { useAppTheme } from '../../providers/theme-provider';

type Lifecycle = 'active' | 'resolved' | 'all';
const LIFECYCLE_OPTIONS: readonly Lifecycle[] = ['active', 'resolved', 'all'];

function ItemSeparator() {
  return <View style={styles.separator} />;
}

export function MyEventsList() {
  const { colors } = useAppTheme();
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const { events, isLoading, error, refresh, updateEvent, deleteEvent } = useUserEvents();

  // Lifecycle filter: BE has no `?status=` on /events/mine. UserEvent
  // carries only `isResolved: boolean` (2-state), so the strip exposes
  // Active / Resolved / All — no `upcoming` (user-reported events
  // don't have an upcoming state today). Client-side filter.
  const [lifecycle, setLifecycle] = useState<Lifecycle>('active');
  const filteredEvents = useMemo(() => {
    if (lifecycle === 'all') return events;
    if (lifecycle === 'active') return events.filter((e) => !e.isResolved);
    return events.filter((e) => e.isResolved);
  }, [events, lifecycle]);

  const handlePress = useCallback(
    (event: UserEvent) => {
      router.push(`/events/${event.eventId}`);
    },
    [router],
  );

  const handleResolve = useCallback(
    (eventId: string) => {
      void updateEvent(eventId, { resolved: true });
    },
    [updateEvent],
  );

  const confirmDelete = useCallback(
    (eventId: string) => {
      Alert.alert(
        t('myEvents.confirmDelete.title'),
        t('myEvents.confirmDelete.description'),
        [
          { text: t('common.cancel'), style: 'cancel' },
          {
            text: t('common.delete'),
            style: 'destructive',
            onPress: () => { void deleteEvent(eventId); },
          },
        ],
      );
    },
    [deleteEvent, t],
  );

  const renderItem = useCallback(
    ({ item }: { item: UserEvent }) => {
      const resolved = item.isResolved;
      return (
        <Pressable
          onPress={() => handlePress(item)}
          style={({ pressed }) => [
            styles.row,
            { backgroundColor: colors.surface, borderColor: colors.border },
            pressed && styles.pressed,
          ]}
        >
          <View style={styles.rowText}>
            <View style={styles.titleRow}>
              <Text
                style={[styles.title, { color: colors.text }]}
                numberOfLines={2}
              >
                {item.subcategoryName || item.title}
              </Text>
              <View
                style={[
                  styles.statusBadge,
                  resolved
                    ? { backgroundColor: colors.severity.info.bg }
                    : { backgroundColor: colors.severity.warning.bg },
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    {
                      color: resolved ? colors.severity.info.text : colors.severity.warning.text,
                    },
                  ]}
                >
                  {resolved ? t('event.status.resolved') : t('event.status.active')}
                </Text>
              </View>
            </View>
            <Text style={[styles.meta, { color: colors.textMuted }]}>
              {formatDateTime(item.createdAt, i18n.language)}
            </Text>
          </View>

          {/* Inline actions — resolve only when not yet resolved;
              delete always available. Inner Pressables intercept the
              tap so the row's onPress (navigate) doesn't also fire. */}
          <View style={styles.actions}>
            {!resolved && (
              <Pressable
                hitSlop={8}
                onPress={() => handleResolve(item.eventId)}
                style={styles.actionButton}
              >
                <IconCheck size={18} color={sharedColors.success} />
              </Pressable>
            )}
            <Pressable
              hitSlop={8}
              onPress={() => confirmDelete(item.eventId)}
              style={styles.actionButton}
            >
              <IconTrash size={18} color={colors.danger} />
            </Pressable>
          </View>
        </Pressable>
      );
    },
    [colors, handlePress, handleResolve, confirmDelete, t, i18n.language],
  );

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={[styles.errorText, { color: colors.danger }]}>{error}</Text>
      </View>
    );
  }

  // Empty state has a CTA → map tab (reports are created from map,
  // not from this tab). Used as ListEmptyComponent below.
  const renderEmpty = () =>
    isLoading ? (
      <ActivityIndicator size="large" color={colors.primary} style={styles.loading} />
    ) : (
      <View style={styles.empty}>
        <IconMapPin size={40} color={colors.textMuted} strokeWidth={1.6} />
        <Text style={[styles.emptyTitle, { color: colors.text }]}>
          {t('localEmpty.noReports.title')}
        </Text>
        <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>
          {t('localEmpty.noReports.subtitle')}
        </Text>
        <Pressable
          onPress={() => router.push('/(tabs)/map')}
          style={[styles.emptyCta, { backgroundColor: colors.primary }]}
        >
          <IconMapPin size={16} color="#FFFFFF" />
          <Text style={styles.emptyCtaText}>{t('localEmpty.noReports.openMap')}</Text>
        </Pressable>
      </View>
    );

  return (
    <View style={styles.container}>
      {/* Lifecycle strip — Active / Resolved / All. Equal-width row
          mirrors the AlertList sub-tab pattern (post-b3e6197). No
          filter sheet here — BE has no scope/category params and the
          user-reported event set is small enough that lifecycle alone
          covers the practical use cases. */}
      <View style={styles.lifecycleRow}>
        {LIFECYCLE_OPTIONS.map((key) => {
          const active = lifecycle === key;
          return (
            <Pressable
              key={key}
              onPress={() => setLifecycle(key)}
              style={styles.lifecycleTab}
            >
              <Text
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.85}
                style={[
                  styles.lifecycleText,
                  {
                    color: active ? colors.primary : colors.textMuted,
                    fontWeight: active ? '600' : '500',
                  },
                ]}
              >
                {t(`notificationsPage.lifecycle.${key}`)}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <FlatList
        data={filteredEvents}
        renderItem={renderItem}
        keyExtractor={(item) => item.eventId}
        ItemSeparatorComponent={ItemSeparator}
        contentContainerStyle={[styles.list, filteredEvents.length === 0 && styles.emptyList]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading && events.length > 0}
            onRefresh={refresh}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={renderEmpty}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  lifecycleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.subControlPadV,
    marginBottom: SPACING.subControlBottom,
  },
  lifecycleTab: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 4,
    paddingVertical: 6,
  },
  lifecycleText: {
    fontSize: 14,
  },
  list: {
    paddingBottom: theme.spacing['4xl'],
  },
  emptyList: {
    flex: 1,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.xl,
    gap: theme.spacing.sm,
  },
  emptyTitle: {
    fontSize: theme.fontSize.md,
    ...theme.font.semibold,
    marginTop: theme.spacing.sm,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: theme.fontSize.sm,
    textAlign: 'center',
  },
  emptyCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.lg,
    marginTop: theme.spacing.md,
  },
  emptyCtaText: {
    color: '#FFFFFF',
    fontSize: theme.fontSize.sm,
    ...theme.font.semibold,
  },
  separator: {
    height: SPACING.cardGap,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.md,
    padding: SPACING.cardPad,
    borderRadius: theme.radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
  },
  pressed: {
    opacity: 0.7,
  },
  rowText: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    flexShrink: 0,
  },
  actionButton: {
    padding: theme.spacing.xs,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.sm,
  },
  title: {
    flex: 1,
    fontSize: theme.fontSize.sm,
    ...theme.font.medium,
  },
  statusBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.radius.full,
  },
  statusText: {
    fontSize: 10,
    ...theme.font.medium,
  },
  meta: {
    fontSize: theme.fontSize.xs,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.md,
  },
  errorText: {
    fontSize: theme.fontSize.md,
    textAlign: 'center',
  },
  loading: {
    marginTop: theme.spacing['3xl'],
  },
});
