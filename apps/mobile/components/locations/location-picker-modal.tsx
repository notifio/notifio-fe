import { IconCurrentLocation, IconLock } from '@tabler/icons-react-native';
import * as ExpoLocation from 'expo-location';
import { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import MapView, { type Region } from 'react-native-maps';

import type { CreateLocationBody, LocationLabel, UpdateLocationBody, UserLocation } from '@notifio/api-client';

import { useMembership } from '../../hooks/use-membership';
import { theme } from '../../lib/theme';
import { useAppTheme } from '../../providers/theme-provider';
import { FullScreenModal } from '../ui/fullscreen-modal';
import { TogglePill } from '../ui/toggle-pill';

const SLOVAKIA_REGION: Region = {
  latitude: 48.67,
  longitude: 19.70,
  latitudeDelta: 4.0,
  longitudeDelta: 4.0,
};

const GPS_DELTA = 0.01;

const LABEL_VALUES: LocationLabel[] = ['home', 'work', 'school', 'gym', 'other'];

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
  const { membership } = useMembership();
  const mapRef = useRef<MapView>(null);
  const isEdit = !!editLocation;
  // LOC-1: BE's `user-location.service.createLocation` rejects customLabel
  // for tiers without the `custom_labels` feature (FREE has none, PLUS+
  // has it). Used to fail with a generic toast when a FREE user typed
  // anything in the box. Gate the input — non-eligible users see a
  // disabled field with a small lock badge instead.
  const canSetCustomLabel = membership?.current?.features.includes('custom_labels') ?? false;

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
      // Don't ship customLabel up if the user isn't entitled — saves a
      // round-trip and prevents the BE rejection error. Users without
      // the feature see the input disabled in the form below anyway.
      const trimmedCustom = customLabel.trim();
      const body = {
        lat: region.latitude,
        lng: region.longitude,
        label,
        ...(trimmedCustom && canSetCustomLabel ? { customLabel: trimmedCustom } : {}),
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
    <FullScreenModal
      visible={visible}
      onClose={onClose}
      title={isEdit ? t('locations.editLocation') : t('locations.addLocation')}
      presentation="fullScreen"
      scrollable={false}
    >
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
          {LABEL_VALUES.map((value) => (
            <TogglePill
              key={value}
              active={label === value}
              label={t(`locations.labels.${value}`)}
              onPress={() => setLabel(value)}
            />
          ))}
        </View>

        {/* Custom label — gated behind PLUS membership */}
        <View>
          <TextInput
            value={canSetCustomLabel ? customLabel : ''}
            onChangeText={canSetCustomLabel ? setCustomLabel : undefined}
            editable={canSetCustomLabel}
            placeholder={
              canSetCustomLabel
                ? t('locations.labelPlaceholder')
                : t('locations.customLabelPlusOnly')
            }
            placeholderTextColor={colors.textMuted}
            style={[
              styles.input,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                color: colors.text,
                paddingRight: canSetCustomLabel ? theme.spacing.lg : 40,
              },
              !canSetCustomLabel && styles.inputDisabled,
            ]}
          />
          {!canSetCustomLabel && (
            <View style={styles.lockBadge} pointerEvents="none">
              <IconLock size={14} color={colors.textMuted} />
            </View>
          )}
        </View>

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
    </FullScreenModal>
  );
}

const styles = StyleSheet.create({
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
  input: {
    height: 44,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    paddingHorizontal: theme.spacing.lg,
    fontSize: theme.fontSize.sm,
  },
  inputDisabled: {
    opacity: 0.55,
  },
  lockBadge: {
    position: 'absolute',
    right: theme.spacing.lg,
    top: 13,
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
