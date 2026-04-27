import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { NotificationHistoryItem } from '@notifio/api-client';

import { AlertList } from '../../components/alerts/alert-list';
import { ReminderList } from '../../components/reminders/reminder-list';
import { ProGate } from '../../components/ui/pro-gate';
import { ScreenHeader } from '../../components/ui/screen-header';
import { ScreenLayout } from '../../components/ui/screen-layout';
import { theme } from '../../lib/theme';
import { useAppTheme } from '../../providers/theme-provider';

type TabKey = 'history' | 'reminders';

export default function FeedScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<TabKey>('history');

  const handleAlertPress = (notification: NotificationHistoryItem) => {
    if (notification.eventId) {
      router.push(`/events/${notification.eventId}`);
    }
  };

  return (
    <ScreenLayout header={<ScreenHeader title="Alerts" subtitle="For your area" />}>
      {/* Tab bar */}
      <View style={styles.tabBar}>
        <Pressable
          onPress={() => setActiveTab('history')}
          style={[
            styles.tabButton,
            activeTab === 'history' && { backgroundColor: colors.text },
          ]}
        >
          <Text
            style={[
              styles.tabText,
              { color: colors.textMuted },
              activeTab === 'history' && { color: colors.background },
            ]}
          >
            {t('reminders.tabs.history')}
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setActiveTab('reminders')}
          style={[
            styles.tabButton,
            activeTab === 'reminders' && { backgroundColor: colors.text },
          ]}
        >
          <Text
            style={[
              styles.tabText,
              { color: colors.textMuted },
              activeTab === 'reminders' && { color: colors.background },
            ]}
          >
            {t('reminders.tabs.reminders')}
          </Text>
        </Pressable>
      </View>

      {activeTab === 'history' ? (
        <AlertList onAlertPress={handleAlertPress} />
      ) : (
        <ProGate requiredTier="PRO">
          <ReminderList />
        </ProGate>
      )}
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    gap: theme.spacing.xs,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.sm,
  },
  tabButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radius.md,
  },
  tabText: {
    fontSize: theme.fontSize.sm,
    ...theme.font.medium,
  },
});
