import { IconShieldLock } from '@tabler/icons-react-native';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';

import type { ConsentState } from '@notifio/api-client';

import { theme } from '../../lib/theme';
import { showToast } from '../../lib/toast';
import { useAppTheme } from '../../providers/theme-provider';

interface ConsentModalProps {
  consents: ConsentState[];
  onSave: (decisions: Array<{ categoryCode: string; granted: boolean }>) => Promise<void>;
}

export function ConsentModal({ consents, onSave }: ConsentModalProps) {
  const { colors } = useAppTheme();
  const { t } = useTranslation();

  const [decisions, setDecisions] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    for (const c of consents) {
      initial[c.category.categoryCode] = c.category.required ? true : c.granted;
    }
    return initial;
  });
  const [saving, setSaving] = useState(false);

  const toggle = useCallback((code: string, value: boolean) => {
    setDecisions((prev) => ({ ...prev, [code]: value }));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const items = Object.entries(decisions).map(([categoryCode, granted]) => ({
        categoryCode,
        granted,
      }));
      await onSave(items);
      showToast.success(t('consent.success'));
    } catch {
      showToast.error(t('consent.error'));
    } finally {
      setSaving(false);
    }
  };

  const sorted = [...consents].sort(
    (a, b) => a.category.sortOrder - b.category.sortOrder,
  );

  return (
    <Modal visible animationType="slide" transparent={false} statusBarTranslucent>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <View style={[styles.iconCircle, { backgroundColor: `${colors.primary}18` }]}>
              <IconShieldLock size={24} color={colors.primary} />
            </View>
            <Text style={[styles.title, { color: colors.text }]}>
              {t('consent.modalTitle')}
            </Text>
            <Text style={[styles.description, { color: colors.textMuted }]}>
              {t('consent.modalDescription')}
            </Text>
          </View>

          {/* Consent rows */}
          <View style={styles.list}>
            {sorted.map((consent) => {
              const code = consent.category.categoryCode;
              const isRequired = consent.category.required;
              const granted = decisions[code] ?? false;

              return (
                <View
                  key={code}
                  style={[styles.row, { backgroundColor: colors.surface, borderColor: colors.border }]}
                >
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
                  <Switch
                    value={granted}
                    onValueChange={(v) => toggle(code, v)}
                    disabled={isRequired}
                    trackColor={{ false: colors.border, true: colors.primary }}
                    thumbColor={colors.background}
                  />
                </View>
              );
            })}
          </View>
        </ScrollView>

        {/* Submit button */}
        <View style={[styles.footer, { borderTopColor: colors.border }]}>
          <Pressable
            onPress={handleSave}
            disabled={saving}
            style={[styles.submitButton, { backgroundColor: colors.primary }, saving && styles.disabled]}
          >
            {saving && <ActivityIndicator size="small" color={colors.textInverse} style={styles.spinner} />}
            <Text style={[styles.submitText, { color: colors.textInverse }]}>
              {saving ? t('consent.submitting') : t('consent.saveButton')}
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing['4xl'],
    paddingBottom: theme.spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing['2xl'],
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: theme.radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    marginTop: theme.spacing.lg,
    fontSize: theme.fontSize.xl,
    ...theme.font.bold,
  },
  description: {
    marginTop: theme.spacing.sm,
    fontSize: theme.fontSize.sm,
    textAlign: 'center',
    lineHeight: 20,
  },
  list: {
    gap: theme.spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
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
  footer: {
    borderTopWidth: 1,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.lg,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: theme.radius.xl,
  },
  submitText: {
    fontSize: theme.fontSize.md,
    ...theme.font.semibold,
  },
  spinner: {
    marginRight: theme.spacing.sm,
  },
  disabled: {
    opacity: 0.6,
  },
});
