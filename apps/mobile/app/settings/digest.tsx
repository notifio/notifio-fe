import { IconAlertTriangle } from '@tabler/icons-react-native';
import { Stack } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import type { DigestPreferences } from '@notifio/api-client';

import { Card } from '../../components/ui/card';
import { SectionLabel } from '../../components/ui/section-label';
import { ToggleRow } from '../../components/ui/toggle-row';
import { api } from '../../lib/api';
import { theme } from '../../lib/theme';
import { showToast } from '../../lib/toast';
import { useAppTheme } from '../../providers/theme-provider';

const DEFAULT_PREFS: DigestPreferences = { realTime: true, morning: false, evening: false };

type Channel = keyof DigestPreferences;

const CHANNELS: { key: Channel; labelKey: string; descKey: string }[] = [
  { key: 'realTime', labelKey: 'digest.realTime',  descKey: 'digest.realTimeDesc'  },
  { key: 'morning',  labelKey: 'digest.morning',   descKey: 'digest.morningDesc'   },
  { key: 'evening',  labelKey: 'digest.evening',   descKey: 'digest.eveningDesc'   },
];

export default function DigestScreen() {
  const { colors } = useAppTheme();
  const { t } = useTranslation();
  const [prefs, setPrefs] = useState<DigestPreferences>(DEFAULT_PREFS);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.getProfile()
      .then((profile) => {
        const dp = (profile as unknown as { digestPreferences?: DigestPreferences }).digestPreferences;
        if (dp && typeof dp === 'object') {
          setPrefs({
            realTime: Boolean(dp.realTime),
            morning: Boolean(dp.morning),
            evening: Boolean(dp.evening),
          });
        }
      })
      .catch(() => {
        // Keep defaults
      });
  }, []);

  const toggle = useCallback(async (key: Channel) => {
    const next = { ...prefs, [key]: !prefs[key] };
    const anyActive = Object.values(next).some(Boolean);
    if (!anyActive) return;

    const previous = prefs;
    setPrefs(next);
    setSaving(true);
    try {
      await api.updateProfile({ digestPreferences: next });
      showToast.success(t('digest.saved'));
    } catch {
      setPrefs(previous);
      showToast.error(t('digest.error'));
    } finally {
      setSaving(false);
    }
  }, [prefs, t]);

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
            {CHANNELS.map(({ key, labelKey, descKey }, index) => (
              <ToggleRow
                key={key}
                label={t(labelKey)}
                description={t(descKey)}
                value={prefs[key]}
                onValueChange={() => toggle(key)}
                disabled={saving}
                style={index > 0 ? { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border } : undefined}
              />
            ))}
          </Card>

          <View
            style={[
              styles.banner,
              {
                backgroundColor: colors.severity.warning.bg,
                borderColor: colors.severity.warning.bg,
              },
            ]}
          >
            <IconAlertTriangle size={15} color={colors.severity.warning.text} />
            <Text style={[styles.bannerText, { color: colors.severity.warning.text }]}>
              {t('digest.criticalNote')}
            </Text>
          </View>
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    paddingHorizontal: theme.spacing.xl,
    paddingBottom: theme.spacing['2xl'],
  },
  description: {
    fontSize: theme.fontSize.sm,
    marginTop: theme.spacing.lg,
    lineHeight: 20,
  },
  firstSection: { marginTop: theme.spacing.lg },
  banner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.lg,
    padding: theme.spacing.md,
    borderRadius: theme.radius.lg,
  },
  bannerText: {
    flex: 1,
    fontSize: theme.fontSize.xs,
    lineHeight: 18,
  },
});
