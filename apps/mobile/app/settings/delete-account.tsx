import { IconAlertTriangle, IconCheck } from '@tabler/icons-react-native';
import { Stack, useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { useDeletionStatus } from '../../hooks/use-deletion-status';
import { api } from '../../lib/api';
import { theme } from '../../lib/theme';
import { showToast } from '../../lib/toast';
import { useAppTheme } from '../../providers/theme-provider';

export default function DeleteAccountScreen() {
  const { colors } = useAppTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const { deletionScheduledAt, scheduleDeletion } = useDeletionStatus();

  const [confirmText, setConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [scheduled, setScheduled] = useState(!!deletionScheduledAt);

  const isConfirmed = confirmText.toUpperCase() === 'DELETE';

  const handleDelete = async () => {
    if (!isConfirmed || deleting) return;
    setDeleting(true);
    try {
      await api.deleteAccount();
      scheduleDeletion();
      setScheduled(true);
    } catch {
      showToast.error(t('deletion.error'));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: t('deletion.title') }} />
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {scheduled ? (
          <View style={styles.centered}>
            <View style={[styles.iconCircle, { backgroundColor: `${colors.primary}18` }]}>
              <IconCheck size={28} color={colors.primary} />
            </View>
            <Text style={[styles.scheduledTitle, { color: colors.text }]}>
              {t('deletion.scheduled')}
            </Text>
            <Text style={[styles.scheduledMessage, { color: colors.textMuted }]}>
              {t('deletion.scheduledMessage')}
            </Text>
            <Pressable
              onPress={() => router.back()}
              style={[styles.backButton, { backgroundColor: colors.surface }]}
            >
              <Text style={[styles.backButtonText, { color: colors.text }]}>
                {t('common.ok')}
              </Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.content}>
            {/* Warning */}
            <View style={[styles.warningBox, { backgroundColor: colors.severity.critical.bg, borderColor: colors.severity.critical.border }]}>
              <IconAlertTriangle size={20} color={colors.danger} />
              <View style={styles.warningText}>
                <Text style={[styles.warningTitle, { color: colors.danger }]}>
                  {t('deletion.warning')}
                </Text>
                <Text style={[styles.warningDesc, { color: colors.textSecondary }]}>
                  {t('deletion.graceperiod')}
                </Text>
              </View>
            </View>

            {/* What gets deleted */}
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {t('deletion.whatDeleted')}
            </Text>
            <Text style={[styles.itemsList, { color: colors.textMuted }]}>
              {t('deletion.items')}
            </Text>

            {/* Confirmation input */}
            <Text style={[styles.confirmLabel, { color: colors.text }]}>
              {t('deletion.confirmLabel')}
            </Text>
            <TextInput
              value={confirmText}
              onChangeText={setConfirmText}
              placeholder={t('deletion.confirmPlaceholder')}
              placeholderTextColor={colors.textMuted}
              autoCapitalize="characters"
              style={[styles.input, {
                backgroundColor: colors.surface,
                borderColor: isConfirmed ? colors.danger : colors.border,
                color: colors.text,
              }]}
            />

            {/* Delete button */}
            <Pressable
              onPress={handleDelete}
              disabled={!isConfirmed || deleting}
              style={[styles.deleteButton, (!isConfirmed || deleting) && styles.disabled]}
            >
              {deleting && <ActivityIndicator size="small" color="#FFFFFF" style={styles.spinner} />}
              <Text style={styles.deleteButtonText}>
                {deleting ? t('deletion.deleting') : t('deletion.deleteButton')}
              </Text>
            </Pressable>
          </View>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.xl,
  },
  content: {
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.xl,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: theme.radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scheduledTitle: {
    marginTop: theme.spacing.lg,
    fontSize: theme.fontSize.xl,
    ...theme.font.bold,
  },
  scheduledMessage: {
    marginTop: theme.spacing.sm,
    fontSize: theme.fontSize.md,
    textAlign: 'center',
    lineHeight: 22,
  },
  backButton: {
    marginTop: theme.spacing['2xl'],
    paddingHorizontal: theme.spacing['2xl'],
    paddingVertical: theme.spacing.md,
    borderRadius: theme.radius.lg,
  },
  backButtonText: {
    fontSize: theme.fontSize.md,
    ...theme.font.medium,
  },
  warningBox: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    padding: theme.spacing.lg,
    borderRadius: theme.radius.xl,
    borderWidth: 1,
  },
  warningText: {
    flex: 1,
  },
  warningTitle: {
    fontSize: theme.fontSize.md,
    ...theme.font.semibold,
  },
  warningDesc: {
    marginTop: theme.spacing.xs,
    fontSize: theme.fontSize.sm,
    lineHeight: 20,
  },
  sectionTitle: {
    marginTop: theme.spacing['2xl'],
    fontSize: theme.fontSize.md,
    ...theme.font.semibold,
  },
  itemsList: {
    marginTop: theme.spacing.sm,
    fontSize: theme.fontSize.sm,
    lineHeight: 20,
  },
  confirmLabel: {
    marginTop: theme.spacing['2xl'],
    fontSize: theme.fontSize.sm,
    ...theme.font.medium,
  },
  input: {
    marginTop: theme.spacing.sm,
    height: 48,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    paddingHorizontal: theme.spacing.lg,
    fontSize: theme.fontSize.md,
  },
  deleteButton: {
    marginTop: theme.spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: theme.radius.xl,
    backgroundColor: '#FF3B30',
  },
  deleteButtonText: {
    fontSize: theme.fontSize.md,
    color: '#FFFFFF',
    ...theme.font.semibold,
  },
  spinner: {
    marginRight: theme.spacing.sm,
  },
  disabled: {
    opacity: 0.5,
  },
});
