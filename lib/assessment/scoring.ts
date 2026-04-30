/**
 * ReadyState — SB 553 Assessment Scoring Engine (v3)
 *
 * Per-question Y / N / Partial / N/A across four sections.
 *
 * Scoring rules (v3):
 *   Per question max = weight (so a w3 Y is worth 3 of 3, a w1 Y is 1 of 1)
 *     yes      → weight × 1.0 earned
 *     partial  → weight × 0.5 earned
 *     no       → 0 earned, weight max
 *     na       → 0 earned, 0 max (excluded)
 *     skipped  → 0 earned, 0 max (excluded; surfaced separately)
 *   Section score = round(section_earned / section_max × 100), or null if all N/A
 *   Overall score = round(total_earned / total_max × 100)
 *   Risk bands: 0–39 critical, 40–59 high, 60–79 moderate, 80–100 low
 *
 * v2 BACKWARD COMPAT: completed v2 assessments persisted their scores in
 * `assessment_scores`. We keep `computeScoresLegacy` so historical results
 * pages still render the per-category breakdown from the original IDs.
 */

import { createServiceRoleClient } from "@/lib/supabase/server";
import {
  detectModel,
  getActiveSections,
  isSectionNotesId,
  legacyCategories,
  type LegacyCategory,
  type Question,
  type ResponseValue,
  type Section,
} from "./questions";

// ─── Types ────────────────────────────────────────────────────────────────────

export type RiskLevel = "critical" | "high" | "moderate" | "low";

export interface SectionScore {
  sectionId: Section["id"];
  title: string;
  earned: number;
  max: number;
  /** 0–100 for this section, or null if no scoreable questions */
  score: number | null;
  answeredCount: number;
  totalQuestions: number;
}

export interface QuestionScore {
  questionId: string;
  sectionId: Section["id"];
  prompt: string;
  weight: 1 | 2 | 3;
  response: ResponseValue | null;
  earned: number;
  max: number;
}

export interface ScoreResult {
  overallScore: number;
  riskLevel: RiskLevel;
  earned: number;
  max: number;
  answeredCount: number;
  naCount: number;
  skippedCount: number;
  sectionScores: SectionScore[];
  questionScores: QuestionScore[];
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

// ─── Pure scoring (v3) ───────────────────────────────────────────────────────

function isResponseValue(v: string): v is ResponseValue {
  return v === "yes" || v === "no" || v === "partial" || v === "na";
}

function earnedForResponse(
  response: ResponseValue,
  weight: number,
): number {
  switch (response) {
    case "yes":
      return weight;
    case "partial":
      return weight * 0.5;
    case "no":
    case "na":
      return 0;
  }
}

/**
 * Pure scoring function. Given response rows + a section bank, returns
 * overall score, per-section breakdown, and per-question detail.
 */
export function computeScores(
  responses: ResponseRow[],
  sectionBank: Section[] = getActiveSections(),
): ScoreResult {
  const responseMap = new Map<string, ResponseValue>();
  for (const r of responses) {
    if (isSectionNotesId(r.question_id)) continue; // skip notes pseudo-rows
    if (isResponseValue(r.response)) {
      responseMap.set(r.question_id, r.response);
    }
  }

  let totalEarned = 0;
  let totalMax = 0;
  let answeredCount = 0;
  let naCount = 0;
  let skippedCount = 0;

  const sectionScores: SectionScore[] = [];
  const questionScores: QuestionScore[] = [];

  for (const section of sectionBank) {
    let sectionEarned = 0;
    let sectionMax = 0;
    let sectionAnswered = 0;
    const activeQuestions = section.questions.filter((q) => !q.deprecated);

    for (const q of activeQuestions) {
      const response = responseMap.get(q.id) ?? null;
      const qMax = q.weight;

      if (!response) {
        skippedCount++;
        questionScores.push({
          questionId: q.id,
          sectionId: section.id,
          prompt: q.prompt,
          weight: q.weight,
          response: null,
          earned: 0,
          max: qMax,
        });
        continue;
      }

      if (response === "na") {
        naCount++;
        questionScores.push({
          questionId: q.id,
          sectionId: section.id,
          prompt: q.prompt,
          weight: q.weight,
          response,
          earned: 0,
          max: 0,
        });
        continue;
      }

      const earned = earnedForResponse(response, q.weight);
      sectionEarned += earned;
      sectionMax += qMax;
      totalEarned += earned;
      totalMax += qMax;
      sectionAnswered++;
      answeredCount++;

      questionScores.push({
        questionId: q.id,
        sectionId: section.id,
        prompt: q.prompt,
        weight: q.weight,
        response,
        earned,
        max: qMax,
      });
    }

    sectionScores.push({
      sectionId: section.id,
      title: section.title,
      earned: sectionEarned,
      max: sectionMax,
      score:
        sectionMax === 0
          ? null
          : Math.round((sectionEarned / sectionMax) * 100),
      answeredCount: sectionAnswered,
      totalQuestions: activeQuestions.length,
    });
  }

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
    sectionScores,
    questionScores,
  };
}

// ─── Legacy v2 scoring (read-only — for old completed assessments) ────────────

export interface LegacyCategoryScore {
  categoryId: string;
  title: string;
  weight: 1 | 2 | 3;
  response: string | null;
  earned: number;
  max: number;
  score: number | null;
}

export interface LegacyScoreResult {
  overallScore: number;
  riskLevel: RiskLevel;
  earned: number;
  max: number;
  answeredCount: number;
  naCount: number;
  skippedCount: number;
  categoryScores: LegacyCategoryScore[];
}

const LEGACY_VALUES = new Set([
  "effective",
  "implemented",
  "partial",
  "not_compliant",
  "na",
]);

function legacyEarned(response: string, weight: number): number {
  switch (response) {
    case "effective":
      return weight * 4;
    case "implemented":
      return weight * 3;
    case "partial":
      return weight * 2;
    default:
      return 0;
  }
}

export function computeScoresLegacy(
  responses: ResponseRow[],
  bank: LegacyCategory[] = legacyCategories,
): LegacyScoreResult {
  const map = new Map<string, string>();
  for (const r of responses) {
    if (LEGACY_VALUES.has(r.response)) map.set(r.question_id, r.response);
  }

  let earned = 0;
  let max = 0;
  let answered = 0;
  let na = 0;
  let skipped = 0;

  const categoryScores: LegacyCategoryScore[] = bank
    .filter((c) => !c.deprecated)
    .map((c) => {
      const response = map.get(c.id) ?? null;
      const catMax = c.weight * 4;

      if (!response) {
        skipped++;
        return {
          categoryId: c.id,
          title: c.title,
          weight: c.weight,
          response: null,
          earned: 0,
          max: catMax,
          score: null,
        };
      }
      if (response === "na") {
        na++;
        return {
          categoryId: c.id,
          title: c.title,
          weight: c.weight,
          response,
          earned: 0,
          max: 0,
          score: null,
        };
      }

      answered++;
      const e = legacyEarned(response, c.weight);
      earned += e;
      max += catMax;
      return {
        categoryId: c.id,
        title: c.title,
        weight: c.weight,
        response,
        earned: e,
        max: catMax,
        score: Math.round((e / catMax) * 100),
      };
    });

  const overallScore = max === 0 ? 100 : Math.round((earned / max) * 100);
  return {
    overallScore,
    riskLevel: getRiskLevel(overallScore),
    earned,
    max,
    answeredCount: answered,
    naCount: na,
    skippedCount: skipped,
    categoryScores,
  };
}

// ─── Orchestrator ─────────────────────────────────────────────────────────────

/**
 * End-to-end scoring: fetch responses → compute → persist scores →
 * flip assessment status to complete. Dispatches to v2 or v3 based on
 * the IDs present in the response rows.
 */
export async function calculateScores(
  assessmentId: string,
): Promise<ScoreResult | LegacyScoreResult> {
  const supabase = createServiceRoleClient();

  const { data: responses, error: fetchError } = await supabase
    .from("assessment_responses")
    .select("question_id, response")
    .eq("assessment_id", assessmentId);

  if (fetchError) {
    throw new Error(`Failed to load responses: ${fetchError.message}`);
  }

  const rows = (responses as ResponseRow[] | null) ?? [];
  const realRows = rows.filter((r) => !isSectionNotesId(r.question_id));
  const model = detectModel(realRows.map((r) => r.question_id));
  const result =
    model === "v2" ? computeScoresLegacy(realRows) : computeScores(realRows);

  const { error: upsertError } = await supabase
    .from("assessment_scores")
    .upsert(
      {
        assessment_id: assessmentId,
        sb553_score: result.overallScore,
        asis_score: null,
        hazard_score: null,
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

// ─── Re-exports kept for callers that still import them ──────────────────────

export type { Question, Section };
