/**
 * ReadyState — Remediation guidance for SB 553 questions (v3)
 *
 * Each remediation entry corresponds to one question ID. When a gap
 * appears in the report, we pull the matching string. Where a question
 * doesn't have a tailored entry, the section-level fallback is used.
 */

export const recommendations: Record<string, string> = {
  // ───── The Plan ─────────────────────────────────────────────────────────
  q_plan_exists:
    "Draft or adopt a written Workplace Violence Prevention Plan. Start from Cal/OSHA's model WVPP at dir.ca.gov/dosh/workplace-violence-prevention.html, then customize every section to this site — its physical layout, operations, staffing patterns, and known hazards. A generic template will not satisfy an inspector.",
  q_plan_anti_retaliation:
    "Add an explicit, written prohibition against retaliation for reporting WPV incidents or concerns. Communicate it in onboarding and annual training, and post it where reporting procedures live. An anti-retaliation clause that exists on paper but isn't surfaced to employees is worse than no clause at all.",
  q_plan_reviewed_12mo:
    "Schedule the next plan review on the calendar now and set a recurring annual reminder. Document each review with findings, decisions made, and revisions implemented — even if no changes are needed, document why.",
  q_plan_accessible:
    "Post the plan in a location accessible to all employees, their representatives, and Cal/OSHA at all times. For multilingual workforces, post translated copies. For remote/distributed teams, ensure it's reachable through whatever system employees use day-to-day (intranet, HR portal, shared drive).",
  q_plan_responsible_named:
    "Assign a specific individual by name or titled role to own plan implementation. The assignment must live in the plan itself, not just in a separate org chart. If the named person leaves, designate a replacement within 14 days and update the plan the same day.",
  q_plan_multi_employer_coord:
    "For shared facilities or owner/tenant relationships, establish a written coordination agreement with other employers describing respective WPV responsibilities. Include who responds to incidents in shared spaces, whose log entries cover what, and how information is shared.",
  q_plan_site_specific:
    "Walk through your physical site and operations and document the WPV hazards specific to each work area. A boilerplate plan that doesn't reference your actual lighting, access controls, lone-work patterns, public-facing roles, or cash handling will fail under inspection. The hazards section should read like it was written by someone who has been to the site.",
  q_plan_in_effect_all_times:
    "Make explicit in the plan that it applies during all paid work time, on physical and virtual sites, in break/locker/parking areas, during work-related travel, and at remote/off-site locations. Inspectors look for gaps in coverage — close them in the language itself.",

  // ───── The People ──────────────────────────────────────────────────────
  q_people_dev_participation:
    "Establish a formal mechanism for employee participation — a safety committee with non-supervisory members, scheduled feedback sessions, or an anonymous concern channel. Document every instance of employee input: meeting minutes, survey results, email threads.",
  q_people_review_participation:
    "Build employees into the post-incident and deficiency review process explicitly — invite them to debriefs, share findings, capture their feedback in writing. The statute requires their involvement in evaluating effectiveness, not just in receiving the finished plan.",
  q_people_roles_differentiated:
    "Where multiple people share responsibility, write a one-paragraph role description for each in the plan: who owns hazard assessment, who runs training, who maintains the log, who is the reporting contact. In multi-employer worksites, document each party's role with the same specificity.",
  q_people_training_participation:
    "Include line employees in training design — content review, scenario validation, language/literacy sense-checks. A training program designed only by managers and trainers will miss what employees actually need to know.",
  q_people_training_appropriate:
    "Audit your training materials for the actual education level, literacy, and language needs of your workforce. Pre-recorded English-only video will not satisfy this requirement if you have multilingual or low-literacy employees. Translate, simplify, or supplement as needed.",
  q_people_training_initial_annual:
    "Schedule initial WVPP training for any current employees who haven't received it within 30 days. Put annual refreshers on the calendar now with a recurring date. Include new-hire training in onboarding.",
  q_people_training_covers_all:
    "Audit your training agenda against the six required elements: the plan and how to access it, definitions and requirements, how to report without reprisal, job-specific hazards and corrective measures, the Violent Incident Log, and an interactive Q&A with someone knowledgeable. Add what's missing.",
  q_people_reporting_expectations:
    "In training, state clearly: who employees report to, when they should report (any incident, threat, or concern — not just violence), what happens after a report, and how reporting parties will hear back. Ambiguity here suppresses reports.",

  // ───── The Process ─────────────────────────────────────────────────────
  q_process_reporting_known:
    "Document a step-by-step incident reporting procedure: who employees report to (primary + backup), how (in person, phone, form, anonymous channel), what happens after, how the reporting party learns the outcome. Communicate it in training and post it where employees see it.",
  q_process_investigation_procedures:
    "Write an investigation procedure that names roles, sets timelines, and defines evidence handling. Include how interviews are conducted, what's documented, and how findings are escalated. Without this, investigations vary by who happens to handle them.",
  q_process_investigation_followup:
    "Build a closing-the-loop step into your investigation procedure: every reporting party hears back about findings and corrective actions taken (within the bounds of confidentiality). Silence after a report kills future reporting.",
  q_process_positive_reinforcement:
    "Pair anti-retaliation and discipline with explicit positive reinforcement of desired behavior — recognizing employees who report, who de-escalate, who follow procedure. This reinforces the cultural norm you're trying to build.",
  q_process_post_incident:
    "Write a post-incident response and investigation procedure: immediate actions (medical, security, LE), evidence preservation, witness interviews, root-cause analysis, hazard reassessment, and updates to the plan based on findings.",
  q_process_enforcement_consistent:
    "Audit how reporting requirements and plan procedures are actually enforced — are managers documenting reports consistently, is discipline applied evenly, are records being kept? Inconsistent enforcement is a citation magnet.",
  q_process_hazard_id_initial:
    "Conduct an initial workplace violence hazard assessment covering every work area and operation. Document each identified hazard with location, description, and assigned owner. This is the seed for the corrective action log.",
  q_process_hazard_id_annual:
    "Schedule a recurring annual hazard re-identification. Don't just review prior findings — walk the site again and look for new hazards from operational changes, staffing changes, or external context (new neighbors, new operations).",
  q_process_hazard_id_post_incident:
    "Build hazard re-identification into your post-incident procedure. Every WPV incident is a signal that the prior assessment missed something or that conditions changed. Don't close out an incident without revisiting the hazards.",
  q_process_hazard_id_inspections:
    "Establish a regular inspection cadence (monthly or quarterly) that explicitly looks for unsafe conditions and practices: blocked exits, broken locks, lighting failures, lone-work gaps, unsecured cash, and behavioral red flags.",
  q_process_initial_assessment:
    "Complete an initial WPV hazard assessment now if one hasn't been done. Use a written template that captures location, hazard, severity, and proposed control. The assessment is foundational — every other procedure depends on it.",
  q_process_hazard_evaluation:
    "Establish a written process for evaluating hazards once identified: severity scoring, likelihood, exposure. Without an evaluation step, you can't justify which hazards get corrected first.",
  q_process_hazard_prioritization:
    "Apply a deliberate prioritization — typically severity × likelihood × exposure — and document it. Tracking should show why one item is being addressed first and another later. 'We'll get to it' is not a prioritization scheme.",
  q_process_hazard_correction:
    "Establish a corrective action log tracking each hazard from identification through resolution: assigned owner, target date, status, and final disposition. Items open longer than 90 days without documented justification should trigger escalation.",

  // ───── The Proof ──────────────────────────────────────────────────────
  q_proof_log_recorded:
    "Create the Violent Incident Log template now even if there are no current entries — and use it the moment an incident occurs. Train supervisors on what triggers a log entry: every incident, every threat, every report.",
  q_proof_log_multi_employer:
    "If you operate at a multi-employer worksite, formalize the log-handoff: keep your own log, copy entries to the controlling employer, and document the submission. Capture this in the coordination agreement.",
  q_proof_log_date_time_location:
    "Update the log template to capture the date, time, and specific location of each incident — not just 'workplace' but 'parking lot, north corner', 'lobby reception desk', etc. Specificity supports later hazard re-identification.",
  q_proof_log_type_categorized:
    "Add a Type 1–4 classification field based on the perpetrator: criminal intent (1), customer/client (2), worker-on-worker (3), or domestic/personal-relationship (4). Train whoever maintains the log on the distinctions.",
  q_proof_log_classified:
    "Add an incident-type classification field — physical attack with weapon, physical attack without weapon, threat, sexual assault, etc. Use the categories the statute names so your data lines up with regulatory expectations.",
  q_proof_log_summary:
    "Include a detailed narrative summary in each entry — what happened, in order, with enough detail that a reader can reconstruct the event. Omit PII but don't omit specifics (where, who-was-doing-what, how-it-escalated).",
  q_proof_log_consequence:
    "Capture the consequence of each incident: security response, law enforcement involvement, medical care provided, protective measures taken (changes to staffing, access, procedures). Closing the entry without recording the response leaves the trail incomplete.",
  q_proof_log_pii_omitted:
    "Audit the log for PII — names, employee IDs, specific identifiers. The statute requires PII to be omitted from the log itself; track that information separately if you need it for investigation purposes.",
  q_proof_log_recorder_named:
    "Each log entry must record the name, job title, and date completed by the individual logging the incident. Add these fields to the template if missing, and require them as part of submission.",
  q_proof_log_recorder_aligns:
    "The person logging incidents should be someone whose responsibilities under the plan include log maintenance. If a random supervisor has been logging because no one was assigned, fix the assignment in the plan.",
  q_proof_log_periodic_review:
    "Build log review into the periodic plan review explicitly — pull the log, look for patterns, feed findings into the next hazard re-identification. A log that's never reviewed is just a filing cabinet.",
  q_proof_records_hazard_5yr:
    "Set a 5-year retention policy for hazard identification, evaluation, and correction records. Make sure the records survive employee departures — records on a departed employee's laptop don't count as retained.",
  q_proof_records_training_1yr:
    "Maintain training records for at least 1 year, capturing dates, session content summary, trainer names and qualifications, and attendee names and job titles. A sign-in sheet alone doesn't satisfy this.",
  q_proof_records_log_5yr:
    "Set a 5-year retention policy for the Violent Incident Log. Even if a row is from years ago, it stays. This is a hard statutory minimum.",
  q_proof_records_investigation_5yr:
    "Maintain WPV investigation records for at least 5 years, separated from any medical information. Investigation files commingled with medical records create both compliance and privacy problems — separate them now.",
  q_proof_records_15day_access:
    "Establish a process to fulfill records requests from employees and their representatives within 15 calendar days, at no cost. Designate who receives the request and who fulfills it, and document each fulfillment.",
};

/** Section-level fallback when a question lacks tailored guidance. */
export const sectionRecommendations: Record<string, string> = {
  plan: "Address the gaps in the plan document itself — its existence, currency, accessibility, and site specificity. The plan is the foundation; everything else assumes it exists and is real.",
  people:
    "Address gaps in employee participation and training. SB 553 requires that employees co-design the plan and training, not just receive a finished product, and that training is appropriate to their literacy and language.",
  process:
    "Address gaps in your reporting, investigation, and hazard control procedures. These are the operational mechanisms that turn the plan into action.",
  proof:
    "Address gaps in your Violent Incident Log and records retention. The statute is specific about what must be logged, what must be retained, and for how long.",
};
