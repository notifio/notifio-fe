import { BellRing } from 'lucide-react-native';
import { useState } from 'react';

import { OnboardingScreen } from '../../components/ui/onboarding-screen';
import { ToggleRow } from '../../components/ui/toggle-row';
import { useOnboarding } from '../../hooks/use-onboarding';
import { ALERT_TYPE_CONFIG, type AlertType } from '../../lib/alert-config';

const ALL_ALERT_TYPES = Object.keys(ALERT_TYPE_CONFIG) as AlertType[];

export default function NotificationsScreen() {
  const { completeOnboarding } = useOnboarding();
  const [selectedTypes, setSelectedTypes] = useState<AlertType[]>([...ALL_ALERT_TYPES]);

  const toggleType = (type: AlertType) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type],
    );
  };

  const handleEnable = () => {
    // TODO: implement
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
