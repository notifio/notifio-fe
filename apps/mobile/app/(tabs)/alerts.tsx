import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { NotificationHistoryItem } from '@notifio/api-client';

import { AlertList } from '../../components/alerts/alert-list';
import { MyEventsList } from '../../components/events/my-events-list';
import { RemindersTabContent } from '../../components/reminders/reminders-tab-content';
import { ProGate } from '../../components/ui/pro-gate';
import { ScreenHeader } from '../../components/ui/screen-header';
import { ScreenLayout } from '../../components/ui/screen-layout';
import { SPACING } from '../../lib/spacing';
import { useAppTheme } from '../../providers/theme-provider';

type TabKey = 'history' | 'events' | 'reminders';

const TABS: ReadonlyArray<{ id: TabKey; labelKey: string }> = [
  { id: 'history', labelKey: 'reminders.tabs.history' },
  { id: 'events', labelKey: 'reminders.tabs.events' },
  { id: 'reminders', labelKey: 'reminders.tabs.reminders' },
];

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
    <ScreenLayout
      header={
        <ScreenHeader
          title={t('screens.alerts.title')}
          subtitle={t('screens.alerts.subtitle')}
          style={{ paddingTop: SPACING.headerTop, marginBottom: SPACING.headerToTabs }}
        />
      }
    >
      {/* Tab bar — orange underline + orange text for active state
          (matches web). flex:1 per tab + adjustsFontSizeToFit so
          long Slovak labels like "Pripomienky" never wrap mid-word
          on iPhone 16e (~131pt per tab). */}
      <View style={[styles.tabBar, { marginBottom: SPACING.tabsToContent }]}>
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <Pressable
              key={tab.id}
              onPress={() => setActiveTab(tab.id)}
              style={[
                styles.tabButton,
                { borderBottomColor: isActive ? colors.primary : 'transparent' },
              ]}
            >
              <Text
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.85}
                style={[
                  styles.tabText,
                  {
                    color: isActive ? colors.primary : colors.textMuted,
                    fontWeight: isActive ? '600' : '500',
                  },
                ]}
              >
                {t(tab.labelKey)}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Tab content — top breathing room comes from tabBar's
          marginBottom (SPACING.tabsToContent), so each tab's first
          child renders flush against that gap. */}
      <View style={styles.tabContent}>
        {activeTab === 'history' && <AlertList onAlertPress={handleAlertPress} />}
        {activeTab === 'events' && <MyEventsList />}
        {activeTab === 'reminders' && (
          <ProGate requiredTier="PRO">
            <RemindersTabContent />
          </ProGate>
        )}
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.screenH,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: SPACING.tabPadV,
    borderBottomWidth: 2,
  },
  tabText: {
    fontSize: 14,
  },
  tabContent: {
    flex: 1,
  },
});
