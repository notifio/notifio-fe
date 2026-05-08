import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { Card } from '../../components/ui/card';
import { SectionLabel } from '../../components/ui/section-label';
import { SelectableRow } from '../../components/ui/selectable-row';
import { api } from '../../lib/api';
import { getStoredLocale, setLocale } from '../../lib/i18n';
import { theme } from '../../lib/theme';
import { useAppTheme } from '../../providers/theme-provider';

// Native-script labels per locale. Listed in the same order as the web
// LanguageSwitcher so users moving between platforms see a familiar set.
// `null` is the "follow device default" sentinel.
const LANGUAGE_OPTIONS: Array<{ value: string | null; label?: string; labelKey?: string }> = [
  { value: null, labelKey: 'settings.languageCountryDefault' },
  { value: 'sk', label: 'Slovenčina' },
  { value: 'en', label: 'English' },
  { value: 'cs', label: 'Čeština' },
  { value: 'de', label: 'Deutsch' },
  { value: 'hu', label: 'Magyar' },
  { value: 'uk', label: 'Українська' },
];

export default function LanguageScreen() {
  const { colors } = useAppTheme();
  const { t } = useTranslation();
  // Tracks the explicit user choice from AsyncStorage; `null` = following
  // device default. Distinguishes "user picked sk" from "device is sk,
  // no explicit choice" — i18n.language alone collapses those.
  const [explicit, setExplicit] = useState<string | null>(null);

  useEffect(() => {
    void getStoredLocale().then(setExplicit);
  }, []);

  const handleSelect = async (locale: string | null) => {
    if (locale === explicit) return;
    await setLocale(locale);
    setExplicit(locale);
    // Best-effort: persist the choice on the server so push notifications
    // arrive in the chosen locale on every device. Local apply already
    // happened above; a network failure here is not user-blocking.
    try {
      await api.updateProfile({ locale });
    } catch {
      // Swallow — UI already reflects the choice.
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: t('settings.language') }} />
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.content}>
          <SectionLabel
            label={t('settings.languageSection', { defaultValue: 'App language' })}
            style={styles.firstSection}
          />
          <Card>
            {LANGUAGE_OPTIONS.map((option) => (
              <SelectableRow
                key={option.value ?? 'country-default'}
                label={option.label ?? t(option.labelKey!)}
                selected={explicit === option.value}
                onPress={() => { void handleSelect(option.value); }}
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
