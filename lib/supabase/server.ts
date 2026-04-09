import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { auth } from "@clerk/nextjs/server";
import { cookies } from "next/headers";

/**
 * Server Supabase client that forwards the Clerk session token to Supabase.
 *
 * Requires: Supabase dashboard → Authentication → Sign In / Providers →
 * Third-Party Auth → add Clerk. With that configured, Supabase verifies the
 * Clerk JWT directly and RLS sees the Clerk user ID via
 * `auth.jwt() ->> 'sub'`.
 */
export function createClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch {
            // Called from a Server Component — ignore, middleware refreshes sessions.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: "", ...options });
          } catch {
            // Called from a Server Component — ignore.
          }
        },
      },
      accessToken: async () => {
        const { getToken } = auth();
        return (await getToken()) ?? null;
      },
    },
  );
}

/**
 * Service-role Supabase client. Bypasses RLS — use only in trusted server
 * contexts (cron jobs, webhooks, admin actions). NEVER import this into a
 * client component or route handler that runs unverified user input.
 */
export function createServiceRoleClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        get() {
          return undefined;
        },
        set() {},
        remove() {},
      },
    },
  );
}
