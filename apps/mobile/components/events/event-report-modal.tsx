import { IconCrown, IconCurrentLocation } from '@tabler/icons-react-native';
import * as ExpoLocation from 'expo-location';
import { useCallback, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import MapView, { type Region } from 'react-native-maps';

import type { UserEventCategory } from '@notifio/api-client';
import { SLOVAKIA_CENTER } from '@notifio/shared/geo';
import { useEventCategories, useMembership } from '@notifio/shared/hooks';

import { api } from '../../lib/api';
import { theme, withOpacity } from '../../lib/theme';
import { showToast } from '../../lib/toast';
import { useAppTheme } from '../../providers/theme-provider';
import { FullScreenModal } from '../ui/fullscreen-modal';

const GPS_DELTA = 0.01;

// BE returns `providerRequired` + `providers` for outage_* subcategories
// (REQUEST-3, BACKLOG 7.5.2026) but @notifio/shared 0.31 hasn't bumped
// `UserEventCategorySchema` to include them yet. Local extension until
// the shared bump lands; remove once the schema catches up.
type ProviderOption = { code: string; name: string };
type CategoryWithProvider = UserEventCategory & {
  providerRequired?: boolean;
  providers?: ProviderOption[];
};

interface EventReportModalProps {
  visible: boolean;
  onClose: () => void;
  onCreated: () => void;
  initialCenter?: { lat: number; lng: number };
}

export function EventReportModal({ visible, onClose, onCreated, initialCenter }: EventReportModalProps) {
  const { colors } = useAppTheme();
  const { t } = useTranslation();
  const mapRef = useRef<MapView>(null);

  const { categories, isLoading: catsLoading, error: catsError, retry: retryCategories } = useEventCategories();
  const { tier } = useMembership();
  const canSubmit = tier === 'PLUS' || tier === 'PRO';

  const [selectedCategory, setSelectedCategory] = useState<CategoryWithProvider | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<ProviderOption | null>(null);
  const [region, setRegion] = useState<Region>({
    latitude: initialCenter?.lat ?? SLOVAKIA_CENTER.lat,
    longitude: initialCenter?.lng ?? SLOVAKIA_CENTER.lng,
    latitudeDelta: GPS_DELTA,
    longitudeDelta: GPS_DELTA,
  });
  const [submitting, setSubmitting] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);

  // Group categories by categoryCode. Cast to widen for the
  // `providerRequired`/`providers` fields BE emits (see CategoryWithProvider).
  const groups = useMemo(() => {
    const map = new Map<string, CategoryWithProvider[]>();
    for (const cat of categories as CategoryWithProvider[]) {
      const group = map.get(cat.categoryCode) ?? [];
      group.push(cat);
      map.set(cat.categoryCode, group);
    }
    return [...map.entries()].map(([key, items]) => ({ key, items }));
  }, [categories]);

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

  const providerRequired = selectedCategory?.providerRequired ?? false;
  const canSubmitForm =
    !!selectedCategory && (!providerRequired || !!selectedProvider);

  const handleSubmit = async () => {
    if (!selectedCategory || submitting) return;
    if (providerRequired && !selectedProvider) return;
    setSubmitting(true);
    try {
      await api.createEvent({
        subcategoryCode: selectedCategory.code,
        title: selectedCategory.name,
        lat: region.latitude,
        lng: region.longitude,
        ...(selectedProvider ? { providerCode: selectedProvider.code } : {}),
      } as Parameters<typeof api.createEvent>[0]);
      showToast.success(t('eventReport.success'));
      onCreated();
      onClose();
      setSelectedCategory(null);
      setSelectedProvider(null);
    } catch {
      showToast.error(t('eventReport.error'));
    } finally {
      setSubmitting(false);
    }
  };

  const footer = canSubmit ? (
    <Pressable
      onPress={handleSubmit}
      disabled={!canSubmitForm || submitting}
      style={[styles.submitButton, { backgroundColor: colors.primary }, (!canSubmitForm || submitting) && styles.disabled]}
    >
      {submitting && <ActivityIndicator size="small" color={colors.textInverse} style={styles.spinner} />}
      <Text style={[styles.submitText, { color: colors.textInverse }]}>
        {submitting ? t('eventReport.submitting') : t('eventReport.submit')}
      </Text>
    </Pressable>
  ) : (
    <View style={[styles.upsellCard, { borderColor: colors.border, backgroundColor: colors.surface }]}>
      <View style={[styles.upsellIcon, { backgroundColor: withOpacity(colors.primary, 0.094) }]}>
        <IconCrown size={24} color={colors.primary} />
      </View>
      <Text style={[styles.upsellTitle, { color: colors.text }]}>{t('eventReport.upsell.title')}</Text>
      <Text style={[styles.upsellDesc, { color: colors.textMuted }]}>
        {t('eventReport.upsell.description')}
      </Text>
      <Pressable
        onPress={() => showToast.info(t('common.comingSoon'), t('upsell.upgradeSoon'))}
        style={[styles.upsellButton, { backgroundColor: colors.primary }]}
      >
        <Text style={[styles.upsellButtonText, { color: colors.textInverse }]}>{t('eventReport.upsell.cta')}</Text>
      </Pressable>
    </View>
  );

  return (
    <FullScreenModal
      visible={visible}
      onClose={onClose}
      title={t('eventReport.title')}
      presentation="fullScreen"
      footer={footer}
    >
      <View style={styles.scrollContent}>
        {/* Category picker */}
        <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>
          {t('eventReport.selectCategory')}
        </Text>

        {catsLoading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : catsError ? (
          <Pressable onPress={retryCategories} style={[styles.errorBox, { backgroundColor: colors.severity.critical.bg }]}>
            <Text style={[styles.errorText, { color: colors.danger }]}>{catsError}</Text>
          </Pressable>
        ) : (
          <View style={styles.categoryList}>
            {groups.map(({ key, items }) => (
              <View key={key}>
                <Text style={[styles.groupLabel, { color: colors.textMuted }]}>{key}</Text>
                {items.map((cat) => {
                  const isSelected = selectedCategory?.code === cat.code;
                  return (
                    <Pressable
                      key={cat.code}
                      onPress={() => {
                        setSelectedCategory(cat);
                        setSelectedProvider(null);
                      }}
                      style={[
                        styles.categoryRow,
                        { borderColor: isSelected ? colors.primary : colors.border },
                        isSelected && { backgroundColor: withOpacity(colors.primary, 0.063) },
                      ]}
                    >
                      <Text style={[styles.categoryName, { color: isSelected ? colors.primary : colors.text }]}>
                        {cat.name}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            ))}
          </View>
        )}

        {/* Provider picker — only when subcategory requires it (e.g. internet/water/electric/heat/gas outages) */}
        {providerRequired && selectedCategory?.providers && selectedCategory.providers.length > 0 && (
          <>
            <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>
              {t('eventReport.selectProvider')}
            </Text>
            <View style={styles.categoryList}>
              {selectedCategory.providers.map((p) => {
                const isSelected = selectedProvider?.code === p.code;
                return (
                  <Pressable
                    key={p.code}
                    onPress={() => setSelectedProvider(p)}
                    style={[
                      styles.categoryRow,
                      { borderColor: isSelected ? colors.primary : colors.border },
                      isSelected && { backgroundColor: withOpacity(colors.primary, 0.063) },
                    ]}
                  >
                    <Text style={[styles.categoryName, { color: isSelected ? colors.primary : colors.text }]}>
                      {p.name}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </>
        )}

        {/* Map */}
        <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>
          {t('eventReport.location')}
        </Text>
        <View style={styles.mapWrapper}>
          <MapView
            ref={mapRef}
            style={styles.map}
            initialRegion={region}
            onRegionChangeComplete={setRegion}
            showsUserLocation
          />
          <View style={styles.pinOverlay} pointerEvents="none">
            <View style={[styles.pin, { backgroundColor: colors.primary }]} />
            <View style={[styles.pinShadow, { backgroundColor: colors.primary }]} />
          </View>
          <Pressable
            onPress={handleGps}
            style={[styles.gpsButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
          >
            {gpsLoading ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <IconCurrentLocation size={18} color={colors.primary} />
            )}
          </Pressable>
        </View>
        <Text style={[styles.coordText, { color: colors.textMuted }]}>
          {region.latitude.toFixed(5)}, {region.longitude.toFixed(5)}
        </Text>
      </View>
    </FullScreenModal>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.xl,
    gap: theme.spacing.md,
  },
  sectionLabel: {
    fontSize: theme.fontSize.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    ...theme.font.semibold,
    marginTop: theme.spacing.sm,
  },
  loadingBox: {
    paddingVertical: theme.spacing['2xl'],
    alignItems: 'center',
  },
  errorBox: {
    padding: theme.spacing.lg,
    borderRadius: theme.radius.lg,
  },
  errorText: {
    fontSize: theme.fontSize.sm,
  },
  categoryList: {
    gap: theme.spacing.lg,
  },
  groupLabel: {
    fontSize: theme.fontSize.xs,
    marginBottom: theme.spacing.xs,
    textTransform: 'capitalize',
  },
  categoryRow: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    marginBottom: theme.spacing.xs,
  },
  categoryName: {
    fontSize: theme.fontSize.md,
    ...theme.font.medium,
  },
  mapWrapper: {
    height: 220,
    borderRadius: theme.radius.lg,
    overflow: 'hidden',
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
    right: theme.spacing.sm,
    bottom: theme.spacing.sm,
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  coordText: {
    marginTop: theme.spacing.xs,
    fontSize: theme.fontSize.xs,
    textAlign: 'center',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: theme.radius.xl,
  },
  submitText: {
    fontSize: theme.fontSize.md,
    ...theme.font.semibold,
  },
  spinner: {
    marginRight: theme.spacing.sm,
  },
  disabled: {
    opacity: 0.5,
  },
  upsellCard: {
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    borderStyle: 'dashed',
    padding: theme.spacing.xl,
    alignItems: 'center',
  },
  upsellIcon: {
    width: 48,
    height: 48,
    borderRadius: theme.radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  upsellTitle: {
    marginTop: theme.spacing.md,
    fontSize: theme.fontSize.md,
    ...theme.font.semibold,
  },
  upsellDesc: {
    marginTop: theme.spacing.xs,
    fontSize: theme.fontSize.sm,
    textAlign: 'center',
  },
  upsellButton: {
    marginTop: theme.spacing.lg,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.radius.lg,
  },
  upsellButtonText: {
    fontSize: theme.fontSize.sm,
    ...theme.font.medium,
  },
});
