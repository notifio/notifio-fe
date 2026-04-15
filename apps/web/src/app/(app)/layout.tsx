import { AdSidebarLeft } from "@/components/app/ad-sidebar-left";
import { AdSidebarRight } from "@/components/app/ad-sidebar-right";
import { ApiErrorToaster } from "@/components/app/api-error-toaster";
import { BottomTabBar } from "@/components/app/bottom-tab-bar";
import { ConsentGate } from "@/components/app/consent-gate";
import { LocationStatusBanner } from "@/components/app/location-status-banner";
import { TopBar } from "@/components/app/top-bar";
import { requireUser } from "@/lib/auth";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireUser();

  return (
    <ConsentGate>
      <div className="flex min-h-screen flex-col bg-background text-text-primary">
        <TopBar />
        <LocationStatusBanner />
        <ApiErrorToaster />
        <div className="flex flex-1">
          <AdSidebarLeft />
          <main className="flex-1 pb-16 md:pb-0">{children}</main>
          <AdSidebarRight />
        </div>
        <BottomTabBar />
      </div>
    </ConsentGate>
  );
}
