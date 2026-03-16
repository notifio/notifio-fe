import { AlertList } from '../../components/alerts/alert-list';
import { ScreenHeader } from '../../components/ui/screen-header';
import { ScreenLayout } from '../../components/ui/screen-layout';
import { MOCK_ALERTS } from '../../lib/mock-data';

export default function FeedScreen() {
  return (
    <ScreenLayout header={<ScreenHeader title="Alerts" subtitle="For your area" />}>
      <AlertList alerts={MOCK_ALERTS} />
    </ScreenLayout>
  );
}
