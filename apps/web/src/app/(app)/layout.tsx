import { TopBar } from '@/components/app/top-bar';
import { AuthGuard } from '@/components/auth/auth-guard';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="flex min-h-screen flex-col">
        <TopBar />
        <main className="flex-1">{children}</main>
      </div>
    </AuthGuard>
  );
}
