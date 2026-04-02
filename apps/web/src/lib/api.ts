import { createNotifioClient } from '@notifio/api-client';

import { createClient } from '@/lib/supabase/client';

// Single instance — avoids per-call allocation.
// Token is validated server-side by authResolve middleware, not here.
const supabase = createClient();

export const api = createNotifioClient({
  baseUrl: process.env.NEXT_PUBLIC_API_URL!,
  apiKey: process.env.NEXT_PUBLIC_API_KEY,
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
