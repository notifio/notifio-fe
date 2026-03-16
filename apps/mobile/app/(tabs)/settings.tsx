import { ChevronRight } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Card } from '../../components/ui/card';
import { Icon } from '../../components/ui/icon';
import { ScreenHeader } from '../../components/ui/screen-header';
import { ScreenLayout } from '../../components/ui/screen-layout';
import { SectionLabel } from '../../components/ui/section-label';
import { SelectableRow } from '../../components/ui/selectable-row';
import { ToggleRow } from '../../components/ui/toggle-row';
import { useOnboarding } from '../../hooks/use-onboarding';
import { usePreferences } from '../../hooks/use-preferences';
import { ALERT_TYPE_CONFIG, type AlertType } from '../../lib/alert-config';
import { theme } from '../../lib/theme';

const SEVERITY_OPTIONS = [
  { value: 'info' as const, label: 'All alerts' },
  { value: 'warning' as const, label: 'Warnings & critical' },
  { value: 'critical' as const, label: 'Critical only' },
];

const LANGUAGE_OPTIONS = [
  { value: 'en' as const, label: 'English' },
  { value: 'sk' as const, label: 'Slovenčina' },
];

const ABOUT_ROWS = [
  { label: 'Version', value: '0.1.0' },
  { label: 'Privacy Policy', onPress: () => {} }, // TODO: implement
  { label: 'Contact', onPress: () => {} }, // TODO: implement
];

export default function SettingsScreen() {
  const { resetOnboarding } = useOnboarding();
  const { preferences, toggleAlertType, setMinSeverity, setLocale } = usePreferences();

  return (
    <ScreenLayout
      scrollable
      header={<ScreenHeader title="Settings" />}
    >
      <SectionLabel label="Notifications" style={styles.firstSection} />
      <Card>
        {Object.entries(ALERT_TYPE_CONFIG).map(([type, config]) => (
          <ToggleRow
            key={type}
            icon={config.icon}
            iconColor={config.color}
            iconBgColor={config.bgColor}
            label={config.label}
            value={preferences.alertTypes.includes(type as AlertType)}
            onValueChange={() => toggleAlertType(type as AlertType)}
          />
        ))}
      </Card>

      <SectionLabel label="Minimum Severity" />
      <Card>
        {SEVERITY_OPTIONS.map((option) => (
          <SelectableRow
            key={option.value}
            label={option.label}
            selected={preferences.minSeverity === option.value}
            onPress={() => setMinSeverity(option.value)}
          />
        ))}
      </Card>

      <SectionLabel label="Language" />
      <Card>
        {LANGUAGE_OPTIONS.map((option) => (
          <SelectableRow
            key={option.value}
            label={option.label}
            selected={preferences.locale === option.value}
            onPress={() => setLocale(option.value)}
          />
        ))}
      </Card>

      <SectionLabel label="About" />
      <Card>
        {ABOUT_ROWS.map((row) => (
          <Pressable
            key={row.label}
            style={styles.aboutRow}
            onPress={row.onPress}
            disabled={!row.onPress}
          >
            <Text style={styles.aboutLabel}>{row.label}</Text>
            {row.value ? (
              <Text style={styles.aboutValue}>{row.value}</Text>
            ) : (
              <Icon icon={ChevronRight} size={18} color={theme.colors.textMuted} />
            )}
          </Pressable>
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
