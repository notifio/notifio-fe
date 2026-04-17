import { IconCurrentLocation, IconX } from '@tabler/icons-react-native';
import * as ExpoLocation from 'expo-location';
import { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import MapView, { type Region } from 'react-native-maps';

import type { CreateLocationBody, LocationLabel, UpdateLocationBody, UserLocation } from '@notifio/api-client';

import { theme } from '../../lib/theme';
import { useAppTheme } from '../../providers/theme-provider';

const SLOVAKIA_REGION: Region = {
  latitude: 48.67,
  longitude: 19.70,
  latitudeDelta: 4.0,
  longitudeDelta: 4.0,
};

const GPS_DELTA = 0.01;

const LABELS: { value: LocationLabel; label: string }[] = [
  { value: 'home', label: 'Home' },
  { value: 'work', label: 'Work' },
  { value: 'school', label: 'School' },
  { value: 'gym', label: 'Gym' },
  { value: 'other', label: 'Other' },
];

interface LocationPickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (data: CreateLocationBody) => Promise<boolean>;
  onUpdate?: (id: string, data: UpdateLocationBody) => Promise<boolean>;
  editLocation?: UserLocation;
}

export function LocationPickerModal({
  visible,
  onClose,
  onSave,
  onUpdate,
  editLocation,
}: LocationPickerModalProps) {
  const { colors } = useAppTheme();
  const { t } = useTranslation();
  const mapRef = useRef<MapView>(null);
  const isEdit = !!editLocation;

  const [region, setRegion] = useState<Region>(
    editLocation
      ? { latitude: editLocation.lat, longitude: editLocation.lng, latitudeDelta: GPS_DELTA, longitudeDelta: GPS_DELTA }
      : SLOVAKIA_REGION,
  );
  const [label, setLabel] = useState<LocationLabel>(
    (editLocation?.label.code as LocationLabel) ?? 'home',
  );
  const [customLabel, setCustomLabel] = useState(editLocation?.customLabel ?? '');
  const [saving, setSaving] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);

  const handleGps = useCallback(async () => {
    setGpsLoading(true);
    try {
      const { status } = await ExpoLocation.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      const loc = await ExpoLocation.getCurrentPositionAsync({ accuracy: ExpoLocation.Accuracy.Balanced });
      const newRegion: Region = {
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        latitudeDelta: GPS_DELTA,
        longitudeDelta: GPS_DELTA,
      };
      setRegion(newRegion);
      mapRef.current?.animateToRegion(newRegion, 500);
    } finally {
      setGpsLoading(false);
    }
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const body = {
        lat: region.latitude,
        lng: region.longitude,
        label,
        ...(customLabel.trim() ? { customLabel: customLabel.trim() } : {}),
      };

      let success: boolean;
      if (isEdit && onUpdate) {
        success = await onUpdate(editLocation.locationId, body);
      } else {
        success = await onSave(body as CreateLocationBody);
      }
      if (success) onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" statusBarTranslucent>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <Pressable onPress={onClose} hitSlop={8}>
            <IconX size={22} color={colors.text} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            {isEdit ? t('locations.editLocation') : t('locations.addLocation')}
          </Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Map */}
        <View style={styles.mapContainer}>
          <MapView
            ref={mapRef}
            style={styles.map}
            initialRegion={region}
            onRegionChangeComplete={setRegion}
            showsUserLocation
          />
          {/* Center pin overlay */}
          <View style={styles.pinOverlay} pointerEvents="none">
            <View style={[styles.pin, { backgroundColor: colors.primary }]} />
            <View style={[styles.pinShadow, { backgroundColor: colors.primary }]} />
          </View>

          {/* GPS button */}
          <Pressable
            onPress={handleGps}
            style={[styles.gpsButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
          >
            {gpsLoading ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <IconCurrentLocation size={20} color={colors.primary} />
            )}
          </Pressable>
        </View>

        {/* Form */}
        <View style={[styles.form, { borderTopColor: colors.border }]}>
          <Text style={[styles.coordText, { color: colors.textMuted }]}>
            {region.latitude.toFixed(5)}, {region.longitude.toFixed(5)}
          </Text>

          {/* Label pills */}
          <View style={styles.labelRow}>
            {LABELS.map((opt) => (
              <Pressable
                key={opt.value}
                onPress={() => setLabel(opt.value)}
                style={[
                  styles.labelPill,
                  label === opt.value
                    ? { backgroundColor: colors.primary }
                    : { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 },
                ]}
              >
                <Text
                  style={[
                    styles.labelPillText,
                    { color: label === opt.value ? colors.textInverse : colors.text },
                  ]}
                >
                  {opt.label}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Custom label */}
          <TextInput
            value={customLabel}
            onChangeText={setCustomLabel}
            placeholder={t('locations.labelPlaceholder')}
            placeholderTextColor={colors.textMuted}
            style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
          />

          {/* Save */}
          <Pressable
            onPress={handleSave}
            disabled={saving}
            style={[styles.saveButton, { backgroundColor: colors.primary }, saving && styles.disabled]}
          >
            {saving && <ActivityIndicator size="small" color={colors.textInverse} style={styles.spinner} />}
            <Text style={[styles.saveText, { color: colors.textInverse }]}>
              {saving ? t('locations.saving') : t('locations.save')}
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing['4xl'],
    paddingBottom: theme.spacing.md,
    borderBottomWidth: 1,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: theme.fontSize.md,
    ...theme.font.semibold,
  },
  headerSpacer: {
    width: 22,
  },
  mapContainer: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  pinOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pin: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  pinShadow: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 2,
    opacity: 0.3,
  },
  gpsButton: {
    position: 'absolute',
    right: theme.spacing.lg,
    bottom: theme.spacing.lg,
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  form: {
    borderTopWidth: 1,
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  coordText: {
    fontSize: theme.fontSize.xs,
    textAlign: 'center',
  },
  labelRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  labelPill: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radius.full,
  },
  labelPillText: {
    fontSize: theme.fontSize.xs,
    ...theme.font.medium,
  },
  input: {
    height: 44,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    paddingHorizontal: theme.spacing.lg,
    fontSize: theme.fontSize.sm,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: theme.radius.xl,
  },
  saveText: {
    fontSize: theme.fontSize.md,
    ...theme.font.semibold,
  },
  spinner: {
    marginRight: theme.spacing.sm,
  },
  disabled: {
    opacity: 0.6,
  },
});
