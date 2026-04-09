/**
 * ReadyState — shared read-side queries for user-scoped assessment data.
 *
 * The dashboard and history pages both need the same "all my assessments
 * with their scores and org names" query. This module owns the canonical
 * shape of that row so the two pages can't drift.
 *
 * All reads run in the caller's Clerk auth context; RLS filters to the
 * user's own rows automatically. The explicit `.eq('clerk_user_id', …)`
 * is belt-and-braces — remove if/when you're confident in RLS.
 */

import { createClient } from "@/lib/supabase/server";
import type { RiskLevel } from "@/lib/assessment/scoring";

export interface UserAssessmentRow {
  id: string;
  site_name: string | null;
  site_address: string | null;
  status: "in_progress" | "complete";
  created_at: string;
  updated_at: string;
  org_name: string | null;
  org_industry: string | null;
  sb553_score: number | null;
  asis_score: number | null;
  hazard_score: number | null;
  overall_score: number | null;
  risk_level: RiskLevel | null;
}

/** Normalize Supabase's array-vs-object foreign-table responses. */
function single<T>(v: T | T[] | null | undefined): T | null {
  if (v == null) return null;
  return Array.isArray(v) ? (v[0] ?? null) : v;
}

export async function getUserAssessments(
  userId: string,
): Promise<UserAssessmentRow[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("assessments")
    .select(
      `
      id, site_name, site_address, status, created_at, updated_at,
      organizations ( name, industry ),
      assessment_scores ( sb553_score, asis_score, hazard_score, overall_score, risk_level )
    `,
    )
    .eq("clerk_user_id", userId)
    .order("updated_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to load assessments: ${error.message}`);
  }

  if (!data) return [];

  return data.map((row) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const r = row as any;
    const org = single<{ name: string | null; industry: string | null }>(
      r.organizations,
    );
    const scores = single<{
      sb553_score: number | null;
      asis_score: number | null;
      hazard_score: number | null;
      overall_score: number | null;
      risk_level: RiskLevel | null;
    }>(r.assessment_scores);

    return {
      id: r.id,
      site_name: r.site_name,
      site_address: r.site_address,
      status: r.status,
      created_at: r.created_at,
      updated_at: r.updated_at,
      org_name: org?.name ?? null,
      org_industry: org?.industry ?? null,
      sb553_score: scores?.sb553_score ?? null,
      asis_score: scores?.asis_score ?? null,
      hazard_score: scores?.hazard_score ?? null,
      overall_score: scores?.overall_score ?? null,
      risk_level: scores?.risk_level ?? null,
    };
  });
}
