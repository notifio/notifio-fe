import { Stack } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import type { DigestMode } from '@notifio/api-client';

import { Card } from '../../components/ui/card';
import { SectionLabel } from '../../components/ui/section-label';
import { SelectableRow } from '../../components/ui/selectable-row';
import { api } from '../../lib/api';
import { theme } from '../../lib/theme';
import { showToast } from '../../lib/toast';
import { useAppTheme } from '../../providers/theme-provider';

const DIGEST_OPTIONS: { value: DigestMode; labelKey: string; descKey: string }[] = [
  { value: 'REAL_TIME', labelKey: 'digest.realtime', descKey: 'digest.realtimeDesc' },
  { value: 'MORNING', labelKey: 'digest.morning', descKey: 'digest.morningDesc' },
  { value: 'EVENING', labelKey: 'digest.evening', descKey: 'digest.eveningDesc' },
  { value: 'BOTH', labelKey: 'digest.both', descKey: 'digest.bothDesc' },
];

export default function DigestScreen() {
  const { colors } = useAppTheme();
  const { t } = useTranslation();
  const [digestMode, setDigestMode] = useState<DigestMode>('REAL_TIME');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.getProfile()
      .then((profile) => {
        const mode = (profile as unknown as { digestMode?: string }).digestMode;
        if (mode === 'REAL_TIME' || mode === 'MORNING' || mode === 'EVENING' || mode === 'BOTH') {
          setDigestMode(mode);
        }
      })
      .catch(() => {
        // Keep default REAL_TIME
      })
      .finally(() => setIsLoading(false));
  }, []);

  const handleSelect = useCallback(async (mode: DigestMode) => {
    const previous = digestMode;
    setDigestMode(mode);
    try {
      await api.updateProfile({ digestMode: mode });
      showToast.success(t('digest.saved'));
    } catch {
      setDigestMode(previous);
      showToast.error(t('digest.error'));
    }
  }, [digestMode, t]);

  return (
    <>
      <Stack.Screen options={{ title: t('digest.title') }} />
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={[styles.description, { color: colors.textSecondary }]}>
            {t('digest.description')}
          </Text>

          <SectionLabel label={t('digest.title')} style={styles.firstSection} />
          <Card>
            {DIGEST_OPTIONS.map((option) => (
              <SelectableRow
                key={option.value}
                label={t(option.labelKey)}
                selected={!isLoading && digestMode === option.value}
                onPress={() => handleSelect(option.value)}
              />
            ))}
          </Card>
        </ScrollView>
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
    paddingBottom: theme.spacing['2xl'],
  },
  description: {
    fontSize: theme.fontSize.sm,
    marginTop: theme.spacing.lg,
    lineHeight: 20,
  },
  firstSection: {
    marginTop: theme.spacing.lg,
  },
});
