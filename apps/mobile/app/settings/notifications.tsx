import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useMembership } from '@notifio/shared/hooks';

import { NotificationPrefsList } from '../../components/notifications/notification-prefs-list';
import { QuietHoursSection } from '../../components/notifications/quiet-hours-section';
import { Card } from '../../components/ui/card';
import { SectionLabel } from '../../components/ui/section-label';
import { usePreferences } from '../../hooks/use-preferences';
import { theme } from '../../lib/theme';
import { showToast } from '../../lib/toast';
import { useAppTheme } from '../../providers/theme-provider';

export default function NotificationsScreen() {
  const { colors } = useAppTheme();
  const { t } = useTranslation();
  const membership = useMembership();
  const {
    preferences,
    isLoading,
    saving,
    error,
    hasChanges,
    toggleItem,
    toggleCategory,
    setQuietHours,
    savePreferences,
    cancelChanges,
  } = usePreferences();

  const handleSave = async () => {
    await savePreferences();
    if (!error) {
      showToast.success(t('notificationPreferences.saved'));
    }
  };

  const quietHoursAvailable = membership.membership?.current.features.includes('quiet_hours') ?? false;

  return (
    <>
      <Stack.Screen options={{ title: t('notificationPreferences.title') }} />
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={styles.content}
      >
        <SectionLabel label={t('notificationPreferences.title')} style={styles.firstSection} />

        {isLoading ? (
          <Card>
            <ActivityIndicator color={colors.primary} />
          </Card>
        ) : preferences ? (
          <>
            <NotificationPrefsList
              categories={preferences.notifications}
              onToggleItem={toggleItem}
              onToggleCategory={toggleCategory}
              disabled={saving}
            />

            <SectionLabel label={t('notificationPreferences.quietHours')} style={styles.section} />
            <QuietHoursSection
              start={preferences.quietHours.start}
              end={preferences.quietHours.end}
              available={quietHoursAvailable}
              onChange={setQuietHours}
              disabled={saving}
            />
          </>
        ) : null}

        {hasChanges && (
          <View style={styles.actionButtons}>
            <Pressable
              onPress={handleSave}
              disabled={saving}
              style={[styles.saveButton, { backgroundColor: colors.primary }, saving && styles.disabled]}
            >
              {saving && <ActivityIndicator size="small" color={colors.textInverse} style={styles.spinner} />}
              <Text style={[styles.saveText, { color: colors.textInverse }]}>
                {saving ? t('notificationPreferences.saving') : t('notificationPreferences.saveChanges')}
              </Text>
            </Pressable>
            <Pressable onPress={cancelChanges} disabled={saving} style={[styles.cancelButton, saving && styles.disabled]}>
              <Text style={[styles.cancelText, { color: colors.textSecondary }]}>{t('common.ok')}</Text>
            </Pressable>
            {error && <Text style={[styles.errorText, { color: colors.danger }]}>{error}</Text>}
          </View>
        )}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: theme.spacing.xl,
    paddingBottom: theme.spacing['4xl'],
  },
  firstSection: {
    marginTop: theme.spacing.sm,
  },
  section: {
    marginTop: theme.spacing.xl,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    paddingVertical: theme.spacing.lg,
    flexWrap: 'wrap',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radius.lg,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
  },
  saveText: {
    fontSize: theme.fontSize.md,
    ...theme.font.medium,
  },
  cancelButton: {
    borderRadius: theme.radius.lg,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
  },
  cancelText: {
    fontSize: theme.fontSize.md,
    ...theme.font.medium,
  },
  spinner: {
    marginRight: theme.spacing.sm,
  },
  disabled: {
    opacity: 0.5,
  },
  errorText: {
    fontSize: theme.fontSize.sm,
    flexBasis: '100%',
  },
});
