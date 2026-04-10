import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/debug/env
 *
 * Returns a boolean map of which critical env vars are present at
 * runtime. Does NOT return values. Safe to leave live but can be
 * removed once the env var situation is confirmed stable.
 */
export async function GET() {
  const check = (name: string) => {
    const v = process.env[name];
    return {
      present: Boolean(v),
      length: v?.length ?? 0,
      prefix: v ? v.slice(0, 6) : null,
    };
  };

  return NextResponse.json({
    node_version: process.version,
    runtime: "nodejs",
    vars: {
      NEXT_PUBLIC_APP_URL: check("NEXT_PUBLIC_APP_URL"),
      NEXT_PUBLIC_SUPABASE_URL: check("NEXT_PUBLIC_SUPABASE_URL"),
      NEXT_PUBLIC_SUPABASE_ANON_KEY: check("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
      SUPABASE_SERVICE_ROLE_KEY: check("SUPABASE_SERVICE_ROLE_KEY"),
      RESEND_API_KEY: check("RESEND_API_KEY"),
      CRON_SECRET: check("CRON_SECRET"),
    },
  });
}
