import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { Card } from '../../components/ui/card';
import { SectionLabel } from '../../components/ui/section-label';
import { SelectableRow } from '../../components/ui/selectable-row';
import { usePreferences } from '../../hooks/use-preferences';
import { theme } from '../../lib/theme';
import { type ThemeMode, useAppTheme } from '../../providers/theme-provider';

const THEME_OPTIONS: Array<{ value: ThemeMode; labelKey: string }> = [
  { value: 'system', labelKey: 'settings.themeSystem' },
  { value: 'light', labelKey: 'settings.themeLight' },
  { value: 'dark', labelKey: 'settings.themeDark' },
];

export default function AppearanceScreen() {
  const { colors, mode, setMode } = useAppTheme();
  const { setDisplay } = usePreferences();
  const { t } = useTranslation();

  return (
    <>
      <Stack.Screen options={{ title: t('settings.appearance') }} />
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.content}>
          <SectionLabel label={t('settings.theme')} style={styles.firstSection} />
          <Card>
            {THEME_OPTIONS.map((option) => (
              <SelectableRow
                key={option.value}
                label={t(option.labelKey)}
                selected={mode === option.value}
                onPress={() => {
                  setMode(option.value);
                  setDisplay('theme', option.value);
                }}
              />
            ))}
          </Card>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: theme.spacing.xl,
  },
  firstSection: {
    marginTop: theme.spacing.sm,
  },
});
