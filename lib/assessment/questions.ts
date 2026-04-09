/**
 * Kestralis — SB 553 Assessment Question Bank
 * /lib/assessment/questions.ts
 *
 * ⚠️  ID STABILITY CONTRACT — READ BEFORE EDITING ⚠️
 * Question IDs (sb553_001…sb553_018, asis_001…asis_012, hazard_001…hazard_010) are
 * stored verbatim in assessment_responses.question_id. Renumbering or reusing any ID
 * will silently orphan or misattribute existing response rows. If you need to add
 * questions, append new IDs only (sb553_019, asis_013, etc.). If you need to retire
 * a question, mark it deprecated:true and exclude it from the wizard UI — do not
 * delete or reassign the ID.
 *
 * ⚠️  LEGAL/COMPLIANCE CAVEAT ⚠️
 * Guidance strings describe what a well-run program looks like in practice. They are
 * intentionally conservative (erring toward "partial" over "yes" protects clients) but
 * are NOT verbatim statute quotes. Before client-facing deployment, have a Cal/OSHA-
 * familiar safety consultant or California employment attorney review at minimum:
 *   - sb553_014 (violent incident log required fields)
 *   - sb553_018 (5-year record retention scope)
 * Those two questions are where a subtly wrong guidance line could mislead a client
 * into believing they are compliant when they are not. All other questions are
 * conservative enough that over-caution poses no compliance risk.
 *
 * Statute reference: California Labor Code § 6401.9 (effective July 1, 2024)
 * Professional standard reference: ASIS WVPI AA-2020
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export type QuestionSection = "sb553" | "asis" | "hazard";

export type ResponseType = "yes_no_partial" | "yes_no" | "text";

export interface Question {
  id: string;
  section: QuestionSection;
  category: string;
  question: string;
  guidance: string;
  /**
   * 1 = informational / best practice
   * 2 = important — gaps should be remediated
   * 3 = CRITICAL — statutory must-have or high-consequence risk item;
   *     a "no" here is a compliance failure or serious liability exposure
   */
  weight: 1 | 2 | 3;
  responseType: ResponseType;
  deprecated?: boolean;
}

// ─── Question Bank ─────────────────────────────────────────────────────────────

export const questions: Question[] = [

  // ═══════════════════════════════════════════════════════════════════════════
  // SECTION 1 — SB 553 STATUTORY COMPLIANCE (sb553_001–sb553_018)
  // Covers the minimum requirements of California Labor Code § 6401.9.
  // ═══════════════════════════════════════════════════════════════════════════

  // — Written WVPP ————————————————————————————————————————————————————

  {
    id: "sb553_001",
    section: "sb553",
    category: "Written WVPP",
    question:
      "Does the organization have a written Workplace Violence Prevention Plan (WVPP) that is a standalone or clearly identified section of the IIPP?",
    guidance:
      "A qualifying WVPP must exist as a written document. A verbal policy or a generic safety handbook section is not sufficient. If the plan is embedded in the IIPP, it must be clearly labeled and independently navigable.",
    weight: 3,
    responseType: "yes_no_partial",
  },
  {
    id: "sb553_002",
    section: "sb553",
    category: "Written WVPP",
    question:
      "Is the WVPP specific to the hazards and corrective measures for each work area and operation at this site?",
    guidance:
      "A generic template downloaded from Cal/OSHA that has not been customized to this site's physical layout, industry, staffing, and known risk factors does not satisfy the site-specificity requirement. Look for references to actual locations, roles, and conditions on-site.",
    weight: 3,
    responseType: "yes_no_partial",
  },
  {
    id: "sb553_003",
    section: "sb553",
    category: "Written WVPP",
    question:
      "Is the WVPP readily accessible to all employees, their representatives, and Cal/OSHA at all times and in all work areas?",
    guidance:
      "Accessibility means employees can obtain a copy on request and a copy is available in each work area (posted, in a binder, or via a digital link employees can actually reach from the worksite). Stored only in a manager's office or locked filing cabinet does not qualify.",
    weight: 3,
    responseType: "yes_no_partial",
  },
  {
    id: "sb553_004",
    section: "sb553",
    category: "Written WVPP",
    question:
      "Has the WVPP been reviewed and updated within the past 12 months, after any workplace violence incident, or whenever new hazards were identified?",
    guidance:
      "The plan must be reviewed at least annually. A document with a 'last reviewed' date older than 12 months, or that lacks any revision history, should be answered 'no'. A plan that was reviewed but not updated after a documented incident is 'partial'.",
    weight: 2,
    responseType: "yes_no_partial",
  },

  // — Responsible Persons ———————————————————————————————————————————————

  {
    id: "sb553_005",
    section: "sb553",
    category: "Responsible Persons",
    question:
      "Does the WVPP identify by name or job title the person(s) responsible for implementing and maintaining it?",
    guidance:
      "The plan must name a specific role or individual — not just 'management' or 'HR'. If the named person has left the organization and no replacement is documented, answer 'partial'.",
    weight: 3,
    responseType: "yes_no_partial",
  },
  {
    id: "sb553_006",
    section: "sb553",
    category: "Responsible Persons",
    question:
      "Has the designated responsible person received training or demonstrated knowledge sufficient to implement the WVPP effectively?",
    guidance:
      "The responsible person should be able to explain key plan elements, conduct or coordinate a hazard walk-through, and know how to access the violent incident log and employee reporting process. Self-reported familiarity without documented training is 'partial'.",
    weight: 2,
    responseType: "yes_no_partial",
  },

  // — Employee Involvement ——————————————————————————————————————————————

  {
    id: "sb553_007",
    section: "sb553",
    category: "Employee Involvement",
    question:
      "Does the WVPP describe a process through which employees (including non-supervisory employees) participate in developing, reviewing, and improving the plan?",
    guidance:
      "Employees must have a meaningful mechanism to contribute — a survey, a safety committee with employee members, documented feedback sessions, or similar. A plan written entirely by management with no described employee input process does not satisfy this requirement.",
    weight: 2,
    responseType: "yes_no_partial",
  },
  {
    id: "sb553_008",
    section: "sb553",
    category: "Employee Involvement",
    question:
      "Is there documented evidence that employees have actually been involved in at least one WVPP review or development activity?",
    guidance:
      "Look for meeting minutes, sign-in sheets, survey results, or email threads showing employee participation. A process that exists on paper but has never been executed should be answered 'partial' or 'no' depending on recency.",
    weight: 1,
    responseType: "yes_no_partial",
  },

  // — Hazard Identification & Correction ————————————————————————————————

  {
    id: "sb553_009",
    section: "sb553",
    category: "Hazard Identification & Correction",
    question:
      "Has the organization conducted a workplace violence hazard assessment (walk-through or equivalent) covering all work areas and operations at this site?",
    guidance:
      "The assessment must be documented and cover physical environment, staffing patterns, access controls, and interactions with the public or clients. A general IIPP walk-through that does not specifically address violence risk factors does not qualify.",
    weight: 2,
    responseType: "yes_no_partial",
  },
  {
    id: "sb553_010",
    section: "sb553",
    category: "Hazard Identification & Correction",
    question:
      "Are identified workplace violence hazards logged in writing with a description of the hazard and the work area affected?",
    guidance:
      "The log or equivalent document should identify specific hazards (e.g., 'reception area has no barrier between staff and public', 'lone workers close the facility after 9pm'). A general statement that 'no hazards were found' is only credible if the site has genuinely low-risk characteristics.",
    weight: 2,
    responseType: "yes_no_partial",
  },
  {
    id: "sb553_011",
    section: "sb553",
    category: "Hazard Identification & Correction",
    question:
      "Is there a documented process for correcting identified hazards, including tracking corrective actions to completion?",
    guidance:
      "Identified hazards must be addressed in a timely manner. Look for a corrective action log, ticket system, or equivalent that shows the hazard, the planned correction, the responsible party, and whether it has been resolved. Open items older than 90 days without documented justification should prompt a 'partial'.",
    weight: 2,
    responseType: "yes_no_partial",
  },

  // — Incident Reporting ————————————————————————————————————————————————

  {
    id: "sb553_012",
    section: "sb553",
    category: "Incident Reporting",
    question:
      "Does the WVPP establish a clear, documented procedure for employees to report workplace violence incidents, threats, and concerns — including to whom, how, and what happens next?",
    guidance:
      "The procedure must specify at least one reporting pathway (e.g., supervisor, HR, anonymous hotline) and describe what the organization will do in response. A general 'tell your manager' policy without documented follow-through procedures is 'partial'.",
    weight: 3,
    responseType: "yes_no_partial",
  },
  {
    id: "sb553_013",
    section: "sb553",
    category: "Incident Reporting",
    question:
      "Does the organization have a documented, communicated non-retaliation policy protecting employees who report workplace violence threats or incidents?",
    guidance:
      "The policy must be written, included in the WVPP or linked policy documents, and employees must have been made aware of it through training or distribution. A non-retaliation statement buried in an employee handbook that was never called out in WVPP training is 'partial'.",
    weight: 3,
    responseType: "yes_no_partial",
  },

  // — Violent Incident Log ——————————————————————————————————————————————

  {
    id: "sb553_014",
    section: "sb553",
    category: "Violent Incident Log",
    question:
      "Does the organization maintain a Violent Incident Log that captures all required fields for each incident: date/time/location, incident description, type classification (Type 1–4), consequences, and corrective measures taken?",
    guidance:
      "⚠️ LEGAL REVIEW FLAG — see file header. The log must capture all statutorily required fields without personally identifiable information. A log that exists but omits required fields (e.g., does not classify by Type 1–4) is 'partial'. The absence of any incidents does not eliminate the requirement to have a log format ready.",
    weight: 3,
    responseType: "yes_no_partial",
  },
  {
    id: "sb553_015",
    section: "sb553",
    category: "Violent Incident Log",
    question:
      "Are Violent Incident Log entries free of personally identifiable information (PII) that would allow an individual to be identified?",
    guidance:
      "Names, job titles, specific identifiers of individuals involved must be omitted or redacted from the log (though they may be retained in separate investigation records). A log that includes employee names or other PII in the main incident entry does not comply.",
    weight: 2,
    responseType: "yes_no_partial",
  },
  {
    id: "sb553_016",
    section: "sb553",
    category: "Violent Incident Log",
    question:
      "Is the Violent Incident Log accessible to employees and their representatives upon request?",
    guidance:
      "Employees have the right to access the log (with PII removed). If the log exists but employees are unaware of their right to access it or there is no documented process for providing it on request, answer 'partial'.",
    weight: 2,
    responseType: "yes_no_partial",
  },

  // — Training & Records ————————————————————————————————————————————————

  {
    id: "sb553_017",
    section: "sb553",
    category: "Training & Records",
    question:
      "Has the organization provided SB 553-required training to all employees — covering the WVPP contents, how to report, the incident log, and an opportunity for interactive Q&A — both at plan establishment and annually thereafter?",
    guidance:
      "Training must cover specific statutory topics and include an opportunity for employees to ask questions of someone knowledgeable about the plan. Pre-recorded video alone without a live Q&A component (or a documented async Q&A mechanism) may not satisfy the interactive requirement. Training must be appropriate to the educational level and language of employees.",
    weight: 3,
    responseType: "yes_no_partial",
  },
  {
    id: "sb553_018",
    section: "sb553",
    category: "Training & Records",
    question:
      "Are all required WVPP records (hazard identification/correction, incident investigations, violent incident logs, training records) retained for a minimum of five years and available to Cal/OSHA on request?",
    guidance:
      "⚠️ LEGAL REVIEW FLAG — see file header. Records must be retained for at least five years. Training records specifically must include dates, content summary, trainer qualifications, and attendee names/titles. Records stored in formats that are not readily retrievable (e.g., on a departed employee's laptop) should be answered 'partial'.",
    weight: 3,
    responseType: "yes_no_partial",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // SECTION 2 — ASIS WVPI AA-2020 PROFESSIONAL STANDARD (asis_001–asis_012)
  // Covers organizational program depth beyond statutory minimums.
  // Reference: ASIS Workplace Violence and Active Assailant —
  //   Prevention, Intervention, and Response Standard (2020)
  // ═══════════════════════════════════════════════════════════════════════════

  // — Threat Management Team ————————————————————————————————————————————

  {
    id: "asis_001",
    section: "asis",
    category: "Threat Management Team",
    question:
      "Has the organization established a multi-disciplinary Threat Management Team (TMT) or equivalent — with documented membership including HR, security, legal/EAP, and management?",
    guidance:
      "The ASIS standard calls for a standing team rather than ad-hoc response. A TMT typically includes HR, a security professional, legal counsel or their designee, and at least one manager. An informal 'we'd get the right people together' approach is 'partial'.",
    weight: 3,
    responseType: "yes_no_partial",
  },
  {
    id: "asis_002",
    section: "asis",
    category: "Threat Management Team",
    question:
      "Does the TMT have documented roles, responsibilities, and meeting/activation protocols?",
    guidance:
      "There should be a written charter or equivalent describing when the TMT convenes, who leads it, how information is shared, and how decisions are made and documented. A named team with no documented operating procedures is 'partial'.",
    weight: 2,
    responseType: "yes_no_partial",
  },
  {
    id: "asis_003",
    section: "asis",
    category: "Threat Management Team",
    question:
      "Have all TMT members received training in workplace violence prevention, threat recognition, and their specific TMT roles within the past 24 months?",
    guidance:
      "General management training is not sufficient. TMT members should receive role-specific training covering threat assessment concepts, legal considerations, information sharing protocols, and documentation practices. Training from a qualified external provider is preferable.",
    weight: 2,
    responseType: "yes_no_partial",
  },

  // — Behavioral Threat Assessment ——————————————————————————————————————

  {
    id: "asis_004",
    section: "asis",
    category: "Behavioral Threat Assessment",
    question:
      "Does the organization have a documented Behavioral Threat Assessment (BTA) protocol describing how concerning behaviors are identified, reported, evaluated, and managed?",
    guidance:
      "A BTA protocol goes beyond incident response — it establishes a process for assessing pre-incident warning signs. Look for a written procedure that describes reporting triggers, initial assessment steps, escalation criteria, and case management. A general 'escalate to HR' process is 'partial'.",
    weight: 3,
    responseType: "yes_no_partial",
  },
  {
    id: "asis_005",
    section: "asis",
    category: "Behavioral Threat Assessment",
    question:
      "Does the BTA protocol include structured risk classification — distinguishing between low, moderate, and high-risk threat levels — with different response actions mapped to each level?",
    guidance:
      "A tiered risk classification system (or equivalent framework such as WAVR-21 or similar) ensures proportionate response. A protocol that treats all concerning behavior the same regardless of severity is 'partial'.",
    weight: 2,
    responseType: "yes_no_partial",
  },
  {
    id: "asis_006",
    section: "asis",
    category: "Behavioral Threat Assessment",
    question:
      "Are BTA case records maintained confidentially with documented actions taken, outcomes, and ongoing monitoring status?",
    guidance:
      "Case documentation should be maintained securely (separate from personnel files and the violent incident log) with records of each assessment step, decisions made, and current case status. Undocumented cases handled informally through verbal discussions only should be answered 'no'.",
    weight: 2,
    responseType: "yes_no_partial",
  },

  // — Post-Incident Response —————————————————————————————————————————————

  {
    id: "asis_007",
    section: "asis",
    category: "Post-Incident Response",
    question:
      "Does the organization have a written post-incident response plan covering immediate medical care, employee notification, scene management, and coordination with law enforcement?",
    guidance:
      "The plan should address the first 0–4 hours after an incident: who calls 911, who provides first aid, who secures the scene, who notifies employees, and who communicates with external stakeholders. A generic emergency response plan that does not address violence-specific scenarios is 'partial'.",
    weight: 2,
    responseType: "yes_no_partial",
  },
  {
    id: "asis_008",
    section: "asis",
    category: "Post-Incident Response",
    question:
      "Does the post-incident plan include mental health and psychological support resources for affected employees (e.g., EAP activation, critical incident stress debriefing)?",
    guidance:
      "The ASIS standard specifically calls out psychological recovery. Look for documented access to an Employee Assistance Program (EAP) with crisis-capable counselors, and a process for notifying employees of those resources after an incident.",
    weight: 2,
    responseType: "yes_no_partial",
  },
  {
    id: "asis_009",
    section: "asis",
    category: "Post-Incident Response",
    question:
      "Is there a documented process for post-incident investigation and plan review — with findings used to update the WVPP or BTA protocol?",
    guidance:
      "After any significant incident, the organization should conduct a root-cause or contributing-factor review and document whether program changes are warranted. An organization that has experienced incidents without any documented post-incident review should answer 'no'.",
    weight: 2,
    responseType: "yes_no_partial",
  },

  // — Active Assailant & Emergency Response ————————————————————————————

  {
    id: "asis_010",
    section: "asis",
    category: "Active Assailant & Emergency Response",
    question:
      "Does the organization have a documented active assailant / active shooter response procedure (e.g., Run-Hide-Fight or equivalent) that is specific to this site's layout?",
    guidance:
      "The procedure must reference this site's actual floor plan and exit routes — not a generic protocol. Employees should know where to evacuate, where to shelter, and how to communicate with law enforcement during an incident. A generic flyer posted in the break room without site-specific details is 'partial'.",
    weight: 3,
    responseType: "yes_no_partial",
  },
  {
    id: "asis_011",
    section: "asis",
    category: "Active Assailant & Emergency Response",
    question:
      "Have employees received active assailant response training (including evacuation routes and shelter-in-place procedures for this site) within the past 24 months?",
    guidance:
      "Training should be site-specific, cover the Run-Hide-Fight or equivalent framework, and include at least a walk-through of evacuation routes. Online-only training without any physical orientation to the site is 'partial'.",
    weight: 2,
    responseType: "yes_no_partial",
  },
  {
    id: "asis_012",
    section: "asis",
    category: "Active Assailant & Emergency Response",
    question:
      "Has the organization conducted at least one active assailant or emergency response tabletop exercise or drill within the past 24 months?",
    guidance:
      "Drills or tabletop exercises test whether plans work in practice and surface gaps before a real incident. Even a brief tabletop with the TMT counts. Organizations that have only completed paperwork training with no practical exercise should answer 'partial'.",
    weight: 1,
    responseType: "yes_no_partial",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // SECTION 3 — SITE HAZARD PROFILE (hazard_001–hazard_010)
  // Site-specific physical and operational risk factors.
  // ═══════════════════════════════════════════════════════════════════════════

  // — Physical Security Controls ————————————————————————————————————————

  {
    id: "hazard_001",
    section: "hazard",
    category: "Physical Security Controls",
    question:
      "Does the facility have adequate physical barriers, sight lines, or other environmental design features that reduce employee exposure to potential violence from members of the public or unauthorized entrants?",
    guidance:
      "Look for CPTED (Crime Prevention Through Environmental Design) principles in practice: reception barriers, waiting area separation from work areas, clear sight lines, adequate lighting, panic buttons, or equivalent controls. A facility with a fully open reception area accessible to the public without any barrier should answer 'no'.",
    weight: 2,
    responseType: "yes_no_partial",
  },
  {
    id: "hazard_002",
    section: "hazard",
    category: "Physical Security Controls",
    question:
      "Are security cameras, alarm systems, or other monitoring technologies operational and maintained — with footage or records retained as specified in the security policy?",
    guidance:
      "Systems that exist but are not functional, not monitored, or whose footage is overwritten before any useful retention window should be answered 'partial'. Confirm that systems have been tested within the past 12 months.",
    weight: 2,
    responseType: "yes_no_partial",
  },
  {
    id: "hazard_003",
    section: "hazard",
    category: "Physical Security Controls",
    question:
      "Are emergency communication devices (phones, intercoms, panic buttons, or equivalent) available and functional in all areas where employees work, including isolated areas?",
    guidance:
      "Every employee working alone or in an isolated area should have a reliable means to summon help. Reliance solely on personal cell phones in areas with poor coverage does not qualify. Confirm devices have been tested within the past 12 months.",
    weight: 2,
    responseType: "yes_no_partial",
  },

  // — Access Control ————————————————————————————————————————————————————

  {
    id: "hazard_004",
    section: "hazard",
    category: "Access Control",
    question:
      "Does the facility have access control measures (keycards, coded entry, visitor sign-in, or equivalent) that restrict unauthorized entry to employee work areas?",
    guidance:
      "Access control should prevent general public or unauthorized individuals from freely entering areas where employees work. A facility where any member of the public can walk into back-of-house or operational areas without challenge should answer 'no' or 'partial'.",
    weight: 2,
    responseType: "yes_no_partial",
  },
  {
    id: "hazard_005",
    section: "hazard",
    category: "Access Control",
    question:
      "Is there a documented process for managing access credentials — including prompt revocation when employees are terminated or resign?",
    guidance:
      "The organization should have a documented offboarding checklist that includes deactivation of all physical and digital access on or before the last day of employment. Failure to revoke access for terminated employees is a significant violence risk factor, particularly in contentious departures.",
    weight: 3,
    responseType: "yes_no_partial",
  },

  // — Lone Worker & After-Hours Risk ————————————————————————————————————

  {
    id: "hazard_006",
    section: "hazard",
    category: "Lone Worker & After-Hours Risk",
    question:
      "Does the organization have documented procedures for employees who regularly work alone, after hours, or in isolated environments — including check-in protocols and emergency response procedures?",
    guidance:
      "Lone workers face disproportionate violence risk. Look for scheduled check-ins, buddy systems, GPS/app-based monitoring, or equivalent procedures. An organization where employees routinely close facilities alone after dark with no documented check-in process should answer 'no'.",
    weight: 3,
    responseType: "yes_no_partial",
  },
  {
    id: "hazard_007",
    section: "hazard",
    category: "Lone Worker & After-Hours Risk",
    question:
      "Are lone worker check-in procedures actively monitored — with a documented escalation process if a check-in is missed?",
    guidance:
      "A check-in procedure without a documented response to a missed check-in provides false assurance. There must be a named person responsible for monitoring, a defined escalation timeline, and documented steps to take if a worker cannot be reached.",
    weight: 2,
    responseType: "yes_no_partial",
  },

  // — Public-Facing & Industry-Specific Risk Factors ————————————————————

  {
    id: "hazard_008",
    section: "hazard",
    category: "Industry & Public-Facing Risk",
    question:
      "Has the organization assessed and documented its exposure to Type 2 violence (violence by customers, clients, patients, or members of the public directed at employees) based on its specific industry and operations?",
    guidance:
      "Industries with elevated Type 2 risk include retail, healthcare, social services, education, financial services, and any public-facing operation. The assessment should identify which roles, locations, and times of day carry the highest Type 2 exposure, and document current controls.",
    weight: 3,
    responseType: "yes_no_partial",
  },
  {
    id: "hazard_009",
    section: "hazard",
    category: "Industry & Public-Facing Risk",
    question:
      "Has the organization assessed Type 3 violence risk (worker-on-worker violence) — including reviewing recent HR incidents, terminations, disciplinary actions, and workplace conflict reports for escalation indicators?",
    guidance:
      "Type 3 violence is often preceded by identifiable warning signs in HR data. Look for a process by which HR and security share relevant information to identify employees who may pose elevated risk. An organization where HR and security operate completely separately with no cross-referencing should answer 'partial'.",
    weight: 2,
    responseType: "yes_no_partial",
  },
  {
    id: "hazard_010",
    section: "hazard",
    category: "Industry & Public-Facing Risk",
    question:
      "Does the organization have policies and manager training addressing domestic violence spillover (Type 4 violence) — including how employees can safely report concerns and what protective steps the organization can take?",
    guidance:
      "Type 4 violence (personal relationship violence that enters the workplace) is underreported and often fatal. Look for a written policy, manager training on how to recognize and respond to disclosures, and documented steps such as temporary access control changes or safety planning for affected employees.",
    weight: 2,
    responseType: "yes_no_partial",
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Returns all active (non-deprecated) questions for a given section.
 */
export function getSectionQuestions(section: QuestionSection): Question[] {
  return questions.filter((q) => q.section === section && !q.deprecated);
}

/**
 * Returns a single question by its stable slug ID.
 * Returns undefined if not found or if the question is deprecated.
 */
export function getQuestionById(id: string): Question | undefined {
  return questions.find((q) => q.id === id && !q.deprecated);
}

/**
 * Returns all weight-3 (critical) questions across all sections.
 * Used by the scoring engine and the gap analysis report to surface must-fix items.
 */
export function getCriticalQuestions(): Question[] {
  return questions.filter((q) => q.weight === 3 && !q.deprecated);
}

// ─── Section Metadata ────────────────────────────────────────────────────────

export const sectionMeta: Record<
  QuestionSection,
  { label: string; description: string; scoringWeight: number }
> = {
  sb553: {
    label: "SB 553 Statutory Compliance",
    description:
      "California Labor Code § 6401.9 minimum requirements — effective July 1, 2024. Failures here represent direct regulatory exposure and Cal/OSHA citation risk.",
    scoringWeight: 0.5,
  },
  asis: {
    label: "ASIS WVPI AA-2020 Program Depth",
    description:
      "Professional standard benchmarks from the ASIS Workplace Violence and Active Assailant Prevention, Intervention, and Response Standard. Gaps here indicate program maturity issues beyond minimum compliance.",
    scoringWeight: 0.3,
  },
  hazard: {
    label: "Site Hazard Profile",
    description:
      "Physical security, access control, and operational risk factors specific to this site and industry. Gaps here represent environment-level vulnerabilities that increase the likelihood or severity of an incident.",
    scoringWeight: 0.2,
  },
};
