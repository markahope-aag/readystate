import { describe, it, expect } from "vitest";
import {
  computeScores,
  getRiskLevel,
  getRiskColor,
  getRiskLabel,
  type RiskLevel,
} from "./scoring";
import type { Question, QuestionSection } from "./questions";

/**
 * Unit tests for the pure scoring function. These use stubbed question
 * banks so the tests remain stable if real question weights change.
 */

function makeQuestion(
  id: string,
  section: QuestionSection,
  weight: 1 | 2 | 3,
): Question {
  return {
    id,
    section,
    category: "test",
    question: "test",
    guidance: "test",
    weight,
    responseType: "yes_no_partial",
  };
}

// Small balanced bank used by perfect/partial/no tests
const balancedBank: Question[] = [
  makeQuestion("s1", "sb553", 3),
  makeQuestion("s2", "sb553", 2),
  makeQuestion("a1", "asis", 3),
  makeQuestion("a2", "asis", 1),
  makeQuestion("h1", "hazard", 2),
  makeQuestion("h2", "hazard", 3),
];

describe("computeScores", () => {
  it("perfect score when every question answered 'yes' → low risk", () => {
    const responses = balancedBank.map((q) => ({
      question_id: q.id,
      response: "yes",
    }));

    const result = computeScores(responses, balancedBank);

    expect(result.sb553Score).toBe(100);
    expect(result.asisScore).toBe(100);
    expect(result.hazardScore).toBe(100);
    expect(result.overallScore).toBe(100);
    expect(result.riskLevel).toBe<RiskLevel>("low");
  });

  it("all 'partial' → 50% per section → 50 overall → high risk", () => {
    const responses = balancedBank.map((q) => ({
      question_id: q.id,
      response: "partial",
    }));

    const result = computeScores(responses, balancedBank);

    expect(result.sb553Score).toBe(50);
    expect(result.asisScore).toBe(50);
    expect(result.hazardScore).toBe(50);
    expect(result.overallScore).toBe(50);
    expect(result.riskLevel).toBe<RiskLevel>("high");
  });

  it("all 'no' → 0 across the board → critical risk", () => {
    const responses = balancedBank.map((q) => ({
      question_id: q.id,
      response: "no",
    }));

    const result = computeScores(responses, balancedBank);

    expect(result.sb553Score).toBe(0);
    expect(result.asisScore).toBe(0);
    expect(result.hazardScore).toBe(0);
    expect(result.overallScore).toBe(0);
    expect(result.riskLevel).toBe<RiskLevel>("critical");
  });

  it("N/A questions are excluded from both earned and max", () => {
    // Hand-crafted scenario with explicit expected math:
    //
    //   sb553:
    //     s1 (w=3, yes)  → earned 6, max 6
    //     s2 (w=2, na)   → excluded entirely
    //     s3 (w=2, no)   → earned 0, max 4
    //     total: 6 / 10 = 60%
    //
    //   asis:
    //     a1 (w=3, yes)  → earned 6, max 6
    //     total: 6 / 6 = 100%
    //
    //   hazard:
    //     h1 (w=2, na)   → excluded
    //     h2 (w=3, yes)  → earned 6, max 6
    //     total: 6 / 6 = 100%
    //
    //   overall: 0.5*60 + 0.3*100 + 0.2*100 = 30 + 30 + 20 = 80
    //   → moderate (70–84)

    const bank: Question[] = [
      makeQuestion("s1", "sb553", 3),
      makeQuestion("s2", "sb553", 2),
      makeQuestion("s3", "sb553", 2),
      makeQuestion("a1", "asis", 3),
      makeQuestion("h1", "hazard", 2),
      makeQuestion("h2", "hazard", 3),
    ];

    const responses = [
      { question_id: "s1", response: "yes" },
      { question_id: "s2", response: "na" },
      { question_id: "s3", response: "no" },
      { question_id: "a1", response: "yes" },
      { question_id: "h1", response: "na" },
      { question_id: "h2", response: "yes" },
    ];

    const result = computeScores(responses, bank);

    expect(result.sb553Score).toBe(60);
    expect(result.asisScore).toBe(100);
    expect(result.hazardScore).toBe(100);
    expect(result.overallScore).toBe(80);
    expect(result.riskLevel).toBe<RiskLevel>("moderate");

    // Also verify per-section breakdown counts
    const sb553 = result.sections.find((s) => s.section === "sb553")!;
    expect(sb553.answered).toBe(2); // s1 + s3
    expect(sb553.naCount).toBe(1); // s2
    expect(sb553.earned).toBe(6);
    expect(sb553.max).toBe(10);

    const hazard = result.sections.find((s) => s.section === "hazard")!;
    expect(hazard.answered).toBe(1); // h2
    expect(hazard.naCount).toBe(1); // h1
  });

  it("skipped questions (no row) are excluded just like N/A", () => {
    const bank: Question[] = [
      makeQuestion("s1", "sb553", 3), // yes → 6/6
      makeQuestion("s2", "sb553", 2), // skipped
      makeQuestion("a1", "asis", 2), // yes → 4/4
      makeQuestion("h1", "hazard", 1), // yes → 2/2
    ];

    const responses = [
      { question_id: "s1", response: "yes" },
      { question_id: "a1", response: "yes" },
      { question_id: "h1", response: "yes" },
    ];

    const result = computeScores(responses, bank);

    expect(result.sb553Score).toBe(100);
    expect(result.asisScore).toBe(100);
    expect(result.hazardScore).toBe(100);

    const sb553 = result.sections.find((s) => s.section === "sb553")!;
    expect(sb553.skippedCount).toBe(1);
    expect(sb553.answered).toBe(1);
  });

  it("all-N/A section defaults to 100 (nothing to fail)", () => {
    const bank: Question[] = [
      makeQuestion("s1", "sb553", 3),
      makeQuestion("a1", "asis", 2),
      makeQuestion("h1", "hazard", 2),
    ];

    const responses = [
      { question_id: "s1", response: "yes" },
      { question_id: "a1", response: "yes" },
      { question_id: "h1", response: "na" },
    ];

    const result = computeScores(responses, bank);

    expect(result.hazardScore).toBe(100);
    // sb553 100 + asis 100 + hazard 100 = 100 overall
    expect(result.overallScore).toBe(100);
  });

  it("ignores unknown response values", () => {
    const bank: Question[] = [
      makeQuestion("s1", "sb553", 3),
      makeQuestion("a1", "asis", 2),
      makeQuestion("h1", "hazard", 2),
    ];

    const responses = [
      { question_id: "s1", response: "yes" },
      { question_id: "a1", response: "maybe" }, // garbage → treated as skipped
      { question_id: "h1", response: "yes" },
    ];

    const result = computeScores(responses, bank);

    expect(result.sb553Score).toBe(100);
    expect(result.asisScore).toBe(100); // a1 excluded; all-N/A-like → 100
    expect(result.hazardScore).toBe(100);
  });
});

describe("getRiskLevel", () => {
  it("classifies boundaries exactly per spec", () => {
    expect(getRiskLevel(100)).toBe<RiskLevel>("low");
    expect(getRiskLevel(85)).toBe<RiskLevel>("low");
    expect(getRiskLevel(84)).toBe<RiskLevel>("moderate");
    expect(getRiskLevel(70)).toBe<RiskLevel>("moderate");
    expect(getRiskLevel(69)).toBe<RiskLevel>("high");
    expect(getRiskLevel(50)).toBe<RiskLevel>("high");
    expect(getRiskLevel(49)).toBe<RiskLevel>("critical");
    expect(getRiskLevel(0)).toBe<RiskLevel>("critical");
  });
});

describe("getRiskColor", () => {
  it("returns Tailwind class strings for every level", () => {
    for (const level of ["critical", "high", "moderate", "low"] as const) {
      const colors = getRiskColor(level);
      expect(colors.bg).toMatch(/^bg-/);
      expect(colors.text).toMatch(/^text-/);
      expect(colors.border).toMatch(/^border-/);
      expect(colors.ring).toMatch(/^ring-/);
      expect(colors.accent).toMatch(/^text-/);
    }
  });
});

describe("getRiskLabel", () => {
  it("returns label + description for every level", () => {
    for (const level of ["critical", "high", "moderate", "low"] as const) {
      const { label, description } = getRiskLabel(level);
      expect(label).toBeTruthy();
      expect(description.length).toBeGreaterThan(20);
    }
  });
});
