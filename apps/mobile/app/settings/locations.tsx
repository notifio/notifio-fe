import { IconCurrentLocation, IconHome, IconMapPin, IconPencil, IconPlus, IconRefresh, IconTrash } from '@tabler/icons-react-native';
import { Stack } from 'expo-router';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import type { UserLocation } from '@notifio/api-client';

import { LocationPickerModal } from '../../components/locations/location-picker-modal';
import { Icon } from '../../components/ui/icon';
import { useCurrentPosition } from '../../hooks/use-current-position';
import { useLocations } from '../../hooks/use-locations';
import { confirmDestructive } from '../../lib/confirm';
import { theme } from '../../lib/theme';
import { useAppTheme } from '../../providers/theme-provider';

function formatCoord(lat: number, lng: number): string {
  const ns = lat >= 0 ? 'N' : 'S';
  const ew = lng >= 0 ? 'E' : 'W';
  return `${Math.abs(lat).toFixed(3)}°${ns}, ${Math.abs(lng).toFixed(3)}°${ew}`;
}

export default function LocationsScreen() {
  const { colors } = useAppTheme();
  const { t } = useTranslation();
  const { locations, limit, used, isLoading, canAddMore, addLocation, updateLocation, removeLocation } = useLocations();
  // LOC-2: current GPS sits above the saved-locations list so users can
  // see where the system thinks they are right now even without saving
  // a permanent location.
  const { position, status: positionStatus, refresh: refreshPosition } = useCurrentPosition();

  const [pickerVisible, setPickerVisible] = useState(false);
  const [editingLocation, setEditingLocation] = useState<UserLocation | undefined>();

  const handleAdd = () => {
    setEditingLocation(undefined);
    setPickerVisible(true);
  };

  const handleEdit = useCallback((loc: UserLocation) => {
    setEditingLocation(loc);
    setPickerVisible(true);
  }, []);

  const handleDelete = useCallback((loc: UserLocation) => {
    confirmDestructive({
      t,
      titleKey: 'locations.deleteConfirmTitle',
      descKey: 'locations.deleteConfirm',
      confirmKey: 'locations.deleteLocation',
      onConfirm: () => removeLocation(loc.locationId),
    });
  }, [t, removeLocation]);

  const renderItem = useCallback(
    ({ item }: { item: UserLocation }) => {
      const displayLabel = item.customLabel ?? item.label.name;
      const isHome = item.label.code === 'home';

      return (
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.cardRow}>
            <Icon icon={IconMapPin} size={20} color={colors.primary} />
            <View style={styles.cardText}>
              <View style={styles.cardLabelRow}>
                <Text style={[styles.cardLabel, { color: colors.text }]} numberOfLines={1}>
                  {displayLabel}
                </Text>
                {isHome && (
                  <View style={[styles.homeBadge, { backgroundColor: `${colors.primary}18` }]}>
                    <IconHome size={12} color={colors.primary} />
                  </View>
                )}
              </View>
              <Text style={[styles.cardCoord, { color: colors.textMuted }]}>
                {formatCoord(item.lat, item.lng)}
              </Text>
            </View>
            <Pressable onPress={() => handleEdit(item)} hitSlop={8} style={styles.actionButton}>
              <IconPencil size={16} color={colors.textMuted} />
            </Pressable>
            <Pressable onPress={() => handleDelete(item)} hitSlop={8} style={styles.actionButton}>
              <IconTrash size={16} color={colors.danger} />
            </Pressable>
          </View>
        </View>
      );
    },
    [colors, handleEdit, handleDelete],
  );

  // ── LOC-2: current-position block, rendered above the saved list ──
  const currentBody = (() => {
    if (positionStatus === 'requesting' && !position) {
      return (
        <Text style={[styles.currentMeta, { color: colors.textMuted }]}>
          {t('locations.currentLoading')}
        </Text>
      );
    }
    if (positionStatus === 'denied') {
      return (
        <Text style={[styles.currentMeta, { color: colors.textMuted }]}>
          {t('locations.currentDenied')}
        </Text>
      );
    }
    if (positionStatus === 'unavailable') {
      return (
        <Text style={[styles.currentMeta, { color: colors.textMuted }]}>
          {t('locations.currentUnavailable')}
        </Text>
      );
    }
    if (position) {
      return (
        <>
          <Text style={[styles.currentCoord, { color: colors.text }]}>
            {formatCoord(position.lat, position.lng)}
          </Text>
          {position.accuracyM !== null && (
            <Text style={[styles.currentMeta, { color: colors.textMuted }]}>
              {t('locations.currentAccuracy', { m: Math.round(position.accuracyM).toString() })}
            </Text>
          )}
        </>
      );
    }
    return null;
  })();

  const currentBlock = (
    <View
      style={[styles.currentCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
    >
      <View style={styles.currentHeader}>
        <Icon icon={IconCurrentLocation} size={20} color={colors.primary} />
        <View style={styles.currentText}>
          <Text style={[styles.currentTitle, { color: colors.text }]} numberOfLines={1}>
            {t('locations.currentTitle')}
          </Text>
          {currentBody}
        </View>
        <Pressable
          onPress={() => { void refreshPosition(); }}
          hitSlop={8}
          style={styles.actionButton}
          disabled={positionStatus === 'requesting'}
        >
          {positionStatus === 'requesting' ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <IconRefresh size={16} color={colors.textMuted} />
          )}
        </Pressable>
      </View>
    </View>
  );

  const savedHeader = (
    <View style={styles.savedHeader}>
      <Text style={[styles.savedTitle, { color: colors.text }]}>
        {t('locations.savedTitle')}
      </Text>
      <Text style={[styles.countText, { color: colors.textMuted }]}>
        {t('locations.count', { current: used, max: limit })}
        {!canAddMore ? ` · ${t('locations.limitReached')}` : ''}
      </Text>
    </View>
  );

  return (
    <>
      <Stack.Screen options={{ title: t('locations.title') }} />
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {isLoading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <FlatList
            data={locations}
            renderItem={renderItem}
            keyExtractor={(item) => item.locationId}
            contentContainerStyle={[styles.list, locations.length === 0 && styles.emptyList]}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={
              <View style={styles.listHeader}>
                {currentBlock}
                {savedHeader}
              </View>
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Icon icon={IconMapPin} size={48} color={colors.textMuted} />
                <Text style={[styles.emptyTitle, { color: colors.text }]}>
                  {t('locations.emptyTitle')}
                </Text>
                <Text style={[styles.emptyMessage, { color: colors.textMuted }]}>
                  {t('locations.emptyMessage')}
                </Text>
              </View>
            }
          />
        )}

        {/* Add button */}
        <Pressable
          onPress={handleAdd}
          disabled={!canAddMore}
          style={[styles.fab, { backgroundColor: canAddMore ? colors.primary : colors.textMuted }]}
        >
          <IconPlus size={24} color="#FFFFFF" />
        </Pressable>
      </View>

      <LocationPickerModal
        visible={pickerVisible}
        onClose={() => setPickerVisible(false)}
        onSave={addLocation}
        onUpdate={updateLocation}
        editLocation={editingLocation}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  countText: {
    fontSize: theme.fontSize.xs,
    ...theme.font.medium,
  },
  listHeader: {
    paddingTop: theme.spacing.md,
    gap: theme.spacing.lg,
  },
  // ── LOC-2 current-position block ────────────────────────────────────
  currentCard: {
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    padding: theme.spacing.lg,
  },
  currentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  currentText: {
    flex: 1,
  },
  currentTitle: {
    fontSize: theme.fontSize.sm,
    ...theme.font.medium,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    opacity: 0.7,
  },
  currentCoord: {
    fontSize: theme.fontSize.md,
    ...theme.font.semibold,
    marginTop: 2,
  },
  currentMeta: {
    fontSize: theme.fontSize.xs,
    marginTop: 2,
  },
  // ── Saved-locations section header ─────────────────────────────────
  savedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginTop: theme.spacing.sm,
  },
  savedTitle: {
    fontSize: theme.fontSize.lg,
    ...theme.font.semibold,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    paddingHorizontal: theme.spacing.xl,
    paddingBottom: 100,
    gap: theme.spacing.md,
  },
  emptyList: {
    flex: 1,
  },
  card: {
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    padding: theme.spacing.lg,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  cardText: {
    flex: 1,
  },
  cardLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  cardLabel: {
    fontSize: theme.fontSize.md,
    ...theme.font.medium,
  },
  homeBadge: {
    width: 22,
    height: 22,
    borderRadius: theme.radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardCoord: {
    fontSize: theme.fontSize.xs,
    marginTop: 2,
  },
  actionButton: {
    padding: theme.spacing.xs,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.md,
  },
  emptyTitle: {
    fontSize: theme.fontSize.lg,
    ...theme.font.bold,
  },
  emptyMessage: {
    fontSize: theme.fontSize.md,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    right: theme.spacing.xl,
    bottom: theme.spacing['2xl'],
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
});
