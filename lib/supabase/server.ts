/**
 * Supabase server client. ReadyState runs as a fully anonymous lead-gen
 * app — there is no end-user auth. Every server action, route handler,
 * and server component uses the service role client for reads and writes.
 *
 * The service role bypasses RLS entirely, so RLS policies defined in
 * the migrations are effectively inert for app code but remain in place
 * as defense-in-depth for anything else that might hit the database
 * (e.g., dashboard/internal tools later).
 */

import { createClient as createSupabaseClient } from "@supabase/supabase-js";

export function createServiceRoleClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL is not set. Add it to Vercel → Settings → Environment Variables (Production) and redeploy.",
    );
  }
  if (!key) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is not set. Add it to Vercel → Settings → Environment Variables (Production) and redeploy.",
    );
  }

  return createSupabaseClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
