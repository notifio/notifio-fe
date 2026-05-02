import { Stack } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Card } from '../../components/ui/card';
import { SectionLabel } from '../../components/ui/section-label';
import { SelectableRow } from '../../components/ui/selectable-row';
import { usePreferences } from '../../hooks/use-preferences';
import { theme } from '../../lib/theme';
import { type ThemeMode, useAppTheme } from '../../providers/theme-provider';

const THEME_OPTIONS = [
  { value: 'system' as const, label: 'System' },
  { value: 'light' as const, label: 'Light' },
  { value: 'dark' as const, label: 'Dark' },
];

export default function AppearanceScreen() {
  const { colors, mode, setMode } = useAppTheme();
  const { setDisplay } = usePreferences();

  return (
    <>
      <Stack.Screen options={{ title: 'Appearance' }} />
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.content}>
          <SectionLabel label="Theme" style={styles.firstSection} />
          <Card>
            {THEME_OPTIONS.map((option) => (
              <SelectableRow
                key={option.value}
                label={option.label}
                selected={mode === option.value}
                onPress={() => {
                  setMode(option.value as ThemeMode);
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
