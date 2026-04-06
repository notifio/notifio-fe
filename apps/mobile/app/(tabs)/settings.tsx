import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { Card } from '../../components/ui/card';
import { ScreenHeader } from '../../components/ui/screen-header';
import { ScreenLayout } from '../../components/ui/screen-layout';
import { SectionLabel } from '../../components/ui/section-label';
import { SelectableRow } from '../../components/ui/selectable-row';
import { ToggleRow } from '../../components/ui/toggle-row';
import { useOnboarding } from '../../hooks/use-onboarding';
import { usePreferences } from '../../hooks/use-preferences';
import { theme } from '../../lib/theme';

const THEME_OPTIONS = [
  { value: 'system' as const, label: 'System' },
  { value: 'light' as const, label: 'Light' },
  { value: 'dark' as const, label: 'Dark' },
];

const UNITS_OPTIONS = [
  { value: 'metric' as const, label: 'Metric (°C, km/h)' },
  { value: 'imperial' as const, label: 'Imperial (°F, mph)' },
];

const ABOUT_ROWS = [
  { label: 'Version', value: '0.1.0' },
];

export default function SettingsScreen() {
  const { resetOnboarding } = useOnboarding();
  const { preferences, isLoading, updatePreferences } = usePreferences();

  const handleToggleCategory = async (preferenceId: string, enabled: boolean) => {
    if (!preferences) return;
    await updatePreferences({
      notifications: [{
        categoryId: preferenceId,
        enabled,
      }],
    });
  };

  return (
    <ScreenLayout
      scrollable
      header={<ScreenHeader title="Settings" />}
    >
      <SectionLabel label="Notifications" style={styles.firstSection} />
      {isLoading ? (
        <Card>
          <ActivityIndicator color={theme.colors.primary} />
        </Card>
      ) : (
        <Card>
          {preferences?.notifications.map((category) => (
            <View key={category.categoryCode}>
              <ToggleRow
                label={category.categoryName}
                value={category.items.some((item) => item.enabled)}
                onValueChange={(checked) => {
                  const firstItem = category.items[0];
                  if (firstItem) {
                    handleToggleCategory(firstItem.preferenceId, checked);
                  }
                }}
              />
              {category.items.length > 1 && category.items.map((item) => (
                <View key={item.preferenceId} style={styles.subcategoryRow}>
                  <ToggleRow
                    label={item.subcategoryCode ?? item.categoryCode}
                    value={item.enabled}
                    onValueChange={(checked) => handleToggleCategory(item.preferenceId, checked)}
                  />
                </View>
              ))}
            </View>
          ))}
        </Card>
      )}

      <SectionLabel label="Theme" />
      <Card>
        {THEME_OPTIONS.map((option) => (
          <SelectableRow
            key={option.value}
            label={option.label}
            selected={preferences?.display.theme === option.value}
            onPress={() => updatePreferences({ display: { theme: option.value } })}
          />
        ))}
      </Card>

      <SectionLabel label="Units" />
      <Card>
        {UNITS_OPTIONS.map((option) => (
          <SelectableRow
            key={option.value}
            label={option.label}
            selected={preferences?.display.units === option.value}
            onPress={() => updatePreferences({ display: { units: option.value } })}
          />
        ))}
      </Card>

      <SectionLabel label="About" />
      <Card>
        {ABOUT_ROWS.map((row) => (
          <View key={row.label} style={styles.aboutRow}>
            <Text style={styles.aboutLabel}>{row.label}</Text>
            <Text style={styles.aboutValue}>{row.value}</Text>
          </View>
        ))}
      </Card>

      <View style={styles.resetContainer}>
        <Pressable onPress={resetOnboarding}>
          <Text style={styles.resetText}>Reset Onboarding</Text>
        </Pressable>
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  firstSection: {
    marginTop: theme.spacing.sm,
  },
  subcategoryRow: {
    paddingLeft: theme.spacing.lg,
  },
  aboutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
  },
  aboutLabel: {
    flex: 1,
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
  },
  aboutValue: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textMuted,
  },
  resetContainer: {
    alignItems: 'center',
    marginTop: theme.spacing['3xl'],
    paddingBottom: theme.spacing['2xl'],
  },
  resetText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.danger,
    ...theme.font.medium,
  },
});
