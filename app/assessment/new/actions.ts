"use server";

import { createServiceRoleClient } from "@/lib/supabase/server";
import { calculateScores, type ScoreResult } from "@/lib/assessment/scoring";
import { sendResumeLinkEmail } from "@/lib/email/send-report";

/**
 * Retention window (in days) for saved in-progress assessments.
 * Must stay in sync with ABANDONED_AFTER_DAYS in /api/cron/flag-stale/route.ts.
 *
 * Not exported — "use server" modules may only export async functions.
 */
const SAVE_FOR_LATER_RETENTION_DAYS = 30;

type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

export type ResponseValue = "yes" | "no" | "partial" | "na";

export interface OrgInfoInput {
  orgName: string;
  industry: string;
  employeeCount: number;
  californiaLocations: number;
  siteName: string;
  siteAddress: string;
}

/**
 * Step 0 — creates an organizations row and an assessments row for the
 * anonymous user. Returns both IDs so the wizard can persist the
 * assessment ID in the URL for resume.
 *
 * Service-role Supabase writes bypass RLS. UUIDs are the effective
 * bearer — anyone with the assessment id can read/write that row.
 */
export async function createOrgAndAssessment(
  input: OrgInfoInput,
): Promise<ActionResult<{ assessmentId: string; orgId: string }>> {
  try {
    const supabase = createServiceRoleClient();

    const { data: org, error: orgError } = await supabase
      .from("organizations")
      .insert({
        name: input.orgName,
        industry: input.industry,
        employee_count: input.employeeCount,
        california_locations: input.californiaLocations,
      })
      .select("id")
      .single();

    if (orgError || !org) {
      console.error("[createOrgAndAssessment] org insert failed", orgError);
      return {
        ok: false,
        error: orgError?.message ?? "Failed to create organization",
      };
    }

    const { data: assessment, error: assessError } = await supabase
      .from("assessments")
      .insert({
        org_id: org.id,
        clerk_user_id: null,
        site_name: input.siteName,
        site_address: input.siteAddress,
        status: "in_progress",
      })
      .select("id")
      .single();

    if (assessError || !assessment) {
      console.error(
        "[createOrgAndAssessment] assessment insert failed",
        assessError,
      );
      return {
        ok: false,
        error: assessError?.message ?? "Failed to create assessment",
      };
    }

    return {
      ok: true,
      data: { assessmentId: assessment.id, orgId: org.id },
    };
  } catch (e) {
    console.error("[createOrgAndAssessment] unexpected error", e);
    return {
      ok: false,
      error:
        e instanceof Error
          ? e.message
          : "Unexpected error creating assessment",
    };
  }
}

/**
 * Steps 1–3 — idempotent upsert of a single question response. Relies on
 * the unique constraint (assessment_id, question_id) from migration 003.
 */
export async function saveResponse(input: {
  assessmentId: string;
  questionId: string;
  response: ResponseValue;
  notes?: string | null;
}): Promise<ActionResult<null>> {
  const supabase = createServiceRoleClient();
  const { error } = await supabase.from("assessment_responses").upsert(
    {
      assessment_id: input.assessmentId,
      question_id: input.questionId,
      response: input.response,
      notes: input.notes ?? null,
    },
    { onConflict: "assessment_id,question_id" },
  );

  if (error) return { ok: false, error: error.message };
  return { ok: true, data: null };
}

/**
 * Step 4 — compute and persist scores, then flip assessment status to
 * complete. Delegates to `calculateScores` in the scoring engine.
 */
export async function finalizeAssessment(
  assessmentId: string,
): Promise<ActionResult<ScoreResult>> {
  try {
    const result = await calculateScores(assessmentId);
    return { ok: true, data: result };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Failed to finalize assessment",
    };
  }
}

/**
 * Save-for-later: stores the email against the assessment and emails
 * the user a resume link. The assessment stays in the database for
 * SAVE_FOR_LATER_RETENTION_DAYS days; after that the daily cron deletes it.
 */
export async function saveForLater(input: {
  assessmentId: string;
  email: string;
}): Promise<ActionResult<{ messageId: string | null }>> {
  try {
    const email = input.email.trim().toLowerCase();
    if (!email) {
      return { ok: false, error: "Please enter an email address." };
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return { ok: false, error: "Please enter a valid email address." };
    }

    const supabase = createServiceRoleClient();

    // Update the assessment with the email and touch updated_at so the
    // cron retention window resets from this save point.
    const { error: updateError } = await supabase
      .from("assessments")
      .update({
        contact_email: email,
        updated_at: new Date().toISOString(),
      })
      .eq("id", input.assessmentId);

    if (updateError) {
      console.error("[saveForLater] update failed", updateError);
      return { ok: false, error: updateError.message };
    }

    // Fetch org + site info for the email body.
    const { data: assessment, error: fetchError } = await supabase
      .from("assessments")
      .select("site_name, organizations(name)")
      .eq("id", input.assessmentId)
      .maybeSingle();

    if (fetchError || !assessment) {
      return { ok: false, error: "Assessment not found" };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rawOrg = (assessment as any).organizations;
    const org = Array.isArray(rawOrg) ? (rawOrg[0] ?? null) : (rawOrg ?? null);

    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL ?? "https://readystate.now";
    const resumeUrl = `${appUrl}/assessment/new?id=${input.assessmentId}`;

    const sendResult = await sendResumeLinkEmail({
      to: email,
      orgName: org?.name ?? null,
      siteName: assessment.site_name ?? null,
      resumeUrl,
      expiresInDays: SAVE_FOR_LATER_RETENTION_DAYS,
    });

    if (!sendResult.ok) {
      return { ok: false, error: sendResult.error };
    }

    return { ok: true, data: { messageId: sendResult.messageId } };
  } catch (e) {
    console.error("[saveForLater] unexpected error", e);
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Failed to save assessment",
    };
  }
}
