import { ApiErrorToaster } from "@/components/app/api-error-toaster";
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
        <main className="flex-1">{children}</main>
      </div>
    </ConsentGate>
  );
}
