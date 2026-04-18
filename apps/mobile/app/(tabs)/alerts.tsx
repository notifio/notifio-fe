import { useRouter } from 'expo-router';

import type { NotificationHistoryItem } from '@notifio/api-client';

import { AlertList } from '../../components/alerts/alert-list';
import { ScreenHeader } from '../../components/ui/screen-header';
import { ScreenLayout } from '../../components/ui/screen-layout';

export default function FeedScreen() {
  const router = useRouter();

  const handleAlertPress = (notification: NotificationHistoryItem) => {
    if (notification.eventId) {
      router.push(`/events/${notification.eventId}`);
    }
  };

  return (
    <ScreenLayout header={<ScreenHeader title="Alerts" subtitle="For your area" />}>
      <AlertList onAlertPress={handleAlertPress} />
    </ScreenLayout>
  );
}
