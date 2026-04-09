"use server";

import { createServiceRoleClient } from "@/lib/supabase/server";
import { getQuestionById } from "@/lib/assessment/questions";
import type { RiskLevel } from "@/lib/assessment/scoring";
import {
  sendReportEmail,
} from "@/lib/email/send-report";
import type { ReportGap } from "@/lib/pdf/AssessmentReport";

type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

export interface ContactSubmissionInput {
  assessmentId: string;
  name: string;
  email: string;
  role: string;
}

/**
 * Thank-you page submission:
 *   1. Persist contact info on the assessments row
 *   2. Fetch the assessment + scores + gaps needed for the PDF
 *   3. Generate the PDF via the existing react-pdf document
 *   4. Send the PDF as an attachment via Resend
 *   5. Stamp email_sent_at on success
 *
 * Uses the service role client throughout — no user auth.
 */
export async function submitContactAndSendReport(
  input: ContactSubmissionInput,
): Promise<ActionResult<{ messageId: string | null }>> {
  // Basic shape validation
  const name = input.name.trim();
  const email = input.email.trim().toLowerCase();
  const role = input.role.trim();
  if (!name || !email || !role) {
    return { ok: false, error: "Name, email, and role are all required." };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, error: "Please enter a valid email address." };
  }

  const supabase = createServiceRoleClient();

  // 1. Persist contact info
  const { error: updateError } = await supabase
    .from("assessments")
    .update({
      contact_name: name,
      contact_email: email,
      contact_role: role,
      updated_at: new Date().toISOString(),
    })
    .eq("id", input.assessmentId);

  if (updateError) {
    return {
      ok: false,
      error: `Failed to save contact info: ${updateError.message}`,
    };
  }

  // 2. Fetch assessment + org for the PDF
  const { data: assessment, error: assessmentError } = await supabase
    .from("assessments")
    .select(
      "id, site_name, site_address, status, created_at, updated_at, organizations(name, industry, employee_count, california_locations)",
    )
    .eq("id", input.assessmentId)
    .maybeSingle();

  if (assessmentError || !assessment) {
    return { ok: false, error: "Assessment not found" };
  }

  // 3. Fetch scores
  const { data: scoresRow } = await supabase
    .from("assessment_scores")
    .select(
      "sb553_score, asis_score, hazard_score, overall_score, risk_level",
    )
    .eq("assessment_id", input.assessmentId)
    .maybeSingle();

  if (!scoresRow) {
    return {
      ok: false,
      error: "Assessment has not been scored yet. Please finish and submit the wizard first.",
    };
  }

  // 4. Fetch responses and build gap list
  const { data: responses } = await supabase
    .from("assessment_responses")
    .select("question_id, response, notes")
    .eq("assessment_id", input.assessmentId);

  const gaps: ReportGap[] = [];
  for (const r of (responses ?? []) as Array<{
    question_id: string;
    response: string;
    notes: string | null;
  }>) {
    if (r.response !== "no" && r.response !== "partial") continue;
    const question = getQuestionById(r.question_id);
    if (!question) continue;
    gaps.push({
      question,
      response: r.response,
      notes: r.notes,
    });
  }
  gaps.sort((a, b) => {
    if (b.question.weight !== a.question.weight) {
      return b.question.weight - a.question.weight;
    }
    if (a.response !== b.response) return a.response === "no" ? -1 : 1;
    return a.question.id.localeCompare(b.question.id);
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rawOrg = (assessment as any).organizations;
  const organization = Array.isArray(rawOrg)
    ? (rawOrg[0] ?? null)
    : (rawOrg ?? null);

  // 5. Send the email (generates PDF internally)
  const sendResult = await sendReportEmail({
    to: email,
    contactName: name,
    assessment: {
      id: assessment.id,
      site_name: assessment.site_name,
      site_address: assessment.site_address,
      status: assessment.status,
      created_at: assessment.created_at,
      updated_at: assessment.updated_at,
    },
    organization,
    scores: {
      sb553Score: scoresRow.sb553_score ?? 0,
      asisScore: scoresRow.asis_score ?? 0,
      hazardScore: scoresRow.hazard_score ?? 0,
      overallScore: scoresRow.overall_score ?? 0,
      riskLevel: (scoresRow.risk_level ?? "critical") as RiskLevel,
    },
    gaps,
  });

  if (!sendResult.ok) {
    return { ok: false, error: sendResult.error };
  }

  // 6. Mark email_sent_at on success
  await supabase
    .from("assessments")
    .update({ email_sent_at: new Date().toISOString() })
    .eq("id", input.assessmentId);

  return { ok: true, data: { messageId: sendResult.messageId } };
}
