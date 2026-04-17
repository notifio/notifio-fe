import { Stack } from 'expo-router';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, StyleSheet, Switch, Text, View } from 'react-native';

import { Card } from '../../components/ui/card';
import { SectionLabel } from '../../components/ui/section-label';
import { api } from '../../lib/api';
import { theme } from '../../lib/theme';
import { showToast } from '../../lib/toast';
import { useConsents } from '../../providers/consent-provider';
import { useAppTheme } from '../../providers/theme-provider';

export default function PrivacyScreen() {
  const { colors } = useAppTheme();
  const { t } = useTranslation();
  const { consents, isLoaded, refetch } = useConsents();
  const [saving, setSaving] = useState<string | null>(null);

  const handleToggle = useCallback(
    async (categoryCode: string, granted: boolean) => {
      setSaving(categoryCode);
      try {
        await api.updateConsent(categoryCode, granted);
        await refetch();
        showToast.success(t('consent.success'));
      } catch {
        showToast.error(t('consent.error'));
      } finally {
        setSaving(null);
      }
    },
    [refetch, t],
  );

  const sorted = [...consents].sort(
    (a, b) => a.category.sortOrder - b.category.sortOrder,
  );

  return (
    <>
      <Stack.Screen options={{ title: t('consent.settingsTitle') }} />
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.content}>
          <SectionLabel label={t('consent.settingsDescription')} style={styles.firstSection} />

          {!isLoaded ? (
            <Card>
              <ActivityIndicator color={colors.primary} />
            </Card>
          ) : (
            <Card>
              {sorted.map((consent) => {
                const code = consent.category.categoryCode;
                const isRequired = consent.category.required;
                const isSaving = saving === code;

                return (
                  <View key={code} style={styles.row}>
                    <View style={styles.rowText}>
                      <View style={styles.rowLabelRow}>
                        <Text style={[styles.rowLabel, { color: colors.text }]}>
                          {t(`consent.categories.${code}.name`)}
                        </Text>
                        {isRequired && (
                          <View style={[styles.requiredBadge, { backgroundColor: `${colors.primary}18` }]}>
                            <Text style={[styles.requiredText, { color: colors.primary }]}>
                              {t('consent.required')}
                            </Text>
                          </View>
                        )}
                      </View>
                      <Text style={[styles.rowDesc, { color: colors.textMuted }]}>
                        {t(`consent.categories.${code}.desc`)}
                      </Text>
                    </View>
                    {isSaving ? (
                      <ActivityIndicator size="small" color={colors.primary} />
                    ) : (
                      <Switch
                        value={consent.granted}
                        onValueChange={(v) => handleToggle(code, v)}
                        disabled={isRequired}
                        trackColor={{ false: colors.border, true: colors.primary }}
                        thumbColor={colors.background}
                      />
                    )}
                  </View>
                );
              })}
            </Card>
          )}
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    paddingVertical: theme.spacing.md,
  },
  rowText: {
    flex: 1,
  },
  rowLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  rowLabel: {
    fontSize: theme.fontSize.md,
    ...theme.font.medium,
  },
  requiredBadge: {
    borderRadius: theme.radius.sm,
    paddingHorizontal: theme.spacing.xs,
    paddingVertical: 1,
  },
  requiredText: {
    fontSize: 10,
    ...theme.font.semibold,
    textTransform: 'uppercase',
  },
  rowDesc: {
    marginTop: 2,
    fontSize: theme.fontSize.xs,
  },
});
