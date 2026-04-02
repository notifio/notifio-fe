import { createNotifioClient } from '@notifio/api-client';

import { supabase } from './supabase';

export const api = createNotifioClient({
  baseUrl: process.env.EXPO_PUBLIC_API_URL!,
  apiKey: process.env.EXPO_PUBLIC_API_KEY,
  getToken: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token ?? null;
  },
  onUnauthorized: () => {
    // Sign out clears session → onAuthStateChange fires → AuthProvider redirects to login
    supabase.auth.signOut();
  },
});
