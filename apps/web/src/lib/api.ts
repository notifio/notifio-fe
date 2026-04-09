import { createNotifioClient } from '@notifio/api-client';

import { createClient } from '@/lib/supabase/client';

// Single instance — avoids per-call allocation.
// Token is validated server-side by authResolve middleware, not here.
const supabase = createClient();

function getLocale(): string {
  const match = document.cookie.match(/(?:^|;\s*)locale=([^;]*)/);
  return match?.[1] ?? 'sk';
}

export const api = createNotifioClient({
  baseUrl: process.env.NEXT_PUBLIC_API_URL!,
  apiKey: process.env.NEXT_PUBLIC_API_KEY,
  locale: getLocale,
  getToken: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token ?? null;
  },
  onUnauthorized: () => {
    supabase.auth.signOut().then(() => {
      window.location.href = '/sign-in';
    });
  },
});
