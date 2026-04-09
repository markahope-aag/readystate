/**
 * ReadyState — Remediation guidance for critical findings
 *
 * Keyed by question ID. Every weight-3 (critical) question in the bank
 * has a corresponding remediation blurb here. Non-critical questions
 * may be added later.
 *
 * These are concrete next steps — not restatements of the problem.
 * Tone: direct, actionable, specific. Reference statutes and standards
 * where doing so clarifies intent.
 *
 * When adding new critical questions to the question bank, add the
 * matching recommendation here in the same commit.
 */

export const recommendations: Record<string, string> = {
  // ─── SB 553 Statutory ────────────────────────────────────────────────────

  sb553_001:
    "Draft or adopt a written Workplace Violence Prevention Plan. Start from Cal/OSHA's model WVPP at dir.ca.gov/dosh/workplace-violence-prevention.html, then customize every section to your site — do not ship the template unchanged. Expect 4–8 hours of internal work or engage a qualified safety consultant.",

  sb553_002:
    "Schedule a walk-through of the site with the assigned responsible person and at least one non-supervisory employee. Document hazards by work area, staffing pattern, access control, and public exposure. Rewrite the relevant plan sections to reference specific locations, roles, and conditions — a generic template will not satisfy an inspector.",

  sb553_003:
    "Make the WVPP accessible in every work area. Options: post a copy in the break room, include a link on the employee intranet, or keep a binder at reception. Confirm during your next team meeting that every employee knows where to find it and whom to ask if they cannot.",

  sb553_005:
    "Assign a specific individual or titled role (e.g., 'Facilities Manager', 'Director of People Operations') to own plan implementation. Update the plan to name them. If they leave the organization, designate a replacement within 14 days and update the plan the same day.",

  sb553_012:
    "Document a step-by-step incident reporting procedure. At minimum specify: (1) who employees report to — a primary and a backup — (2) how reports are submitted (in person, phone, form, anonymous hotline), (3) what the organization will do in response, and (4) expected timeline. Communicate the procedure during next team meeting.",

  sb553_013:
    "Draft a written non-retaliation policy specific to workplace violence reports. Include it in the WVPP and your employee handbook. Call it out explicitly during annual WVPP training — a retaliation clause buried in the handbook that is never highlighted will not protect the organization if a reporting employee is later disciplined.",

  sb553_014:
    "Create a Violent Incident Log template that captures every field required by Labor Code §6401.9(e): date/time, location, detailed description, incident type classification (Type 1–4), circumstances, consequences, and who recorded the entry. Have the template ready even if you have no incidents to log — Cal/OSHA can ask to see the log format during an inspection.",

  sb553_017:
    "Schedule initial WVPP training for all current employees within 30 days. Put annual refreshers on the calendar now. Training must cover the plan contents, how to report, the incident log, and must include a live Q&A component — pre-recorded video alone does not satisfy the interactive requirement. Ensure training is delivered in a language and educational level appropriate to your workforce.",

  sb553_018:
    "Establish a records retention system that preserves WVPP-related records for at least five years. Records must include training attendance, content summaries, trainer qualifications, hazard identification/correction logs, and violent incident logs. Name a custodian and ensure records survive employee departures — records stored only on a departed employee's laptop do not count as retained.",

  // ─── ASIS WVPI AA-2020 ───────────────────────────────────────────────────

  asis_001:
    "Form a standing Threat Management Team with at least four functional roles represented: HR, security (or facilities), legal or EAP, and senior management. Draft a written charter covering membership, meeting cadence, activation triggers, decision authority, and confidentiality protocols. An ad-hoc 'we'd get the right people together' approach is not enough.",

  asis_004:
    "Adopt a documented Behavioral Threat Assessment protocol. Reference ASIS WVPI AA-2020 or engage a qualified consultant — do not invent your own from scratch. The protocol must describe intake, initial assessment, escalation criteria, response actions, and ongoing case monitoring. Train the TMT on the protocol before activating it.",

  asis_010:
    "Develop a site-specific active assailant response procedure referencing your actual floor plan, exit routes, and shelter-in-place locations. Coordinate with local law enforcement — invite them for a site walk-through. Conduct at least one tabletop exercise or drill within the next 90 days, then annually thereafter. Generic Run-Hide-Fight flyers without site-specific orientation do not prepare your staff.",

  // ─── Site Hazard Profile ─────────────────────────────────────────────────

  hazard_005:
    "Document an offboarding checklist that deactivates all physical and digital access on or before the last day of employment: key cards, door codes, alarm codes, parking access, and any shared credentials. Audit your current access list this week — revoke any access still held by departed employees. Contentious departures should trigger same-day revocation.",

  hazard_006:
    "Establish a written lone-worker check-in protocol for employees who work alone, after hours, or in isolated areas. Options: scheduled phone check-ins, a buddy system, or a monitoring app with GPS and duress signaling. Name the person responsible for monitoring and define what happens if a check-in is missed — a protocol without a defined escalation gives false assurance.",

  hazard_008:
    "Conduct a documented Type 2 violence risk assessment. Identify which roles, locations, and time windows carry the highest exposure to violence from customers, clients, patients, or the public. Map current controls to each risk and identify where controls are missing. Healthcare, retail, social services, and education typically carry elevated Type 2 risk and warrant specific protocols.",
};
