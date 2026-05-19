import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { NotificationHistoryItem } from '@notifio/api-client';

import { AlertList } from '../../components/alerts/alert-list';
import { MyEventsList } from '../../components/events/my-events-list';
import { RemindersTabContent } from '../../components/reminders/reminders-tab-content';
import { ProGate } from '../../components/ui/pro-gate';
import { ScreenLayout } from '../../components/ui/screen-layout';
import { SPACING } from '../../lib/spacing';
import { useAppTheme } from '../../providers/theme-provider';

type TabKey = 'history' | 'events' | 'reminders';

// Tab #1 label points at nav.notifications ("Notifikácie") instead of
// reminders.tabs.history ("História"). Tab #2 label now uses the
// local-override localTabs.hlasenia ("Hlásenia") instead of
// reminders.tabs.events ("Udalosti") — shared doesn't own localTabs.*
// so the override in lib/i18n.ts MOBILE_OVERRIDES passes through.
// TODO: migrate localTabs.hlasenia to @notifio/shared in next shared
// bump and revert this entry back to a shared key.
const TABS: ReadonlyArray<{ id: TabKey; labelKey: string }> = [
  { id: 'history', labelKey: 'nav.notifications' },
  { id: 'events', labelKey: 'localTabs.hlasenia' },
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

  // ScreenHeader ("Upozornenia") dropped — bottom-tab "Notifikácie" +
  // first sub-tab "Notifikácie" already establish the page identity;
  // a separate header was visual noise above them.
  return (
    <ScreenLayout>
      {/* Tab bar — orange underline + orange text for active state
          (matches web). flex:1 per tab + adjustsFontSizeToFit so
          long Slovak labels like "Pripomienky" never wrap mid-word
          on iPhone 16e (~131pt per tab). */}
      <View style={[styles.tabBar, { marginTop: SPACING.headerTop, marginBottom: SPACING.tabsToContent }]}>
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
