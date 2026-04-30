import { describe, it, expect } from "vitest";
import {
  computeScores,
  computeScoresLegacy,
  getRiskLevel,
  getRiskColor,
  getRiskLabel,
  type RiskLevel,
} from "./scoring";
import type {
  LegacyCategory,
  Question,
  Section,
} from "./questions";

/**
 * v3 scoring tests. Uses stubbed section banks so tests stay stable
 * when real question weights change.
 */

function makeQ(id: string, weight: 1 | 2 | 3): Question {
  return {
    id,
    prompt: id,
    responseType: "yes_no",
    weight,
  };
}

function makeSection(
  id: Section["id"],
  questions: Question[],
): Section {
  return {
    id,
    title: id,
    eyebrow: id,
    description: id,
    questions,
  };
}

const stubSections: Section[] = [
  makeSection("plan", [makeQ("q1", 3), makeQ("q2", 3)]),
  makeSection("people", [makeQ("q3", 2), makeQ("q4", 2)]),
  makeSection("process", [makeQ("q5", 1)]),
  makeSection("proof", [makeQ("q6", 3)]),
];

describe("computeScores (v3 yes/no/partial/na)", () => {
  it("all yes → 100 → low risk", () => {
    const responses = stubSections
      .flatMap((s) => s.questions)
      .map((q) => ({ question_id: q.id, response: "yes" }));
    const result = computeScores(responses, stubSections);

    expect(result.overallScore).toBe(100);
    expect(result.riskLevel).toBe<RiskLevel>("low");
    expect(result.answeredCount).toBe(6);
  });

  it("all partial → 50 → high risk", () => {
    const responses = stubSections
      .flatMap((s) => s.questions)
      .map((q) => ({ question_id: q.id, response: "partial" }));
    const result = computeScores(responses, stubSections);

    expect(result.overallScore).toBe(50);
    expect(result.riskLevel).toBe<RiskLevel>("high");
  });

  it("all no → 0 → critical", () => {
    const responses = stubSections
      .flatMap((s) => s.questions)
      .map((q) => ({ question_id: q.id, response: "no" }));
    const result = computeScores(responses, stubSections);

    expect(result.overallScore).toBe(0);
    expect(result.riskLevel).toBe<RiskLevel>("critical");
  });

  it("N/A questions excluded from scoring", () => {
    // q1(w3,yes)=3/3, q2(w3,na)=excluded, q3(w2,partial)=1/2
    // earned=3+1=4, max=3+2=5 → 80
    const responses = [
      { question_id: "q1", response: "yes" },
      { question_id: "q2", response: "na" },
      { question_id: "q3", response: "partial" },
    ];
    const result = computeScores(responses, stubSections);

    expect(result.overallScore).toBe(80);
    expect(result.riskLevel).toBe<RiskLevel>("low");
    expect(result.naCount).toBe(1);
    expect(result.answeredCount).toBe(2);
    expect(result.skippedCount).toBe(3); // q4, q5, q6
  });

  it("skipped questions excluded like N/A", () => {
    const responses = [{ question_id: "q1", response: "yes" }];
    const result = computeScores(responses, stubSections);

    expect(result.overallScore).toBe(100);
    expect(result.skippedCount).toBe(5);
    expect(result.answeredCount).toBe(1);
  });

  it("notes_* pseudo-rows are ignored", () => {
    const responses = [
      { question_id: "q1", response: "yes" },
      { question_id: "notes_plan", response: "na" },
    ];
    const result = computeScores(responses, stubSections);
    expect(result.overallScore).toBe(100);
    expect(result.skippedCount).toBe(5);
  });

  it("mixed responses produce correct weighted score", () => {
    // q1(w3,yes)=3/3, q2(w3,no)=0/3, q3(w2,partial)=1/2,
    // q4(w2,yes)=2/2, q5(w1,na)=excluded, q6(w3,no)=0/3
    const responses = [
      { question_id: "q1", response: "yes" },
      { question_id: "q2", response: "no" },
      { question_id: "q3", response: "partial" },
      { question_id: "q4", response: "yes" },
      { question_id: "q5", response: "na" },
      { question_id: "q6", response: "no" },
    ];
    const result = computeScores(responses, stubSections);

    // earned=3+0+1+2+0+0=6, max=3+3+2+2+0+3=13 → round(6/13×100)=46
    expect(result.overallScore).toBe(46);
    expect(result.riskLevel).toBe<RiskLevel>("high");
    expect(result.naCount).toBe(1);
    expect(result.answeredCount).toBe(5);
  });

  it("section scores are computed correctly", () => {
    const responses = [
      { question_id: "q1", response: "yes" },
      { question_id: "q2", response: "yes" },
      { question_id: "q3", response: "no" },
      { question_id: "q4", response: "no" },
    ];
    const result = computeScores(responses, stubSections);

    const plan = result.sectionScores.find((s) => s.sectionId === "plan")!;
    expect(plan.score).toBe(100);
    expect(plan.earned).toBe(6);
    expect(plan.max).toBe(6);

    const people = result.sectionScores.find((s) => s.sectionId === "people")!;
    expect(people.score).toBe(0);
    expect(people.earned).toBe(0);
    expect(people.max).toBe(4);

    const process = result.sectionScores.find(
      (s) => s.sectionId === "process",
    )!;
    expect(process.score).toBeNull(); // q5 skipped
  });

  it("section is null when only N/A answered", () => {
    const responses = [{ question_id: "q5", response: "na" }];
    const result = computeScores(responses, stubSections);
    const process = result.sectionScores.find(
      (s) => s.sectionId === "process",
    )!;
    expect(process.score).toBeNull();
  });

  it("ignores unknown response values", () => {
    const responses = [
      { question_id: "q1", response: "yes" },
      { question_id: "q2", response: "maybe" }, // garbage → skipped
    ];
    const result = computeScores(responses, stubSections);
    expect(result.overallScore).toBe(100);
    expect(result.skippedCount).toBe(5); // q2 (garbage), q3, q4, q5, q6
  });

  it("all-N/A defaults to 100", () => {
    const responses = stubSections
      .flatMap((s) => s.questions)
      .map((q) => ({ question_id: q.id, response: "na" }));
    const result = computeScores(responses, stubSections);
    expect(result.overallScore).toBe(100);
    expect(result.naCount).toBe(6);
  });
});

describe("computeScoresLegacy (v2 backward compat)", () => {
  function makeCat(id: string, weight: 1 | 2 | 3): LegacyCategory {
    return {
      id,
      title: id,
      statuteRef: id,
      description: id,
      subRequirements: [],
      weight,
    };
  }

  const bank: LegacyCategory[] = [
    makeCat("c1", 3),
    makeCat("c2", 2),
  ];

  it("scores effective/implemented/partial/not_compliant", () => {
    const responses = [
      { question_id: "c1", response: "effective" }, // 12/12
      { question_id: "c2", response: "partial" }, // 4/8
    ];
    const result = computeScoresLegacy(responses, bank);
    expect(result.overallScore).toBe(80); // 16/20
  });

  it("excludes N/A", () => {
    const responses = [
      { question_id: "c1", response: "effective" },
      { question_id: "c2", response: "na" },
    ];
    const result = computeScoresLegacy(responses, bank);
    expect(result.overallScore).toBe(100);
    expect(result.naCount).toBe(1);
  });
});

describe("getRiskLevel (bands)", () => {
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
