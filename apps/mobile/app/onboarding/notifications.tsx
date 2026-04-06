import { BellRing } from 'lucide-react-native';
import { useContext, useState } from 'react';

import { OnboardingScreen } from '../../components/ui/onboarding-screen';
import { ToggleRow } from '../../components/ui/toggle-row';
import { useOnboarding } from '../../hooks/use-onboarding';
import { ALERT_TYPE_CONFIG, type AlertType } from '../../lib/alert-config';
import { NotificationContext } from '../../providers/notification-provider';

const ALL_ALERT_TYPES = Object.keys(ALERT_TYPE_CONFIG) as AlertType[];

export default function NotificationsScreen() {
  const { completeOnboarding } = useOnboarding();
  const notificationCtx = useContext(NotificationContext);
  const [selectedTypes, setSelectedTypes] = useState<AlertType[]>([...ALL_ALERT_TYPES]);

  const toggleType = (type: AlertType) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type],
    );
  };

  const handleEnable = async () => {
    // Request push permission — if denied, still complete onboarding.
    // Device registration happens automatically in NotificationProvider
    // once both permission and auth are available.
    await notificationCtx?.requestPermission();
    completeOnboarding();
  };

  return (
    <OnboardingScreen
      icon={BellRing}
      title="What matters to you?"
      description="Choose the types of alerts you want to receive."
      primaryAction={{ title: 'Enable Notifications', onPress: handleEnable }}
    >
      {Object.entries(ALERT_TYPE_CONFIG).map(([type, config]) => (
        <ToggleRow
          key={type}
          icon={config.icon}
          iconColor={config.color}
          iconBgColor={config.bgColor}
          label={config.label}
          value={selectedTypes.includes(type as AlertType)}
          onValueChange={() => toggleType(type as AlertType)}
        />
      ))}
    </OnboardingScreen>
  );
}
