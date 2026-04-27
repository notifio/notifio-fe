import { IconHome, IconMapPin, IconPencil, IconPlus, IconTrash } from '@tabler/icons-react-native';
import { Stack } from 'expo-router';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import type { UserLocation } from '@notifio/api-client';

import { LocationPickerModal } from '../../components/locations/location-picker-modal';
import { Icon } from '../../components/ui/icon';
import { useLocations } from '../../hooks/use-locations';
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
    Alert.alert(t('locations.deleteConfirmTitle'), t('locations.deleteConfirm'), [
      { text: t('common.ok'), style: 'cancel' },
      { text: t('locations.deleteLocation'), style: 'destructive', onPress: () => removeLocation(loc.locationId) },
    ]);
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

  return (
    <>
      <Stack.Screen options={{ title: t('locations.title') }} />
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Count header */}
        <View style={styles.countHeader}>
          <Text style={[styles.countText, { color: colors.textMuted }]}>
            {t('locations.count', { current: used, max: limit })}
          </Text>
          {!canAddMore && (
            <Text style={[styles.limitText, { color: colors.primary }]}>
              {t('locations.limitReached')}
            </Text>
          )}
        </View>

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
  countHeader: {
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    gap: theme.spacing.xs,
  },
  countText: {
    fontSize: theme.fontSize.sm,
    ...theme.font.medium,
  },
  limitText: {
    fontSize: theme.fontSize.xs,
    ...theme.font.medium,
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
