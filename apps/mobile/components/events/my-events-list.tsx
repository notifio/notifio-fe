import { IconAlertTriangle, IconCheck, IconTrash } from '@tabler/icons-react-native';
import { useRouter } from 'expo-router';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Alert, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';

import type { UserEvent } from '@notifio/api-client';
import { sharedColors } from '@notifio/ui';

import { useUserEvents } from '../../hooks/use-user-events';
import { formatDateTime } from '../../lib/format';
import { SPACING } from '../../lib/spacing';
import { theme } from '../../lib/theme';
import { useAppTheme } from '../../providers/theme-provider';
import { EmptyState } from '../ui/empty-state';

function ItemSeparator() {
  return <View style={styles.separator} />;
}

export function MyEventsList() {
  const { colors } = useAppTheme();
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const { events, isLoading, error, refresh, updateEvent, deleteEvent } = useUserEvents();

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

  return (
    <FlatList
      data={events}
      renderItem={renderItem}
      keyExtractor={(item) => item.eventId}
      ItemSeparatorComponent={ItemSeparator}
      contentContainerStyle={[styles.list, events.length === 0 && styles.emptyList]}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={isLoading && events.length > 0}
          onRefresh={refresh}
          tintColor={colors.primary}
        />
      }
      ListEmptyComponent={
        isLoading ? (
          <ActivityIndicator size="large" color={colors.primary} style={styles.loading} />
        ) : (
          <EmptyState icon={IconAlertTriangle} message={t('reminders.tabs.eventsEmpty')} />
        )
      }
    />
  );
}

const styles = StyleSheet.create({
  list: {
    paddingHorizontal: SPACING.screenH,
    paddingBottom: theme.spacing['4xl'],
  },
  emptyList: {
    flex: 1,
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
