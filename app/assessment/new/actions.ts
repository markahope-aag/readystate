"use server";

import { createServiceRoleClient } from "@/lib/supabase/server";
import { calculateScores, type ScoreResult } from "@/lib/assessment/scoring";

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
    return {
      ok: false,
      error: assessError?.message ?? "Failed to create assessment",
    };
  }

  return { ok: true, data: { assessmentId: assessment.id, orgId: org.id } };
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
