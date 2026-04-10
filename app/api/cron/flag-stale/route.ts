import { NextResponse, type NextRequest } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ABANDONED_AFTER_DAYS = 30;
const STALE_AFTER_DAYS = 365;

/**
 * GET /api/cron/flag-stale
 *
 * Daily janitorial cron. Two jobs in one endpoint:
 *
 *   1. Deletes in-progress assessments older than ABANDONED_AFTER_DAYS.
 *      Enforces the 30-day retention promise made by the save-for-later
 *      email flow. assessment_responses cascades on delete. Orphaned
 *      organizations rows are left in place (cheap + harmless).
 *
 *   2. Observes completed assessments older than STALE_AFTER_DAYS
 *      (the SB 553 annual review threshold + a generous buffer).
 *      Current behavior is read-only — logs and returns the list.
 *
 * Auth: requires the `Authorization: Bearer $CRON_SECRET` header that
 * Vercel cron automatically injects when the schedule fires. Returns
 * 401 otherwise so the endpoint isn't abusable from the open internet.
 */
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const expected = `Bearer ${process.env.CRON_SECRET ?? ""}`;
  if (!process.env.CRON_SECRET || authHeader !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceRoleClient();

  // ── 1. Delete abandoned in-progress assessments ───────────────────────
  const abandonedCutoff = new Date();
  abandonedCutoff.setDate(abandonedCutoff.getDate() - ABANDONED_AFTER_DAYS);

  const { data: deleted, error: deleteError } = await supabase
    .from("assessments")
    .delete()
    .eq("status", "in_progress")
    .lt("updated_at", abandonedCutoff.toISOString())
    .select("id, updated_at");

  if (deleteError) {
    console.error("[cron/flag-stale] delete failed", deleteError);
    return NextResponse.json(
      { error: deleteError.message },
      { status: 500 },
    );
  }

  const deletedCount = deleted?.length ?? 0;
  console.log(
    `[cron/flag-stale] deleted ${deletedCount} abandoned in-progress assessment${
      deletedCount === 1 ? "" : "s"
    } older than ${ABANDONED_AFTER_DAYS} days`,
  );

  // ── 2. Observe stale completed assessments ────────────────────────────
  const staleCutoff = new Date();
  staleCutoff.setDate(staleCutoff.getDate() - STALE_AFTER_DAYS);

  const { data: stale, error: staleError } = await supabase
    .from("assessments")
    .select("id, org_id, site_name, updated_at")
    .eq("status", "complete")
    .lt("updated_at", staleCutoff.toISOString());

  if (staleError) {
    console.error("[cron/flag-stale] stale query failed", staleError);
    return NextResponse.json({ error: staleError.message }, { status: 500 });
  }

  const staleCount = stale?.length ?? 0;
  console.log(
    `[cron/flag-stale] observed ${staleCount} complete assessment${
      staleCount === 1 ? "" : "s"
    } older than ${STALE_AFTER_DAYS} days`,
  );

  return NextResponse.json({
    ok: true,
    abandoned: {
      cutoff: abandonedCutoff.toISOString(),
      deleted: deletedCount,
      ids: (deleted ?? []).map((r) => r.id),
    },
    stale: {
      cutoff: staleCutoff.toISOString(),
      count: staleCount,
      assessments: stale ?? [],
    },
  });
}
