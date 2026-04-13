/**
 * ReadyState — Remediation guidance for SB 553 categories (v2)
 *
 * Keyed by category ID. Every category has a recommendation. Weight-3
 * (critical) categories get more detailed guidance since non-compliance
 * represents direct citation risk.
 *
 * These are concrete next steps — not restatements of the problem.
 */

export const recommendations: Record<string, string> = {
  sb553_plan:
    "Draft or adopt a written Workplace Violence Prevention Plan. Start from Cal/OSHA's model WVPP at dir.ca.gov/dosh/workplace-violence-prevention.html, then customize every section to this site — its physical layout, operations, staffing patterns, and known hazards. A generic template will not satisfy an inspector. Ensure the plan is posted in a location accessible to all employees, their representatives, and Cal/OSHA at all times. Set a calendar reminder for annual review.",

  sb553_admin:
    "Assign a specific individual by name or titled role to own plan implementation. If multiple persons share responsibility, clearly document who does what. The assignment must be in the plan itself, not just in a separate org chart. If the named person leaves, designate a replacement within 14 days and update the plan the same day. For shared facilities, establish a written coordination agreement with other employers describing respective roles.",

  sb553_involvement:
    "Establish a formal mechanism for employee participation — a safety committee with non-supervisory members, scheduled feedback sessions, or an anonymous concern reporting channel. Employees must participate in both developing AND implementing the plan, not just receive a finished document. Document every instance of employee input: meeting minutes, survey results, email threads. Ensure procedures exist for employees to identify hazards, participate in inspections, contribute to training design, and join post-incident reviews.",

  sb553_hazard:
    "Conduct an initial workplace violence hazard assessment covering every work area and operation. Document each identified hazard with location, description, and assigned owner. Establish a corrective action log tracking each hazard from identification through resolution with target dates and status updates. Reassess after every WPV incident and whenever conditions change. Items open longer than 90 days without documented justification should trigger escalation.",

  sb553_training:
    "Schedule initial WVPP training for all current employees within 30 days. Put annual refreshers on the calendar now. Training must be in a language and at an educational level appropriate to your workforce — pre-recorded English-only video will not satisfy this requirement if you have multilingual or low-literacy employees. Every session must include an interactive Q&A component with someone knowledgeable about the plan. Maintain records with dates, content summary, trainer qualifications, and attendee names and titles.",

  sb553_reporting:
    "Document a step-by-step incident reporting procedure specifying: (1) who employees report to (primary + backup), (2) how reports are submitted (in person, phone, form, anonymous hotline), (3) what happens after a report is received, (4) how the reporting party will be informed of results. Draft a written anti-retaliation policy specific to WPV reports and communicate it during training. Enforcement must be consistent — an anti-retaliation policy that exists on paper but isn't followed is worse than no policy at all.",

  sb553_emergency:
    "Develop site-specific emergency response procedures referencing your actual floor plan, exit routes, and shelter-in-place locations. Establish how employees will be alerted to the presence, location, and nature of a WPV emergency. If you have security personnel, document how employees reach them during an incident. Coordinate with local law enforcement — invite them for a site walk-through and ensure they have access credentials, contact information, and floor plans on file.",

  sb553_log:
    "Create a Violent Incident Log template that captures every field required by SB 553: date/time, location (with detail — workplace, parking lot, public setting), WPV type classification (Type 1–4 based on who committed the violence), incident type (physical attack, threat, sexual assault), detailed description (omitting PII), circumstances at the time (lone work, low staffing, unfamiliar environment, etc.), consequences (security/LE response, protective actions taken), and the name/title/date of the person completing the entry. Have the template ready even if there are no current incidents to log. Multi-employer sites must maintain individual logs and submit copies to the controlling employer.",

  sb553_records:
    "Establish a records retention system (physical or digital) with clear custodianship. Set retention minimums: 5 years for hazard identification/correction records, violent incident logs, and investigation records; 1 year for training records (which must include dates, content summary, trainer qualifications, and attendee names/titles). Ensure records survive employee departures — records on a departed employee's laptop don't count as retained. All records must be available to Cal/OSHA on request and to employees and their representatives within 15 calendar days at no cost.",

  sb553_review:
    "Schedule an annual plan review date and put it on the calendar now. Establish triggers for ad-hoc reviews: any observed deficiency, any WPV incident, any change in operations or staffing that could affect risk. Each review must evaluate whether the plan is actually effective — not just check a compliance box. Document every review with findings, decisions made, and revisions implemented. If no changes are needed, document why.",
};
