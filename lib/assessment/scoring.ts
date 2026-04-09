/**
 * ReadyState — Assessment scoring engine
 *
 * Two layers:
 *   1. `computeScores(responses, questionBank)` — pure function. Does all
 *      the math. Safe to unit test without hitting Supabase. Safe to use
 *      client-side for a live preview in the wizard if we want one later.
 *
 *   2. `calculateScores(assessmentId)` — orchestrator. Fetches responses,
 *      delegates to `computeScores`, upserts `assessment_scores`, flips
 *      `assessments.status` to `complete`, returns the score object.
 *      Runs in the current Clerk user's auth context — RLS ensures users
 *      can only score their own assessments.
 *
 * Scoring rules (per spec):
 *   - Per question: max = weight * 2, earned = yes:weight*2 | partial:weight*1 | no:0
 *   - N/A questions are excluded from both earned and max
 *   - Skipped questions (no row) are treated the same as N/A
 *   - Section score = round(earned / max * 100), 0–100 integer
 *   - Special case: if section max is 0 (all N/A'd), section score = 100
 *   - Overall = round(0.5 * sb553 + 0.3 * asis + 0.2 * hazard)
 *   - Risk level: 0–49 critical, 50–69 high, 70–84 moderate, 85–100 low
 */

import { createServiceRoleClient } from "@/lib/supabase/server";
import {
  questions as defaultQuestionBank,
  type Question,
  type QuestionSection,
} from "./questions";

// ─── Types ────────────────────────────────────────────────────────────────────

export type ResponseValue = "yes" | "no" | "partial" | "na";

export type RiskLevel = "critical" | "high" | "moderate" | "low";

export interface SectionScore {
  section: QuestionSection;
  /** 0–100 integer */
  score: number;
  earned: number;
  max: number;
  /** Count of non-N/A, non-skipped responses */
  answered: number;
  naCount: number;
  skippedCount: number;
}

export interface ScoreResult {
  sb553Score: number;
  asisScore: number;
  hazardScore: number;
  overallScore: number;
  riskLevel: RiskLevel;
  sections: SectionScore[];
}

export interface ResponseRow {
  question_id: string;
  response: string;
}

// ─── Risk level helpers ──────────────────────────────────────────────────────

/**
 * Map a 0–100 overall score to a risk band.
 * Boundaries: ≥85 low, ≥70 moderate, ≥50 high, else critical.
 */
export function getRiskLevel(score: number): RiskLevel {
  if (score >= 85) return "low";
  if (score >= 70) return "moderate";
  if (score >= 50) return "high";
  return "critical";
}

/**
 * Tailwind classes for each risk level. Split by slot so callers can
 * compose (e.g., bg + text together, or just border for an outline).
 */
export function getRiskColor(level: RiskLevel): {
  bg: string;
  text: string;
  border: string;
  ring: string;
  accent: string;
} {
  switch (level) {
    case "low":
      return {
        bg: "bg-emerald-50",
        text: "text-emerald-900",
        border: "border-emerald-200",
        ring: "ring-emerald-500",
        accent: "text-emerald-600",
      };
    case "moderate":
      return {
        bg: "bg-sky-50",
        text: "text-sky-900",
        border: "border-sky-200",
        ring: "ring-sky-500",
        accent: "text-sky-600",
      };
    case "high":
      return {
        bg: "bg-amber-50",
        text: "text-amber-900",
        border: "border-amber-200",
        ring: "ring-amber-500",
        accent: "text-amber-600",
      };
    case "critical":
      return {
        bg: "bg-red-50",
        text: "text-red-900",
        border: "border-red-200",
        ring: "ring-red-500",
        accent: "text-red-600",
      };
  }
}

/**
 * Human-readable label and short rationale for a risk band.
 * Used by the report UI and PDF export.
 */
export function getRiskLabel(level: RiskLevel): {
  label: string;
  description: string;
} {
  switch (level) {
    case "low":
      return {
        label: "Low risk",
        description:
          "The program is substantially aligned with SB 553 statutory requirements and professional best practices. Minor gaps may remain but do not represent immediate compliance or liability exposure.",
      };
    case "moderate":
      return {
        label: "Moderate risk",
        description:
          "The program meets most statutory minimums but has meaningful gaps in professional standards or site hazard controls. Remediation should be prioritized within the next 90 days.",
      };
    case "high":
      return {
        label: "High risk",
        description:
          "Significant compliance gaps exist. The program has serious deficiencies relative to SB 553 requirements or the site's hazard profile. Immediate remediation planning is required.",
      };
    case "critical":
      return {
        label: "Critical risk",
        description:
          "The program fails to meet core SB 553 statutory requirements or has severe site hazard exposure. Urgent action required — the organization is at direct risk of Cal/OSHA citation and employee harm.",
      };
  }
}

// ─── Pure scoring ─────────────────────────────────────────────────────────────

function isResponseValue(value: string): value is ResponseValue {
  return (
    value === "yes" || value === "no" || value === "partial" || value === "na"
  );
}

function computeSectionScore(
  section: QuestionSection,
  sectionQuestions: Question[],
  responseMap: Map<string, ResponseValue>,
): SectionScore {
  let earned = 0;
  let max = 0;
  let answered = 0;
  let naCount = 0;
  let skippedCount = 0;

  for (const q of sectionQuestions) {
    const response = responseMap.get(q.id);

    // No row in assessment_responses → treated as N/A (no credit, no penalty)
    if (!response) {
      skippedCount++;
      continue;
    }

    if (response === "na") {
      naCount++;
      continue;
    }

    answered++;
    max += q.weight * 2;

    if (response === "yes") {
      earned += q.weight * 2;
    } else if (response === "partial") {
      earned += q.weight * 1;
    }
    // 'no' contributes 0 earned (but still adds to max)
  }

  // All-N/A case: no questions contributed to max. Default to 100 (nothing
  // was answered 'no', so there's nothing to fail). Callers that want a
  // different default can inspect `answered === 0` on the returned object.
  const score = max === 0 ? 100 : Math.round((earned / max) * 100);

  return { section, score, earned, max, answered, naCount, skippedCount };
}

/**
 * Pure scoring function. Given a set of response rows and a question bank,
 * returns section scores, an overall weighted score, and a risk level.
 *
 * No side effects — no Supabase, no fetch, no state mutation.
 *
 * @param responses - rows from assessment_responses (only id + response used)
 * @param questionBank - defaults to the real question bank; tests pass stubs
 */
export function computeScores(
  responses: ResponseRow[],
  questionBank: Question[] = defaultQuestionBank,
): ScoreResult {
  const responseMap = new Map<string, ResponseValue>();
  for (const r of responses) {
    if (isResponseValue(r.response)) {
      responseMap.set(r.question_id, r.response);
    }
  }

  const activeQuestions = questionBank.filter((q) => !q.deprecated);

  const sb553 = computeSectionScore(
    "sb553",
    activeQuestions.filter((q) => q.section === "sb553"),
    responseMap,
  );
  const asis = computeSectionScore(
    "asis",
    activeQuestions.filter((q) => q.section === "asis"),
    responseMap,
  );
  const hazard = computeSectionScore(
    "hazard",
    activeQuestions.filter((q) => q.section === "hazard"),
    responseMap,
  );

  const overallScore = Math.round(
    sb553.score * 0.5 + asis.score * 0.3 + hazard.score * 0.2,
  );

  return {
    sb553Score: sb553.score,
    asisScore: asis.score,
    hazardScore: hazard.score,
    overallScore,
    riskLevel: getRiskLevel(overallScore),
    sections: [sb553, asis, hazard],
  };
}

// ─── Orchestrator (side-effecting) ───────────────────────────────────────────

/**
 * End-to-end scoring: fetch responses → compute → persist scores → flip
 * assessment status to complete. Uses the Supabase service role since
 * ReadyState runs anonymously — no per-user auth context to inherit.
 *
 * Throws on any Supabase error. Caller (e.g. the wizard's finalize action)
 * should catch and surface a user-friendly error.
 */
export async function calculateScores(
  assessmentId: string,
): Promise<ScoreResult> {
  const supabase = createServiceRoleClient();

  // 1. Fetch all responses for this assessment
  const { data: responses, error: fetchError } = await supabase
    .from("assessment_responses")
    .select("question_id, response")
    .eq("assessment_id", assessmentId);

  if (fetchError) {
    throw new Error(`Failed to load responses: ${fetchError.message}`);
  }

  // 2. Compute (pure)
  const result = computeScores((responses as ResponseRow[] | null) ?? []);

  // 3. Upsert scores (unique on assessment_id)
  const { error: upsertError } = await supabase
    .from("assessment_scores")
    .upsert(
      {
        assessment_id: assessmentId,
        sb553_score: result.sb553Score,
        asis_score: result.asisScore,
        hazard_score: result.hazardScore,
        overall_score: result.overallScore,
        risk_level: result.riskLevel,
      },
      { onConflict: "assessment_id" },
    );

  if (upsertError) {
    throw new Error(`Failed to save scores: ${upsertError.message}`);
  }

  // 4. Flip assessment status to complete
  const { error: updateError } = await supabase
    .from("assessments")
    .update({
      status: "complete",
      updated_at: new Date().toISOString(),
    })
    .eq("id", assessmentId);

  if (updateError) {
    throw new Error(`Failed to update assessment status: ${updateError.message}`);
  }

  return result;
}
