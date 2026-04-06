import { AlertList } from '../../components/alerts/alert-list';
import { ScreenHeader } from '../../components/ui/screen-header';
import { ScreenLayout } from '../../components/ui/screen-layout';

export default function FeedScreen() {
  return (
    <ScreenLayout header={<ScreenHeader title="Alerts" subtitle="For your area" />}>
      <AlertList />
    </ScreenLayout>
  );
}
