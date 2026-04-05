import { LocationStatusBanner } from '@/components/app/location-status-banner';
import { TopBar } from '@/components/app/top-bar';
import { requireUser } from '@/lib/auth';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  await requireUser();

  return (
    <div className="flex min-h-screen flex-col">
      <TopBar />
      <LocationStatusBanner />
      <main className="flex-1">{children}</main>
    </div>
  );
}
