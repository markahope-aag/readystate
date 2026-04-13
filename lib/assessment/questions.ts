/**
 * Kestralis — SB 553 Assessment Category Bank
 * /lib/assessment/questions.ts
 *
 * ⚠️  ID STABILITY CONTRACT — READ BEFORE EDITING ⚠️
 * Category IDs (sb553_plan, sb553_admin, etc.) are stored verbatim in
 * assessment_responses.question_id. Renaming or reusing an ID orphans
 * existing response rows. Append new IDs only. Mark retired categories
 * deprecated:true — do not delete.
 *
 * MODEL CHANGE (v2): The original v1 bank had 40 individual yes/no
 * questions across three standards (SB 553, ASIS, Site Hazard). This v2
 * replaces that with 10 SB 553 statutory categories, each evaluated via
 * a single compliance-level selector (Effective / Implemented / Partial /
 * Not Compliant / N/A). Sub-requirements are listed as guidance within
 * each category. ASIS and Site Hazard sections are removed.
 *
 * Statute reference: California SB 553 / Labor Code § 6401.9
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export type ResponseValue =
  | "effective"
  | "implemented"
  | "partial"
  | "not_compliant"
  | "na";

export const RESPONSE_OPTIONS: {
  value: ResponseValue;
  label: string;
  shortLabel: string;
  description: string;
}[] = [
  {
    value: "effective",
    label: "Effective",
    shortLabel: "Effective",
    description:
      "All sub-requirements implemented, maintained, and demonstrably working",
  },
  {
    value: "implemented",
    label: "Implemented",
    shortLabel: "Implemented",
    description:
      "Requirements are in place but effectiveness hasn't been verified",
  },
  {
    value: "partial",
    label: "Partial",
    shortLabel: "Partial",
    description: "Some sub-requirements met, known gaps exist",
  },
  {
    value: "not_compliant",
    label: "Not Compliant",
    shortLabel: "Non-Compliant",
    description: "Not implemented or seriously deficient",
  },
  {
    value: "na",
    label: "Not Applicable",
    shortLabel: "N/A",
    description: "Doesn't apply to this workplace",
  },
];

export interface Category {
  /** Stable slug ID stored in assessment_responses.question_id */
  id: string;
  /** Display title */
  title: string;
  /** One-line statute reference or context */
  statuteRef: string;
  /** What this category evaluates — shown below the title */
  description: string;
  /** Specific statutory sub-requirements the user should consider */
  subRequirements: string[];
  /**
   * 1 = informational / best practice
   * 2 = important — gaps should be remediated
   * 3 = CRITICAL — statutory must-have; non-compliance = citation risk
   */
  weight: 1 | 2 | 3;
  deprecated?: boolean;
}

// ─── Category Bank ─────────────────────────────────────────────────────────────

export const categories: Category[] = [
  {
    id: "sb553_plan",
    title: "Written Plan & Accessibility",
    statuteRef: "SB 553 §3 (a)(1)–(3)",
    description:
      "The foundational requirement: a written workplace violence prevention plan that is site-specific, accessible, and current.",
    subRequirements: [
      "A written Workplace Violence Prevention Plan (WVPP) exists as a standalone document or clearly identified section of the IIPP",
      "The plan is specific to the hazards and corrective measures for each work area and operation at this site",
      "The plan is available and easily accessible at all times to employees, authorized employee representatives, and Cal/OSHA",
      "The plan is in effect at all times and in all work areas",
      "The plan has been reviewed and updated within the past 12 months",
    ],
    weight: 3,
  },
  {
    id: "sb553_admin",
    title: "Responsible Persons & Administration",
    statuteRef: "SB 553 §3 (a)(4)–(5)",
    description:
      "Named individuals with clearly defined roles who are accountable for implementing and maintaining the plan.",
    subRequirements: [
      "The plan identifies by name or job title the person(s) responsible for implementing it",
      "If multiple persons are responsible, their roles are clearly described and differentiated",
      "Methods are described for coordinating implementation with other employers in shared facilities or owner/tenant relationships",
      "All parties in multi-employer worksites understand their respective roles",
    ],
    weight: 3,
  },
  {
    id: "sb553_involvement",
    title: "Employee Involvement",
    statuteRef: "SB 553 §3 (a)(6)",
    description:
      "Effective procedures for the active involvement of employees and their representatives in both developing and implementing the plan.",
    subRequirements: [
      "Employees participate in developing the plan — not just receiving it",
      "Employees participate in implementing the plan on an ongoing basis",
      "Procedures exist for identifying workplace violence hazards periodically, initially, after each incident, and when new hazards are identified",
      "Inspections are conducted to identify unsafe conditions and work practices",
      "Employee reports and concerns about workplace violence are received and acted on",
      "Hazards are evaluated once identified",
      "Employees are involved in designing and implementing training",
      "Employees participate in reporting and investigating WPV incidents",
      "Procedures exist for post-incident response and investigation",
      "Employees participate in reviewing plan effectiveness and revising the plan at least annually, after deficiencies, and after incidents",
    ],
    weight: 3,
  },
  {
    id: "sb553_hazard",
    title: "Hazard Identification, Evaluation & Correction",
    statuteRef: "SB 553 §3 (a)(7)–(8)",
    description:
      "Proactive identification, evaluation, and timely correction of workplace violence hazards — the core prevention activity.",
    subRequirements: [
      "An initial workplace violence hazard assessment has been completed",
      "Hazards are reassessed following each WPV incident",
      "New hazards are identified when reported or when conditions change",
      "Inspections are conducted to identify unsafe conditions and work practices",
      "Identified hazards are evaluated and prioritized",
      "Procedures exist to correct WPV hazards in a timely manner with documented tracking",
    ],
    weight: 3,
  },
  {
    id: "sb553_training",
    title: "Training Program",
    statuteRef: "SB 553 §3 (e)",
    description:
      "Initial and annual training covering the plan, reporting procedures, job-specific hazards, and the incident log — with interactive Q&A and language-appropriate materials.",
    subRequirements: [
      "Training content and vocabulary are appropriate to the education level, literacy, and language of employees",
      "Initial training is provided to all employees",
      "Annual refresher training is provided thereafter",
      "Training covers what the plan is, how to obtain a copy at no cost, and how to participate in developing and implementing it",
      "Training covers the definitions and requirements of the plan",
      "Training covers how to report incidents or concerns to the employer or law enforcement without fear of reprisal",
      "Training covers job-specific hazards, corrective measures already implemented, how to seek assistance, and strategies to avoid physical harm",
      "Training covers information about the Violent Incident Log and how to obtain copies",
      "Training includes an opportunity for interactive questions and answers with an individual knowledgeable about the plan",
      "New training is provided when new or previously unrecognized hazards are identified or when changes are made to the plan",
    ],
    weight: 3,
  },
  {
    id: "sb553_reporting",
    title: "Reporting, Response & Anti-Retaliation",
    statuteRef: "SB 553 §3 (a)(9)–(10)",
    description:
      "Effective procedures for receiving and responding to reports of workplace violence — with explicit anti-retaliation protections that are actually enforced.",
    subRequirements: [
      "Employees know how to report a WPV incident, threat, or concern to the employer or law enforcement",
      "The employer has procedures for investigating reported concerns",
      "Reporting parties are informed of investigation results and corrective actions taken",
      "A written prohibition against retaliation for reporting is in place and communicated",
      "Procedures include positive reinforcement of desired behavior — not just punishment",
      "Education, training, and awareness reinforce reporting expectations",
      "Enforcement of reporting requirements and plan details is consistent and documented",
    ],
    weight: 3,
  },
  {
    id: "sb553_emergency",
    title: "Emergency Response Procedures",
    statuteRef: "SB 553 §3 (a)(11)",
    description:
      "Procedures for responding to actual or potential workplace violence emergencies — alerting, evacuation, sheltering, and coordination with security and law enforcement.",
    subRequirements: [
      "Procedures exist for alerting employees of the presence, location, and nature of a WPV emergency",
      "Evacuation or sheltering plans are appropriate and feasible for the site",
      "Employees know how to obtain help from staff assigned to respond to WPV emergencies (if any)",
      "Coordination with security personnel and law enforcement agencies is established and documented",
    ],
    weight: 2,
  },
  {
    id: "sb553_log",
    title: "Violent Incident Log",
    statuteRef: "SB 553 §3 (d)",
    description:
      "A complete, PII-redacted log of every workplace violence incident with all statutorily required fields — maintained and reviewed during periodic plan reviews.",
    subRequirements: [
      "All WPV incidents are recorded in a violent incident log",
      "The log is reviewed during periodic plan reviews",
      "Personal identifying information is omitted from the log",
      "Multi-employer worksites maintain individual logs and submit copies to the controlling employer",
      "Each entry records the date, time, and location of the incident (including location details: workplace, parking lot, public setting, etc.)",
      "Each entry classifies the WPV type (Type 1–4) based on who committed the violence (client, customer, coworker, domestic/spillover, criminal intent, etc.)",
      "Each entry classifies the type of incident (physical attack with/without weapon, threat, sexual assault, etc.)",
      "Each entry includes a detailed description of the incident (omitting PII)",
      "Circumstances at the time are recorded (usual duties, poorly lit areas, lone work, low staffing, unfamiliar location, etc.)",
      "Consequences are recorded (security response, law enforcement involvement, protective actions taken)",
      "The entry records the name, job title, and date completed by the individual logging the incident",
      "The logger's role aligns with the responsibilities outlined in the plan",
    ],
    weight: 3,
  },
  {
    id: "sb553_records",
    title: "Recordkeeping",
    statuteRef: "SB 553 §3 (f)",
    description:
      "Retention and availability of all required records — with specific minimums for each record type and clear obligations for access.",
    subRequirements: [
      "Records of hazard identification, evaluation, and correction are maintained for at least 5 years",
      "Training records are maintained for at least 1 year, including: dates, session summary, trainer names and qualifications, and attendee names and job titles",
      "Violent incident logs are maintained for at least 5 years",
      "WPV incident investigation records are maintained for at least 5 years and do not contain medical information",
      "All records are available to Cal/OSHA upon request for examination and copying",
      "All records are available to employees and their representatives upon request, without cost, within 15 calendar days",
    ],
    weight: 2,
  },
  {
    id: "sb553_review",
    title: "Plan Review & Continuous Improvement",
    statuteRef: "SB 553 §3 (a)(12)",
    description:
      "Regular review and revision of the plan to ensure it remains effective — not a one-time compliance exercise but an ongoing program.",
    subRequirements: [
      "The plan is reviewed at least annually",
      "The plan is reviewed when a deficiency is observed or becomes known",
      "The plan is reviewed following each WPV incident",
      "Effectiveness is evaluated and the plan is revised as needed after each review",
    ],
    weight: 2,
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Return all active (non-deprecated) categories. */
export function getActiveCategories(): Category[] {
  return categories.filter((c) => !c.deprecated);
}

/** Return a single category by its stable ID. */
export function getCategoryById(id: string): Category | undefined {
  return categories.find((c) => c.id === id && !c.deprecated);
}

/** Return all weight-3 (critical) categories. */
export function getCriticalCategories(): Category[] {
  return categories.filter((c) => c.weight === 3 && !c.deprecated);
}

/** Total number of active categories. */
export function getCategoryCount(): number {
  return getActiveCategories().length;
}
