import { NextResponse, type NextRequest } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/cron/flag-stale
 *
 * Vercel cron endpoint. Runs daily (configured in vercel.json) and
 * identifies completed assessments older than 365 days — the SB 553
 * annual review threshold. Current behavior is observe-only: returns
 * the list as JSON and logs the count to Vercel's runtime logs.
 *
 * To surface stale assessments in the UI, add an `expired_at` column
 * via a migration and update this handler to set it.
 *
 * Auth: requires the `Authorization: Bearer $CRON_SECRET` header that
 * Vercel cron automatically injects when the schedule fires. Returns
 * 401 otherwise so the endpoint isn't abusable from the open internet.
 */
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const expected = `Bearer ${process.env.CRON_SECRET ?? ""}`;
  if (!process.env.CRON_SECRET || authHeader !== expected) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 },
    );
  }

  const supabase = createServiceRoleClient();

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 365);

  const { data, error } = await supabase
    .from("assessments")
    .select("id, org_id, clerk_user_id, site_name, updated_at")
    .eq("status", "complete")
    .lt("updated_at", cutoff.toISOString());

  if (error) {
    console.error("[cron/flag-stale] query failed", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const count = data?.length ?? 0;
  console.log(
    `[cron/flag-stale] observed ${count} complete assessment${
      count === 1 ? "" : "s"
    } older than 365 days`,
  );

  return NextResponse.json({
    ok: true,
    cutoff: cutoff.toISOString(),
    count,
    assessments: data ?? [],
  });
}
