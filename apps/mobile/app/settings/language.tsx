import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { Card } from '../../components/ui/card';
import { SectionLabel } from '../../components/ui/section-label';
import { SelectableRow } from '../../components/ui/selectable-row';
import { setLocale } from '../../lib/i18n';
import { theme } from '../../lib/theme';
import { useAppTheme } from '../../providers/theme-provider';

// Native-script labels per locale. Listed in the same order as the web
// LanguageSwitcher so users moving between platforms see a familiar set.
const LANGUAGE_OPTIONS = [
  { value: 'sk', label: 'Slovenčina' },
  { value: 'en', label: 'English' },
  { value: 'cs', label: 'Čeština' },
  { value: 'de', label: 'Deutsch' },
  { value: 'hu', label: 'Magyar' },
  { value: 'uk', label: 'Українська' },
];

export default function LanguageScreen() {
  const { colors } = useAppTheme();
  const { i18n, t } = useTranslation();
  const current = i18n.language;

  const handleSelect = (locale: string) => {
    if (locale === current) return;
    void setLocale(locale);
  };

  return (
    <>
      <Stack.Screen options={{ title: t('settings.language', { defaultValue: 'Language' }) }} />
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.content}>
          <SectionLabel
            label={t('settings.languageSection', { defaultValue: 'App language' })}
            style={styles.firstSection}
          />
          <Card>
            {LANGUAGE_OPTIONS.map((option) => (
              <SelectableRow
                key={option.value}
                label={option.label}
                selected={current === option.value}
                onPress={() => { handleSelect(option.value); }}
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
