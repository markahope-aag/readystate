import { describe, it, expect } from "vitest";
import {
  computeScores,
  getRiskLevel,
  getRiskColor,
  getRiskLabel,
  type RiskLevel,
} from "./scoring";
import type { Category } from "./questions";

/**
 * v2 scoring tests. Uses stubbed category banks so tests stay stable
 * if real category weights change.
 */

function makeCat(
  id: string,
  weight: 1 | 2 | 3,
): Category {
  return {
    id,
    title: "test",
    statuteRef: "test",
    description: "test",
    subRequirements: [],
    weight,
  };
}

const bank: Category[] = [
  makeCat("c1", 3),
  makeCat("c2", 3),
  makeCat("c3", 2),
  makeCat("c4", 2),
  makeCat("c5", 1),
];

describe("computeScores (v2 compliance selectors)", () => {
  it("all effective → 100 → low risk", () => {
    const responses = bank.map((c) => ({
      question_id: c.id,
      response: "effective",
    }));
    const result = computeScores(responses, bank);

    expect(result.overallScore).toBe(100);
    expect(result.riskLevel).toBe<RiskLevel>("low");
    expect(result.answeredCount).toBe(5);
  });

  it("all implemented → 75 → moderate risk", () => {
    const responses = bank.map((c) => ({
      question_id: c.id,
      response: "implemented",
    }));
    const result = computeScores(responses, bank);

    expect(result.overallScore).toBe(75);
    expect(result.riskLevel).toBe<RiskLevel>("moderate");
  });

  it("all partial → 50 → high risk", () => {
    const responses = bank.map((c) => ({
      question_id: c.id,
      response: "partial",
    }));
    const result = computeScores(responses, bank);

    expect(result.overallScore).toBe(50);
    expect(result.riskLevel).toBe<RiskLevel>("high");
  });

  it("all not_compliant → 0 → critical", () => {
    const responses = bank.map((c) => ({
      question_id: c.id,
      response: "not_compliant",
    }));
    const result = computeScores(responses, bank);

    expect(result.overallScore).toBe(0);
    expect(result.riskLevel).toBe<RiskLevel>("critical");
  });

  it("N/A categories excluded from scoring", () => {
    // c1(w3, effective)=12/12, c2(w3, na)=excluded, c3(w2, partial)=4/8
    const responses = [
      { question_id: "c1", response: "effective" },
      { question_id: "c2", response: "na" },
      { question_id: "c3", response: "partial" },
    ];
    const result = computeScores(responses, bank);

    // earned=12+4=16, max=12+8=20 → 80
    expect(result.overallScore).toBe(80);
    expect(result.riskLevel).toBe<RiskLevel>("low");
    expect(result.naCount).toBe(1);
    expect(result.answeredCount).toBe(2);
    expect(result.skippedCount).toBe(2); // c4, c5 have no response
  });

  it("skipped categories excluded like N/A", () => {
    // Only c1 answered → effective 12/12 = 100
    const responses = [{ question_id: "c1", response: "effective" }];
    const result = computeScores(responses, bank);

    expect(result.overallScore).toBe(100);
    expect(result.skippedCount).toBe(4);
    expect(result.answeredCount).toBe(1);
  });

  it("mixed responses produce correct weighted score", () => {
    // c1(w3, effective)=12/12, c2(w3, not_compliant)=0/12,
    // c3(w2, implemented)=6/8, c4(w2, partial)=4/8, c5(w1, na)=excluded
    const responses = [
      { question_id: "c1", response: "effective" },
      { question_id: "c2", response: "not_compliant" },
      { question_id: "c3", response: "implemented" },
      { question_id: "c4", response: "partial" },
      { question_id: "c5", response: "na" },
    ];
    const result = computeScores(responses, bank);

    // earned=12+0+6+4=22, max=12+12+8+8=40 → 55
    expect(result.overallScore).toBe(55);
    expect(result.riskLevel).toBe<RiskLevel>("high");
    expect(result.naCount).toBe(1);
    expect(result.answeredCount).toBe(4);
  });

  it("per-category scores are computed correctly", () => {
    const responses = [
      { question_id: "c1", response: "effective" },
      { question_id: "c3", response: "partial" },
    ];
    const result = computeScores(responses, bank);

    const c1 = result.categoryScores.find((s) => s.categoryId === "c1")!;
    expect(c1.score).toBe(100);
    expect(c1.earned).toBe(12);
    expect(c1.max).toBe(12);

    const c3 = result.categoryScores.find((s) => s.categoryId === "c3")!;
    expect(c3.score).toBe(50);
    expect(c3.earned).toBe(4);
    expect(c3.max).toBe(8);

    const c2 = result.categoryScores.find((s) => s.categoryId === "c2")!;
    expect(c2.score).toBeNull(); // skipped
  });

  it("ignores unknown response values", () => {
    const responses = [
      { question_id: "c1", response: "effective" },
      { question_id: "c2", response: "maybe" }, // garbage → skipped
    ];
    const result = computeScores(responses, bank);

    expect(result.overallScore).toBe(100); // only c1 counted
    expect(result.skippedCount).toBe(4); // c2 (garbage), c3, c4, c5
  });

  it("all-N/A defaults to 100", () => {
    const responses = bank.map((c) => ({
      question_id: c.id,
      response: "na",
    }));
    const result = computeScores(responses, bank);

    expect(result.overallScore).toBe(100);
    expect(result.naCount).toBe(5);
  });
});

describe("getRiskLevel (v2 bands)", () => {
  it("classifies boundaries correctly", () => {
    expect(getRiskLevel(100)).toBe<RiskLevel>("low");
    expect(getRiskLevel(80)).toBe<RiskLevel>("low");
    expect(getRiskLevel(79)).toBe<RiskLevel>("moderate");
    expect(getRiskLevel(60)).toBe<RiskLevel>("moderate");
    expect(getRiskLevel(59)).toBe<RiskLevel>("high");
    expect(getRiskLevel(40)).toBe<RiskLevel>("high");
    expect(getRiskLevel(39)).toBe<RiskLevel>("critical");
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
