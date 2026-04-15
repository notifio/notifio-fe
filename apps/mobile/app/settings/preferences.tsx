import type { Icon } from '@tabler/icons-react-native';
import { IconBell, IconMapPin } from '@tabler/icons-react-native';
import * as Location from 'expo-location';
import { Stack } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Linking, Pressable, StyleSheet, Text, View } from 'react-native';

import type { NotificationCategoryResponse } from '@notifio/api-client';

import { Card } from '../../components/ui/card';
import { AppIcon } from '../../components/ui/icon';
import { ScreenLayout } from '../../components/ui/screen-layout';
import { SectionLabel } from '../../components/ui/section-label';
import { SelectableRow } from '../../components/ui/selectable-row';
import { ToggleRow } from '../../components/ui/toggle-row';
import { usePreferences } from '../../hooks/use-preferences';
import { CATEGORY_GROUPS } from '../../lib/category-groups';
import { theme } from '../../lib/theme';
import { useAppTheme } from '../../providers/theme-provider';
import {
  deactivateDevice,
  getFcmToken,
  getStoredDeviceId,
  registerDeviceWithBackend,
  requestPermissions,
} from '../../services/push-notifications';

const THEME_OPTIONS = [
  { value: 'system' as const, key: 'settingsOptions.system' },
  { value: 'light' as const, key: 'settingsOptions.light' },
  { value: 'dark' as const, key: 'settingsOptions.dark' },
];

const UNITS_OPTIONS = [
  { value: 'metric' as const, key: 'settingsOptions.metric' },
  { value: 'imperial' as const, key: 'settingsOptions.imperial' },
];

interface ResolvedGroup {
  groupKey: string;
  groupLabel: string;
  icon: Icon;
  categories: NotificationCategoryResponse[];
}

type PermissionState = 'checking' | 'granted' | 'denied' | 'default';

export default function PreferencesScreen() {
  const { colors } = useAppTheme();

  const { t } = useTranslation();
  const {
    preferences,
    isLoading,
    saving,
    error,
    hasChanges,
    toggleItem,
    toggleCategory,
    setDisplay,
    savePreferences,
    cancelChanges,
  } = usePreferences();

  // ── Push permission state ──────────────────────────────────────────
  const [pushState, setPushState] = useState<PermissionState>('checking');

  useEffect(() => {
    (async () => {
      const deviceId = await getStoredDeviceId();
      if (deviceId) {
        setPushState('granted');
      } else {
        setPushState('default');
      }
    })();
  }, []);

  const handleEnablePush = useCallback(async () => {
    const granted = await requestPermissions();
    if (!granted) {
      setPushState('denied');
      return;
    }
    const token = await getFcmToken();
    if (token) {
      const deviceId = await registerDeviceWithBackend(token);
      setPushState(deviceId ? 'granted' : 'default');
    }
  }, []);

  const handleDisablePush = useCallback(async () => {
    await deactivateDevice();
    setPushState('default');
  }, []);

  // ── Location permission state ──────────────────────────────────────
  const [locationState, setLocationState] = useState<PermissionState>('checking');

  useEffect(() => {
    (async () => {
      const { status } = await Location.getForegroundPermissionsAsync();
      setLocationState(status === 'granted' ? 'granted' : status === 'denied' ? 'denied' : 'default');
    })();
  }, []);

  const handleEnableLocation = useCallback(async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    setLocationState(status === 'granted' ? 'granted' : 'denied');
  }, []);

  const { groups, ungrouped } = useMemo(() => {
    if (!preferences) return { groups: [] as ResolvedGroup[], ungrouped: [] as NotificationCategoryResponse[] };

    const matched = new Set<string>();
    const resolved: ResolvedGroup[] = [];

    for (const def of CATEGORY_GROUPS) {
      const cats = preferences.notifications.filter((c) =>
        def.categoryCodes.includes(c.categoryCode),
      );
      if (cats.length === 0) continue;
      for (const c of cats) matched.add(c.categoryCode);
      resolved.push({
        groupKey: def.groupKey,
        groupLabel: t(`categoryGroups.${def.groupKey}`),
        icon: def.icon,
        categories: cats,
      });
    }

    const remaining = preferences.notifications.filter((c) => !matched.has(c.categoryCode));
    return { groups: resolved, ungrouped: remaining };
  }, [preferences, t]);

  const toggleGroup = (group: ResolvedGroup, enabled: boolean) => {
    for (const cat of group.categories) {
      toggleCategory(cat.categoryCode, enabled);
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: true, title: t('screens.settings.title') }} />
      <ScreenLayout scrollable>
        {/* Push + Location toggles */}
        <SectionLabel label={t('permissions.pushNotifications')} style={styles.firstSection} />
        <Card>
          <View style={styles.permRow}>
            <AppIcon icon={IconBell} size={20} color={colors.primary} />
            <View style={styles.permTextCol}>
              <Text style={styles.permLabel}>{t('permissions.pushNotifications')}</Text>
              <Text style={styles.permStatus}>
                {pushState === 'granted' ? t('permissions.enabled') : pushState === 'denied' ? t('permissions.denied') : t('permissions.disabled')}
              </Text>
            </View>
            {pushState === 'granted' ? (
              <Pressable onPress={handleDisablePush} style={styles.permButton}>
                <Text style={styles.permButtonText}>{t('pushSetup.disable')}</Text>
              </Pressable>
            ) : pushState === 'denied' ? (
              <Pressable onPress={() => Linking.openSettings()} style={styles.permButtonDanger}>
                <Text style={styles.permButtonDangerText}>{t('permissions.openSettings')}</Text>
              </Pressable>
            ) : pushState !== 'checking' ? (
              <Pressable onPress={handleEnablePush} style={styles.permButtonPrimary}>
                <Text style={styles.permButtonPrimaryText}>{t('pushSetup.enable')}</Text>
              </Pressable>
            ) : null}
          </View>
        </Card>

        <SectionLabel label={t('permissions.locationTracking')} />
        <Card>
          <View style={styles.permRow}>
            <AppIcon icon={IconMapPin} size={20} color={colors.primary} />
            <View style={styles.permTextCol}>
              <Text style={styles.permLabel}>{t('permissions.locationTracking')}</Text>
              <Text style={styles.permStatus}>
                {locationState === 'granted' ? t('permissions.enabled') : locationState === 'denied' ? t('permissions.denied') : t('permissions.disabled')}
              </Text>
            </View>
            {locationState === 'denied' ? (
              <Pressable onPress={() => Linking.openSettings()} style={styles.permButtonDanger}>
                <Text style={styles.permButtonDangerText}>{t('permissions.openSettings')}</Text>
              </Pressable>
            ) : locationState === 'default' ? (
              <Pressable onPress={handleEnableLocation} style={styles.permButtonPrimary}>
                <Text style={styles.permButtonPrimaryText}>{t('pushSetup.enable')}</Text>
              </Pressable>
            ) : null}
          </View>
        </Card>

        <SectionLabel label={t('profile.notificationPreferences')} />
        {isLoading ? (
          <Card>
            <ActivityIndicator color={colors.primary} />
          </Card>
        ) : (
          <View style={styles.groupsContainer}>
            {groups.map((group) => {
              const allItems = group.categories.flatMap((c) => c.items);
              const someEnabled = allItems.some((i) => i.enabled);
              const isSingleFlat =
                group.categories.length === 1 &&
                group.categories[0] != null &&
                group.categories[0].items.length <= 1;

              return (
                <Card key={group.groupKey}>
                  {isSingleFlat && group.categories[0] != null ? (
                    <ToggleRow
                      icon={group.icon}
                      iconColor={colors.primary}
                      iconBgColor={colors.surface}
                      label={group.categories[0].categoryName}
                      value={someEnabled}
                      onValueChange={(checked) => toggleCategory(group.categories[0]!.categoryCode, checked)}
                    />
                  ) : (
                    <>
                      <ToggleRow
                        icon={group.icon}
                        iconColor={colors.primary}
                        iconBgColor={colors.surface}
                        label={group.groupLabel}
                        value={someEnabled}
                        onValueChange={(checked) => toggleGroup(group, checked)}
                      />
                      {group.categories.map((category) => (
                        <View key={category.categoryCode}>
                          <View style={styles.subcategoryRow}>
                            <ToggleRow
                              label={category.categoryName}
                              value={category.items.some((item) => item.enabled)}
                              onValueChange={(checked) => toggleCategory(category.categoryCode, checked)}
                            />
                          </View>
                          {category.items.length > 1 && category.items.map((item) => (
                            <View key={item.preferenceId} style={styles.subsubRow}>
                              <ToggleRow
                                label={item.subcategoryCode ?? item.categoryCode}
                                value={item.enabled}
                                onValueChange={(checked) => toggleItem(item.categoryCode, item.subcategoryCode, checked)}
                              />
                            </View>
                          ))}
                        </View>
                      ))}
                    </>
                  )}
                </Card>
              );
            })}

            {ungrouped.map((category) => (
              <Card key={category.categoryCode}>
                <ToggleRow
                  label={category.categoryName}
                  value={category.items.some((item) => item.enabled)}
                  onValueChange={(checked) => toggleCategory(category.categoryCode, checked)}
                />
              </Card>
            ))}
          </View>
        )}

        <SectionLabel label={t('profile.theme')} />
        <Card>
          {THEME_OPTIONS.map((option) => (
            <SelectableRow
              key={option.value}
              label={t(option.key)}
              selected={preferences?.display.theme === option.value}
              onPress={() => setDisplay('theme', option.value)}
            />
          ))}
        </Card>

        <SectionLabel label={t('common.units')} />
        <Card>
          {UNITS_OPTIONS.map((option) => (
            <SelectableRow
              key={option.value}
              label={t(option.key)}
              selected={preferences?.display.units === option.value}
              onPress={() => setDisplay('units', option.value)}
            />
          ))}
        </Card>

        {hasChanges && (
          <View style={styles.actionButtons}>
            <Pressable
              onPress={savePreferences}
              disabled={saving}
              style={[styles.saveButton, saving && styles.buttonDisabled]}
            >
              {saving && <ActivityIndicator size="small" color={colors.background} style={styles.spinner} />}
              <Text style={styles.saveButtonText}>{saving ? t('settings.saving') : t('settings.save')}</Text>
            </Pressable>
            <Pressable
              onPress={cancelChanges}
              disabled={saving}
              style={[styles.cancelButton, saving && styles.buttonDisabled]}
            >
              <Text style={styles.cancelButtonText}>{t('settings.cancel')}</Text>
            </Pressable>
            {error ? (
              <Text style={styles.errorText}>{error}</Text>
            ) : null}
          </View>
        )}
      </ScreenLayout>
    </>
  );
}

const styles = StyleSheet.create({
  firstSection: {
    marginTop: theme.spacing.sm,
  },
  permRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
  },
  permTextCol: {
    flex: 1,
  },
  permLabel: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    ...theme.font.medium,
  },
  permStatus: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  permButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surface,
  },
  permButtonText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    ...theme.font.medium,
  },
  permButtonPrimary: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.primary,
  },
  permButtonPrimaryText: {
    fontSize: theme.fontSize.sm,
    color: '#FFFFFF',
    ...theme.font.medium,
  },
  permButtonDanger: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.severity.critical.bg,
  },
  permButtonDangerText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.danger,
    ...theme.font.medium,
  },
  groupsContainer: {
    gap: theme.spacing.md,
  },
  subcategoryRow: {
    paddingLeft: theme.spacing.lg,
  },
  subsubRow: {
    paddingLeft: theme.spacing['2xl'],
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    flexWrap: 'wrap',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.lg,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
  },
  saveButtonText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.background,
    ...theme.font.medium,
  },
  cancelButton: {
    borderRadius: theme.radius.lg,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
  },
  cancelButtonText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    ...theme.font.medium,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  spinner: {
    marginRight: theme.spacing.sm,
  },
  errorText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.danger,
    flexBasis: '100%',
  },
});
