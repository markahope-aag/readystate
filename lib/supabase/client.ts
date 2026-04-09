"use client";

import { createBrowserClient } from "@supabase/ssr";

/**
 * Browser Supabase client that forwards the Clerk session token to Supabase.
 *
 * Requires: Supabase dashboard → Authentication → Sign In / Providers →
 * Third-Party Auth → add Clerk (using your Clerk Frontend API URL, e.g.
 * https://perfect-blowfish-8.clerk.accounts.dev). With that configured,
 * Supabase verifies the Clerk JWT directly and RLS sees the Clerk user ID
 * via `auth.jwt() ->> 'sub'`.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      accessToken: async () => {
        // window.Clerk is populated by <ClerkProvider> in app/layout.tsx.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const clerk = (globalThis as any).Clerk;
        return (await clerk?.session?.getToken()) ?? null;
      },
    },
  );
}
