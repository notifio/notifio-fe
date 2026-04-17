import AsyncStorage from '@react-native-async-storage/async-storage';
import { IconBellRinging } from '@tabler/icons-react-native';
import { useContext, useState } from 'react';
import { Alert } from 'react-native';

import { NotificationCategoryList } from '../../components/notifications/notification-category-list';
import { OnboardingScreen } from '../../components/ui/onboarding-screen';
import { useOnboarding } from '../../hooks/use-onboarding';
import type { AlertType } from '../../lib/alert-config';
import { CATEGORY_GROUPS } from '../../lib/category-groups';
import { NotificationContext } from '../../providers/notification-provider';

const ONBOARDING_ALERT_TYPES_KEY = 'onboarding_alert_types';

// Map group keys to ALERT_TYPE_CONFIG keys for post-auth sync
const GROUP_TO_ALERT_TYPES: Record<string, AlertType[]> = {
  weather: ['weather', 'air_quality'],
  traffic: ['traffic'],
  outages: ['utility_outage'],
  events: ['event'],
};

export default function NotificationsScreen() {
  const { completeOnboarding } = useOnboarding();
  const notificationCtx = useContext(NotificationContext);

  // Initialize all groups as enabled
  const [groupValues, setGroupValues] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    for (const g of CATEGORY_GROUPS) {
      initial[g.groupKey] = true;
    }
    return initial;
  });

  const handleToggleGroup = (groupKey: string, enabled: boolean) => {
    setGroupValues((prev) => ({ ...prev, [groupKey]: enabled }));
  };

  const handleEnable = async () => {
    try {
      await notificationCtx?.requestPermission();

      // Convert group selections to alert type codes for post-auth sync
      const selectedTypes: AlertType[] = [];
      for (const [groupKey, enabled] of Object.entries(groupValues)) {
        if (enabled) {
          const types = GROUP_TO_ALERT_TYPES[groupKey];
          if (types) selectedTypes.push(...types);
        }
      }

      await AsyncStorage.setItem(
        ONBOARDING_ALERT_TYPES_KEY,
        JSON.stringify(selectedTypes),
      );

      if (!notificationCtx?.hasPermission) {
        Alert.alert(
          'Notifications Disabled',
          'You can enable notifications later in Settings.',
          [{ text: 'OK' }],
        );
      }
    } catch (err) {
      console.error('Permission request failed:', err);
    }

    completeOnboarding();
  };

  const handleSkip = () => {
    completeOnboarding();
  };

  return (
    <OnboardingScreen
      icon={IconBellRinging}
      title="What matters to you?"
      description="Choose the types of alerts you want to receive."
      primaryAction={{ title: 'Enable Notifications', onPress: handleEnable }}
      secondaryAction={{ title: 'Skip for now', onPress: handleSkip }}
    >
      <NotificationCategoryList
        groupValues={groupValues}
        onToggleGroup={handleToggleGroup}
      />
    </OnboardingScreen>
  );
}
