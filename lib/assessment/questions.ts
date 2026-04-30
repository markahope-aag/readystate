/**
 * Kestralis — SB 553 Assessment Question Bank
 * /lib/assessment/questions.ts
 *
 * ⚠️  ID STABILITY CONTRACT — READ BEFORE EDITING ⚠️
 * Question/category IDs are stored verbatim in
 * assessment_responses.question_id. Renaming or reusing an ID orphans
 * existing response rows. Append new IDs only. Mark retired entries
 * deprecated:true — do not delete.
 *
 * MODEL HISTORY
 *   v1 — 40 yes/no questions across SB 553 / ASIS / Site Hazard.
 *   v2 — 10 SB 553 statutory categories with a 5-level compliance
 *        selector (effective/implemented/partial/not_compliant/na).
 *        Retained for old assessments; UI no longer creates v2 rows.
 *   v3 — Four thematic sections (Plan / People / Process / Proof) of
 *        granular yes/no (and a few yes/no/partial) questions, with
 *        section-level evidence notes. The active model.
 *
 * Statute reference: California SB 553 / Labor Code § 6401.9
 */

// ════════════════════════════════════════════════════════════════════════════
//  v3 — ACTIVE MODEL: Sections + Questions
// ════════════════════════════════════════════════════════════════════════════

export type ResponseValue = "yes" | "no" | "partial" | "na";

export type ResponseType = "yes_no" | "yes_no_partial";

export const RESPONSE_OPTIONS_V3: Record<
  ResponseValue,
  { label: string; description: string }
> = {
  yes: {
    label: "Yes",
    description: "Requirement is met and demonstrable",
  },
  partial: {
    label: "Partial",
    description: "Some elements in place, known gaps remain",
  },
  no: {
    label: "No",
    description: "Requirement is not met",
  },
  na: {
    label: "N/A",
    description: "Doesn't apply to this workplace",
  },
};

export interface Question {
  /** Stable slug, stored in assessment_responses.question_id */
  id: string;
  /** The actual question text shown to the user */
  prompt: string;
  /** Yes/No or Yes/No/Partial */
  responseType: ResponseType;
  /**
   * 1 = informational / best practice
   * 2 = important — gaps should be remediated
   * 3 = CRITICAL — statutory must-have; non-compliance = citation risk
   */
  weight: 1 | 2 | 3;
  /** Whether N/A is a valid response (defaults to false) */
  allowNa?: boolean;
  /** Optional supporting context shown below the prompt as a hint list */
  guidance?: string[];
  /** Optional Cal/OSHA / SB 553 sub-section reference */
  statuteRef?: string;
  deprecated?: boolean;
}

export interface Section {
  /** Stable slug used as a notes-row key (notes_<id>) */
  id: "plan" | "people" | "process" | "proof";
  title: string;
  /** Eyebrow / subtitle */
  eyebrow: string;
  description: string;
  questions: Question[];
}

// ─── Section bank ─────────────────────────────────────────────────────────────

export const sections: Section[] = [
  // ════════════════════════════════════════════════════════════════════════
  //  THE PLAN
  // ════════════════════════════════════════════════════════════════════════
  {
    id: "plan",
    title: "The Plan",
    eyebrow: "01 · Foundational document",
    description:
      "The written plan itself — its existence, currency, accessibility, and site specificity.",
    questions: [
      {
        id: "q_plan_exists",
        prompt:
          "Does your organization have a written Workplace Violence Prevention Plan (WVPP) that exists as a standalone document or as a clearly identified section of the Injury and Illness Prevention Plan (IIPP)?",
        responseType: "yes_no",
        weight: 3,
        statuteRef: "§ 6401.9 (c)(1)",
      },
      {
        id: "q_plan_anti_retaliation",
        prompt:
          "Does the plan explicitly prohibit retaliation against incident or concern reporting?",
        responseType: "yes_no",
        weight: 3,
        statuteRef: "§ 6401.9 (c)(2)(F)",
      },
      {
        id: "q_plan_reviewed_12mo",
        prompt:
          "Has the plan been reviewed and updated within the past 12 months?",
        responseType: "yes_no",
        weight: 2,
        statuteRef: "§ 6401.9 (c)(2)(L)",
      },
      {
        id: "q_plan_accessible",
        prompt:
          "Is the plan available and easily accessible at all times to employees, authorized employee representatives, and Cal/OSHA?",
        responseType: "yes_no",
        weight: 3,
        statuteRef: "§ 6401.9 (c)(1)(B)",
      },
      {
        id: "q_plan_responsible_named",
        prompt:
          "Does the plan identify by name or job title the person(s) responsible for implementing it?",
        responseType: "yes_no",
        weight: 3,
        statuteRef: "§ 6401.9 (c)(2)(A)",
      },
      {
        id: "q_plan_multi_employer_coord",
        prompt:
          "Are methods described for coordinating implementation with other employers in shared facilities or owner/tenant relationships?",
        responseType: "yes_no",
        weight: 1,
        allowNa: true,
        statuteRef: "§ 6401.9 (c)(2)(B)",
      },
      {
        id: "q_plan_site_specific",
        prompt:
          "Is the plan specific to the hazards and corrective measures for each work area and operation at this site?",
        responseType: "yes_no",
        weight: 3,
        statuteRef: "§ 6401.9 (c)(1)(C)",
        guidance: [
          "Workplace environment — lighting, secured perimeter and facility entrances, physical access controls, dead-ends or trap zones, safe havens / lock-down areas, high-speed avenues of approach, intrusion detection systems",
          "Operational considerations — cash or valuables, isolated or lone work, public-facing or public-access roles, traveling or remote work, weapons access or use, activities affecting situational awareness",
          "Social, cultural and behavioral elements — hostile workplace or toxic culture, domestic & intimate partner violence, termination / discipline actions, availability and use of support resources (EAP, occupational health, etc.)",
        ],
      },
      {
        id: "q_plan_in_effect_all_times",
        prompt:
          "Is the plan considered in effect at all times and in all work areas, including those listed below?",
        responseType: "yes_no",
        weight: 2,
        statuteRef: "§ 6401.9 (c)(1)(A)",
        guidance: [
          "Paid work time, including role-related networking, social, or representation activities",
          "Physical and virtual work sites",
          "Rest or break areas, locker rooms, smoking areas, etc.",
          "Work-related or directed travel",
          "Parking, storage, or off-site / remote locations",
        ],
      },
    ],
  },

  // ════════════════════════════════════════════════════════════════════════
  //  THE PEOPLE
  // ════════════════════════════════════════════════════════════════════════
  {
    id: "people",
    title: "The People",
    eyebrow: "02 · Participation and training",
    description:
      "Who participates in developing, implementing, and reviewing the plan — and how they're trained on it.",
    questions: [
      {
        id: "q_people_dev_participation",
        prompt:
          "Did all levels of employees — not just leaders or function heads — participate in developing and implementing the plan?",
        responseType: "yes_no",
        weight: 3,
        statuteRef: "§ 6401.9 (c)(2)(D)",
      },
      {
        id: "q_people_review_participation",
        prompt:
          "Are all levels of employees involved in reviewing plan effectiveness after incidents or when deficiencies are found?",
        responseType: "yes_no",
        weight: 2,
        statuteRef: "§ 6401.9 (c)(2)(D)",
      },
      {
        id: "q_people_roles_differentiated",
        prompt:
          "If multiple people share responsibilities under the plan, are their roles clearly described and differentiated?",
        responseType: "yes_no",
        weight: 2,
        statuteRef: "§ 6401.9 (c)(2)(A)",
        guidance: [
          "Including all applicable parties in multi-employer worksites and their respective roles",
        ],
      },
      {
        id: "q_people_training_participation",
        prompt:
          "Do all levels of employees — not just leaders or function heads — participate in designing and implementing training?",
        responseType: "yes_no",
        weight: 2,
        statuteRef: "§ 6401.9 (e)",
      },
      {
        id: "q_people_training_appropriate",
        prompt:
          "Is the content and vocabulary appropriate to the education level, literacy, and English proficiency of all employees?",
        responseType: "yes_no",
        weight: 3,
        statuteRef: "§ 6401.9 (e)(1)",
      },
      {
        id: "q_people_training_initial_annual",
        prompt:
          "Are all employees provided initial AND annual refresher training?",
        responseType: "yes_no",
        weight: 3,
        statuteRef: "§ 6401.9 (e)(2)–(3)",
      },
      {
        id: "q_people_training_covers_all",
        prompt:
          "Does your training explicitly cover all of the elements listed below?",
        responseType: "yes_no",
        weight: 3,
        statuteRef: "§ 6401.9 (e)(2)(A)–(F)",
        guidance: [
          "The plan itself — how to get a copy and how to participate in implementation",
          "The definitions and requirements of the plan",
          "How to report incidents or concerns without reprisal",
          "Job-specific hazards, corrective measures already in place, how to seek assistance, and strategies to avoid physical harm",
          "Information about the Violent Incident Log and how to receive a copy",
          "An interactive question-and-answer session with someone knowledgeable about the plan",
        ],
      },
      {
        id: "q_people_reporting_expectations",
        prompt: "Are reporting expectations clearly outlined?",
        responseType: "yes_no",
        weight: 2,
        statuteRef: "§ 6401.9 (e)(2)(C)",
      },
    ],
  },

  // ════════════════════════════════════════════════════════════════════════
  //  THE PROCESS
  // ════════════════════════════════════════════════════════════════════════
  {
    id: "process",
    title: "The Process",
    eyebrow: "03 · Reporting, response, and hazard control",
    description:
      "The procedures that turn the plan into action — how reports are received, hazards are identified, evaluated, and corrected.",
    questions: [
      {
        id: "q_process_reporting_known",
        prompt:
          "Is there a process for receiving reports and concerns about workplace violence, and do employees know how to use it?",
        responseType: "yes_no_partial",
        weight: 3,
        statuteRef: "§ 6401.9 (c)(2)(E)",
        guidance: [
          "Alerting employees of the presence, location, and nature of a WPV emergency",
          "Evacuation or sheltering procedures appropriate and feasible for the site",
          "Engaging with or obtaining help from staff assigned to respond",
          "Coordination with security or law enforcement",
        ],
      },
      {
        id: "q_process_investigation_procedures",
        prompt:
          "Do specific procedures exist for investigating reported concerns?",
        responseType: "yes_no",
        weight: 3,
        statuteRef: "§ 6401.9 (c)(2)(I)",
      },
      {
        id: "q_process_investigation_followup",
        prompt:
          "Are reporting parties notified of investigation results and corrective actions?",
        responseType: "yes_no",
        weight: 2,
        statuteRef: "§ 6401.9 (c)(2)(F)",
      },
      {
        id: "q_process_positive_reinforcement",
        prompt:
          "Is positive reinforcement of desired behavior routinely executed?",
        responseType: "yes_no",
        weight: 1,
      },
      {
        id: "q_process_post_incident",
        prompt:
          "Do procedures exist for post-incident response and investigation?",
        responseType: "yes_no",
        weight: 3,
        statuteRef: "§ 6401.9 (c)(2)(I)",
      },
      {
        id: "q_process_enforcement_consistent",
        prompt:
          "Are reporting requirements and plan details consistently enforced and documented?",
        responseType: "yes_no_partial",
        weight: 2,
      },
      {
        id: "q_process_hazard_id_initial",
        prompt:
          "Do procedures exist for identifying workplace violence hazards initially?",
        responseType: "yes_no",
        weight: 3,
        statuteRef: "§ 6401.9 (c)(2)(G)",
        guidance: [
          "Workplace environment — lighting, access controls, dead-ends, safe havens, IDS",
          "Operational considerations — cash, lone work, public-facing roles, weapons access",
          "Social/cultural elements — hostile workplace, DV, terminations, EAP availability",
        ],
      },
      {
        id: "q_process_hazard_id_annual",
        prompt: "Are workplace violence hazards re-identified annually?",
        responseType: "yes_no",
        weight: 2,
        statuteRef: "§ 6401.9 (c)(2)(G)",
      },
      {
        id: "q_process_hazard_id_post_incident",
        prompt:
          "Are workplace violence hazards re-identified following each incident?",
        responseType: "yes_no",
        weight: 3,
        statuteRef: "§ 6401.9 (c)(2)(G)",
      },
      {
        id: "q_process_hazard_id_inspections",
        prompt:
          "Are inspections conducted to identify unsafe conditions or practices?",
        responseType: "yes_no",
        weight: 2,
        statuteRef: "§ 6401.9 (c)(2)(G)",
      },
      {
        id: "q_process_initial_assessment",
        prompt:
          "Has an initial workplace violence hazard assessment been completed?",
        responseType: "yes_no",
        weight: 3,
        statuteRef: "§ 6401.9 (c)(2)(G)",
      },
      {
        id: "q_process_hazard_evaluation",
        prompt:
          "When hazards are identified, is there a process to evaluate them?",
        responseType: "yes_no",
        weight: 2,
        statuteRef: "§ 6401.9 (c)(2)(H)",
      },
      {
        id: "q_process_hazard_prioritization",
        prompt: "Are identified hazards deliberately prioritized?",
        responseType: "yes_no",
        weight: 2,
        statuteRef: "§ 6401.9 (c)(2)(H)",
      },
      {
        id: "q_process_hazard_correction",
        prompt:
          "Are hazards corrected in a timely manner and documented with tracking?",
        responseType: "yes_no",
        weight: 3,
        statuteRef: "§ 6401.9 (c)(2)(H)",
      },
    ],
  },

  // ════════════════════════════════════════════════════════════════════════
  //  THE PROOF
  // ════════════════════════════════════════════════════════════════════════
  {
    id: "proof",
    title: "The Proof",
    eyebrow: "04 · Logs and records",
    description:
      "The Violent Incident Log and the records that demonstrate the program is actually being run.",
    questions: [
      {
        id: "q_proof_log_recorded",
        prompt:
          "Are all WPV incidents recorded in the Violent Incident Log?",
        responseType: "yes_no",
        weight: 3,
        statuteRef: "§ 6401.9 (d)",
      },
      {
        id: "q_proof_log_multi_employer",
        prompt:
          "If you're a multi-employer worksite, are individual logs submitted to the controlling employer?",
        responseType: "yes_no",
        weight: 2,
        allowNa: true,
        statuteRef: "§ 6401.9 (d)",
      },
      {
        id: "q_proof_log_date_time_location",
        prompt:
          "Does each log entry contain the date, time, and location of the incident?",
        responseType: "yes_no",
        weight: 3,
        statuteRef: "§ 6401.9 (d)(1)(A)",
      },
      {
        id: "q_proof_log_type_categorized",
        prompt:
          "Is each incident categorized appropriately (Type 1–4)?",
        responseType: "yes_no",
        weight: 3,
        statuteRef: "§ 6401.9 (d)(1)(B)",
      },
      {
        id: "q_proof_log_classified",
        prompt:
          "Is each incident classified by type (physical attack with/without weapon, threat, sexual assault, etc.)?",
        responseType: "yes_no",
        weight: 3,
        statuteRef: "§ 6401.9 (d)(1)(C)",
      },
      {
        id: "q_proof_log_summary",
        prompt: "Is a detailed incident summary included?",
        responseType: "yes_no",
        weight: 2,
        statuteRef: "§ 6401.9 (d)(1)(D)",
      },
      {
        id: "q_proof_log_consequence",
        prompt: "Is the consequence or result recorded?",
        responseType: "yes_no",
        weight: 2,
        statuteRef: "§ 6401.9 (d)(1)(F)",
        guidance: [
          "Security response, law enforcement response, proactive protective measures, etc.",
        ],
      },
      {
        id: "q_proof_log_pii_omitted",
        prompt:
          "Is personal identifying information (PII) omitted from the log?",
        responseType: "yes_no",
        weight: 3,
        statuteRef: "§ 6401.9 (d)(2)",
      },
      {
        id: "q_proof_log_recorder_named",
        prompt:
          "Is the individual recording the incident listed by name, job title, and date?",
        responseType: "yes_no",
        weight: 2,
        statuteRef: "§ 6401.9 (d)(1)(G)",
      },
      {
        id: "q_proof_log_recorder_aligns",
        prompt:
          "Does this individual's role align with the responsibilities outlined in the plan?",
        responseType: "yes_no",
        weight: 2,
      },
      {
        id: "q_proof_log_periodic_review",
        prompt:
          "Is the log reviewed during the periodic plan review?",
        responseType: "yes_no",
        weight: 2,
        statuteRef: "§ 6401.9 (c)(2)(L)",
      },
      {
        id: "q_proof_records_hazard_5yr",
        prompt:
          "Are records of hazard identification, evaluation, and correction maintained for at least 5 years?",
        responseType: "yes_no",
        weight: 3,
        statuteRef: "§ 6401.9 (f)(1)",
      },
      {
        id: "q_proof_records_training_1yr",
        prompt:
          "Are training records complete and retained for at least 1 year?",
        responseType: "yes_no",
        weight: 3,
        statuteRef: "§ 6401.9 (f)(2)",
        guidance: [
          "Dates of training, session summary, names and qualifications of trainer, attendee names and job titles",
        ],
      },
      {
        id: "q_proof_records_log_5yr",
        prompt:
          "Are the Violent Incident Logs retained for at least 5 years?",
        responseType: "yes_no",
        weight: 3,
        statuteRef: "§ 6401.9 (f)(3)",
      },
      {
        id: "q_proof_records_investigation_5yr",
        prompt:
          "Are WPV investigation records maintained for at least 5 years, exempt from any medical information?",
        responseType: "yes_no",
        weight: 3,
        statuteRef: "§ 6401.9 (f)(4)",
      },
      {
        id: "q_proof_records_15day_access",
        prompt:
          "Are records available to employees and their representatives within 15 calendar days of the request, without cost?",
        responseType: "yes_no",
        weight: 3,
        statuteRef: "§ 6401.9 (f)(5)",
      },
    ],
  },
];

// ─── v3 helpers ───────────────────────────────────────────────────────────────

export function getActiveSections(): Section[] {
  return sections;
}

export function getAllQuestions(): Question[] {
  return sections.flatMap((s) => s.questions.filter((q) => !q.deprecated));
}

export function getCriticalQuestions(): Question[] {
  return getAllQuestions().filter((q) => q.weight === 3);
}

export function getQuestionById(id: string): Question | undefined {
  for (const s of sections) {
    const q = s.questions.find((q) => q.id === id && !q.deprecated);
    if (q) return q;
  }
  return undefined;
}

export function getSectionForQuestion(id: string): Section | undefined {
  return sections.find((s) =>
    s.questions.some((q) => q.id === id && !q.deprecated),
  );
}

/** Compose the assessment_responses.question_id used to store section notes. */
export function sectionNotesId(sectionId: Section["id"]): string {
  return `notes_${sectionId}`;
}

/** Detect whether a row's question_id is a section-notes pseudo-row. */
export function isSectionNotesId(questionId: string): boolean {
  return questionId.startsWith("notes_");
}

// ════════════════════════════════════════════════════════════════════════════
//  v2 — DEPRECATED MODEL: kept only so that completed v2 assessments can
//  still render their results page. New assessments do NOT write these IDs.
// ════════════════════════════════════════════════════════════════════════════

export type LegacyResponseValue =
  | "effective"
  | "implemented"
  | "partial"
  | "not_compliant"
  | "na";

export interface LegacyCategory {
  id: string;
  title: string;
  statuteRef: string;
  description: string;
  subRequirements: string[];
  weight: 1 | 2 | 3;
  deprecated?: boolean;
}

export const legacyCategories: LegacyCategory[] = [
  {
    id: "sb553_plan",
    title: "Written Plan & Accessibility",
    statuteRef: "SB 553 §3 (a)(1)–(3)",
    description:
      "The foundational requirement: a written workplace violence prevention plan that is site-specific, accessible, and current.",
    subRequirements: [],
    weight: 3,
  },
  {
    id: "sb553_admin",
    title: "Responsible Persons & Administration",
    statuteRef: "SB 553 §3 (a)(4)–(5)",
    description:
      "Named individuals with clearly defined roles who are accountable for implementing and maintaining the plan.",
    subRequirements: [],
    weight: 3,
  },
  {
    id: "sb553_involvement",
    title: "Employee Involvement",
    statuteRef: "SB 553 §3 (a)(6)",
    description:
      "Procedures for the active involvement of employees and representatives in developing and implementing the plan.",
    subRequirements: [],
    weight: 3,
  },
  {
    id: "sb553_hazard",
    title: "Hazard Identification, Evaluation & Correction",
    statuteRef: "SB 553 §3 (a)(7)–(8)",
    description:
      "Proactive identification, evaluation, and timely correction of workplace violence hazards.",
    subRequirements: [],
    weight: 3,
  },
  {
    id: "sb553_training",
    title: "Training Program",
    statuteRef: "SB 553 §3 (e)",
    description:
      "Initial and annual training covering the plan, reporting procedures, job-specific hazards, and the incident log.",
    subRequirements: [],
    weight: 3,
  },
  {
    id: "sb553_reporting",
    title: "Reporting, Response & Anti-Retaliation",
    statuteRef: "SB 553 §3 (a)(9)–(10)",
    description:
      "Effective procedures for receiving and responding to reports, with explicit anti-retaliation protections.",
    subRequirements: [],
    weight: 3,
  },
  {
    id: "sb553_emergency",
    title: "Emergency Response Procedures",
    statuteRef: "SB 553 §3 (a)(11)",
    description:
      "Procedures for responding to actual or potential workplace violence emergencies.",
    subRequirements: [],
    weight: 2,
  },
  {
    id: "sb553_log",
    title: "Violent Incident Log",
    statuteRef: "SB 553 §3 (d)",
    description:
      "A complete, PII-redacted log of every workplace violence incident with all statutorily required fields.",
    subRequirements: [],
    weight: 3,
  },
  {
    id: "sb553_records",
    title: "Recordkeeping",
    statuteRef: "SB 553 §3 (f)",
    description:
      "Retention and availability of all required records — with specific minimums for each record type.",
    subRequirements: [],
    weight: 2,
  },
  {
    id: "sb553_review",
    title: "Plan Review & Continuous Improvement",
    statuteRef: "SB 553 §3 (a)(12)",
    description:
      "Regular review and revision of the plan to ensure ongoing effectiveness.",
    subRequirements: [],
    weight: 2,
  },
];

export function getLegacyCategoryById(
  id: string,
): LegacyCategory | undefined {
  return legacyCategories.find((c) => c.id === id);
}

/** Heuristic — old assessments wrote sb553_* IDs; new assessments write q_* IDs. */
export function detectModel(questionIds: string[]): "v2" | "v3" {
  for (const id of questionIds) {
    if (id.startsWith("sb553_")) return "v2";
  }
  return "v3";
}
