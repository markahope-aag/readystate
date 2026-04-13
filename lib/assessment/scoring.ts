/**
 * ReadyState — SB 553 Assessment Scoring Engine (v2)
 *
 * Simplified from the v1 three-section model (SB 553 / ASIS / Hazard with
 * 50/30/20 weighting) to a single SB 553 compliance score across 10
 * statutory categories.
 *
 * Scoring rules:
 *   Per category: max = weight * 4 (full marks for "effective")
 *     effective     = weight * 4
 *     implemented   = weight * 3
 *     partial       = weight * 2
 *     not_compliant = 0
 *     na            = excluded from both earned and max
 *   Overall score = round(earned / max * 100), 0–100 integer
 *   Risk level: 0–39 critical, 40–59 high, 60–79 moderate, 80–100 low
 *
 * The bands are tighter than v1 because the v2 selector gives more
 * resolution (5 levels vs 4), so "partial" across the board lands at 50
 * which is correctly "high risk" rather than appearing moderate.
 */

import { createServiceRoleClient } from "@/lib/supabase/server";
import {
  categories as defaultCategories,
  type Category,
  type ResponseValue,
} from "./questions";

// ─── Types ────────────────────────────────────────────────────────────────────

export type RiskLevel = "critical" | "high" | "moderate" | "low";

export interface ScoreResult {
  overallScore: number;
  riskLevel: RiskLevel;
  earned: number;
  max: number;
  answeredCount: number;
  naCount: number;
  skippedCount: number;
  /** Per-category breakdown */
  categoryScores: CategoryScore[];
}

export interface CategoryScore {
  categoryId: string;
  title: string;
  weight: 1 | 2 | 3;
  response: ResponseValue | null;
  earned: number;
  max: number;
  /** 0–100 for this category alone, or null if N/A/skipped */
  score: number | null;
}

export interface ResponseRow {
  question_id: string;
  response: string;
}

// ─── Risk level helpers ──────────────────────────────────────────────────────

export function getRiskLevel(score: number): RiskLevel {
  if (score >= 80) return "low";
  if (score >= 60) return "moderate";
  if (score >= 40) return "high";
  return "critical";
}

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

export function getRiskLabel(level: RiskLevel): {
  label: string;
  description: string;
} {
  switch (level) {
    case "low":
      return {
        label: "Low risk",
        description:
          "The prevention program is substantially compliant with SB 553. Requirements are implemented and demonstrably effective. Minor gaps may remain but do not represent immediate citation risk.",
      };
    case "moderate":
      return {
        label: "Moderate risk",
        description:
          "The program meets most statutory requirements but has meaningful gaps in implementation or effectiveness verification. Remediation should be prioritized within the next 90 days to avoid exposure.",
      };
    case "high":
      return {
        label: "High risk",
        description:
          "Significant compliance gaps exist. The program has serious deficiencies relative to SB 553 requirements. Immediate remediation planning is required — the organization is exposed to Cal/OSHA citation.",
      };
    case "critical":
      return {
        label: "Critical risk",
        description:
          "The program fails to meet core SB 553 statutory requirements. Multiple critical areas are non-compliant or missing entirely. Urgent action required — the organization faces direct citation risk and potential liability exposure.",
      };
  }
}

// ─── Pure scoring ─────────────────────────────────────────────────────────────

function isResponseValue(v: string): v is ResponseValue {
  return (
    v === "effective" ||
    v === "implemented" ||
    v === "partial" ||
    v === "not_compliant" ||
    v === "na"
  );
}

function earnedForResponse(
  response: ResponseValue,
  weight: number,
): number {
  switch (response) {
    case "effective":
      return weight * 4;
    case "implemented":
      return weight * 3;
    case "partial":
      return weight * 2;
    case "not_compliant":
      return 0;
    case "na":
      return 0; // excluded from max too
  }
}

/**
 * Pure scoring function. Given response rows and category bank, returns
 * overall score + per-category breakdown. No side effects.
 */
export function computeScores(
  responses: ResponseRow[],
  categoryBank: Category[] = defaultCategories,
): ScoreResult {
  const responseMap = new Map<string, ResponseValue>();
  for (const r of responses) {
    if (isResponseValue(r.response)) {
      responseMap.set(r.question_id, r.response);
    }
  }

  const activeCategories = categoryBank.filter((c) => !c.deprecated);

  let totalEarned = 0;
  let totalMax = 0;
  let answeredCount = 0;
  let naCount = 0;
  let skippedCount = 0;

  const categoryScores: CategoryScore[] = activeCategories.map((cat) => {
    const response = responseMap.get(cat.id) ?? null;
    const catMax = cat.weight * 4;

    if (!response) {
      skippedCount++;
      return {
        categoryId: cat.id,
        title: cat.title,
        weight: cat.weight,
        response: null,
        earned: 0,
        max: catMax,
        score: null,
      };
    }

    if (response === "na") {
      naCount++;
      return {
        categoryId: cat.id,
        title: cat.title,
        weight: cat.weight,
        response,
        earned: 0,
        max: 0,
        score: null,
      };
    }

    answeredCount++;
    const earned = earnedForResponse(response, cat.weight);
    totalEarned += earned;
    totalMax += catMax;

    return {
      categoryId: cat.id,
      title: cat.title,
      weight: cat.weight,
      response,
      earned,
      max: catMax,
      score: Math.round((earned / catMax) * 100),
    };
  });

  const overallScore =
    totalMax === 0 ? 100 : Math.round((totalEarned / totalMax) * 100);

  return {
    overallScore,
    riskLevel: getRiskLevel(overallScore),
    earned: totalEarned,
    max: totalMax,
    answeredCount,
    naCount,
    skippedCount,
    categoryScores,
  };
}

// ─── Orchestrator ─────────────────────────────────────────────────────────────

/**
 * End-to-end scoring: fetch responses → compute → persist scores →
 * flip assessment status to complete.
 */
export async function calculateScores(
  assessmentId: string,
): Promise<ScoreResult> {
  const supabase = createServiceRoleClient();

  const { data: responses, error: fetchError } = await supabase
    .from("assessment_responses")
    .select("question_id, response")
    .eq("assessment_id", assessmentId);

  if (fetchError) {
    throw new Error(`Failed to load responses: ${fetchError.message}`);
  }

  const result = computeScores((responses as ResponseRow[] | null) ?? []);

  // Upsert scores — reuse existing columns, map new model
  const { error: upsertError } = await supabase
    .from("assessment_scores")
    .upsert(
      {
        assessment_id: assessmentId,
        sb553_score: result.overallScore, // single-section now
        asis_score: null, // retired
        hazard_score: null, // retired
        overall_score: result.overallScore,
        risk_level: result.riskLevel,
      },
      { onConflict: "assessment_id" },
    );

  if (upsertError) {
    throw new Error(`Failed to save scores: ${upsertError.message}`);
  }

  const { error: updateError } = await supabase
    .from("assessments")
    .update({
      status: "complete",
      updated_at: new Date().toISOString(),
    })
    .eq("id", assessmentId);

  if (updateError) {
    throw new Error(
      `Failed to update assessment status: ${updateError.message}`,
    );
  }

  return result;
}
