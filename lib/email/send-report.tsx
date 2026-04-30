/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * ReadyState — Email delivery for assessment reports
 *
 * Called from the thank-you page server action after a user enters
 * their contact information. Generates the PDF via the existing
 * @react-pdf/renderer document component, sends it via Resend with
 * the PDF as an attachment, and returns a success/error envelope.
 *
 * Requires RESEND_API_KEY to be set. RESEND_FROM_EMAIL defaults to
 * "ReadyState <reports@readystate.now>"; override via env if the
 * sending domain hasn't been verified yet.
 */

import { Resend } from "resend";
import { renderToBuffer } from "@react-pdf/renderer";
import {
  AssessmentReport,
  type ReportAssessment,
  type ReportOrganization,
  type ReportScores,
  type ReportGap,
} from "@/lib/pdf/AssessmentReport";
import { getRiskLabel, type SectionScore } from "@/lib/assessment/scoring";

export interface SendReportParams {
  to: string;
  contactName: string;
  assessment: ReportAssessment;
  organization: ReportOrganization | null;
  scores: ReportScores;
  sectionScores: SectionScore[];
  sectionNotes: Record<string, string>;
  gaps: ReportGap[];
}

type SendResult =
  | { ok: true; messageId: string | null }
  | { ok: false; error: string };

const DEFAULT_FROM = "ReadyState <reports@readystate.now>";

export async function sendReportEmail(
  params: SendReportParams,
): Promise<SendResult> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("[email] RESEND_API_KEY is not set");
    return { ok: false, error: "Email sending is not configured" };
  }

  const from = process.env.RESEND_FROM_EMAIL ?? DEFAULT_FROM;
  const resend = new Resend(apiKey);

  // Generate PDF
  let pdfBuffer: Buffer;
  try {
    pdfBuffer = await renderToBuffer(
      <AssessmentReport
        assessment={params.assessment}
        organization={params.organization}
        scores={params.scores}
        sectionScores={params.sectionScores}
        sectionNotes={params.sectionNotes}
        gaps={params.gaps}
        generatedAt={new Date()}
      />,
    );
  } catch (e) {
    console.error("[email] PDF render failed", e);
    return {
      ok: false,
      error: "Failed to generate PDF report",
    };
  }

  const orgName = params.organization?.name ?? "your organization";
  const riskMeta = getRiskLabel(params.scores.riskLevel);
  const filename = buildFilename(orgName);

  try {
    const result = await resend.emails.send({
      from,
      to: params.to,
      subject: `Your ReadyState Assessment — ${orgName}`,
      html: buildEmailHtml({
        contactName: params.contactName,
        orgName,
        siteName: params.assessment.site_name,
        overallScore: params.scores.overallScore,
        riskLabel: riskMeta.label,
        riskDescription: riskMeta.description,
        gapCount: params.gaps.length,
      }),
      text: buildEmailText({
        contactName: params.contactName,
        orgName,
        siteName: params.assessment.site_name,
        overallScore: params.scores.overallScore,
        riskLabel: riskMeta.label,
        riskDescription: riskMeta.description,
        gapCount: params.gaps.length,
      }),
      attachments: [
        {
          filename,
          content: pdfBuffer.toString("base64"),
        },
      ],
    });

    if (result.error) {
      console.error("[email] Resend error", result.error);
      return {
        ok: false,
        error: result.error.message ?? "Email delivery failed",
      };
    }

    return { ok: true, messageId: result.data?.id ?? null };
  } catch (e) {
    console.error("[email] unexpected send failure", e);
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Email delivery failed",
    };
  }
}

// ─── HTML email body ────────────────────────────────────────────────────────

interface EmailBodyParams {
  contactName: string;
  orgName: string;
  siteName: string | null;
  overallScore: number;
  riskLabel: string;
  riskDescription: string;
  gapCount: number;
}

function buildEmailHtml(p: EmailBodyParams): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #0f172a; background: #f8fafc; margin: 0; padding: 0; }
    .wrap { max-width: 560px; margin: 0 auto; padding: 32px 24px; }
    .card { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 32px; }
    .brand { font-weight: 700; font-size: 18px; letter-spacing: 2px; color: #0f172a; }
    .brand-tag { font-size: 10px; color: #64748b; text-transform: uppercase; letter-spacing: 1.5px; margin-top: 4px; }
    h1 { font-size: 22px; margin: 24px 0 8px 0; color: #0f172a; }
    p { line-height: 1.6; color: #334155; font-size: 14px; }
    .score-box { background: #f1f5f9; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center; }
    .score { font-size: 48px; font-weight: 700; line-height: 1; color: #0f172a; }
    .score-label { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #64748b; margin-top: 8px; }
    .risk { display: inline-block; padding: 6px 14px; border-radius: 999px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin-top: 12px; background: #fef2f2; color: #7f1d1d; border: 1px solid #fecaca; }
    .footer { text-align: center; font-size: 11px; color: #94a3b8; padding: 24px 0 8px 0; }
    .cta { display: inline-block; background: #0f172a; color: #ffffff !important; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; font-size: 14px; margin-top: 16px; }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="card">
      <div class="brand">KESTRALIS</div>
      <div class="brand-tag">ReadyState · SB 553 Assessment</div>

      <h1>Hi ${escapeHtml(p.contactName)},</h1>
      <p>
        Thank you for completing the ReadyState SB 553 Compliance Assessment for
        <strong>${escapeHtml(p.orgName)}</strong>${p.siteName ? ` — ${escapeHtml(p.siteName)}` : ""}.
      </p>
      <p>
        Your full PDF report is attached to this email. Here's the headline:
      </p>

      <div class="score-box">
        <div class="score">${p.overallScore}</div>
        <div class="score-label">Overall Program Rating</div>
        <div class="risk">${escapeHtml(p.riskLabel)}</div>
      </div>

      <p><strong>${escapeHtml(p.riskLabel)}.</strong> ${escapeHtml(p.riskDescription)}</p>

      <p>
        The attached report breaks down your score across the four sections of the
        assessment — The Plan, The People, The Process, and The Proof — lists every
        gap that needs attention${p.gapCount > 0 ? ` (${p.gapCount} in total)` : ""},
        and provides concrete remediation guidance for each critical finding.
      </p>

      <p>
        If you'd like to discuss the findings or start closing the gaps, we offer a free
        consultation.
      </p>

      <a class="cta" href="https://meetings.hubspot.com/mark-hope2">Schedule a consultation</a>

      <p style="margin-top: 24px;">
        Stay safe,<br>
        <strong>The Kestralis team</strong>
      </p>
    </div>

    <div class="footer">
      ReadyState is a Kestralis product · Powered by Sentinel Ridge Security<br>
      This assessment is self-reported. Not legal advice.
    </div>
  </div>
</body>
</html>`;
}

function buildEmailText(p: EmailBodyParams): string {
  return `KESTRALIS · ReadyState SB 553 Assessment

Hi ${p.contactName},

Thank you for completing the ReadyState SB 553 Compliance Assessment for ${p.orgName}${p.siteName ? ` — ${p.siteName}` : ""}.

Your full PDF report is attached to this email.

Overall Program Rating: ${p.overallScore}/100 — ${p.riskLabel}
${p.riskDescription}

The attached report breaks down your score across the four sections of the assessment — The Plan, The People, The Process, and The Proof — lists every gap that needs attention${p.gapCount > 0 ? ` (${p.gapCount} in total)` : ""}, and provides concrete remediation guidance for each critical finding.

If you'd like to discuss the findings or start closing the gaps, we offer a free consultation:
https://meetings.hubspot.com/mark-hope2

Stay safe,
The Kestralis team

—
ReadyState is a Kestralis product · Powered by Sentinel Ridge Security
This assessment is self-reported. Not legal advice.`;
}

// ─── Resume-link email ──────────────────────────────────────────────────────

export interface SendResumeLinkParams {
  to: string;
  orgName: string | null;
  siteName: string | null;
  resumeUrl: string;
  expiresInDays: number;
}

export async function sendResumeLinkEmail(
  params: SendResumeLinkParams,
): Promise<SendResult> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("[email] RESEND_API_KEY is not set");
    return { ok: false, error: "Email sending is not configured" };
  }

  const from = process.env.RESEND_FROM_EMAIL ?? DEFAULT_FROM;
  const resend = new Resend(apiKey);

  const orgLabel = params.orgName ?? "your organization";

  try {
    const result = await resend.emails.send({
      from,
      to: params.to,
      subject: `Your ReadyState assessment for ${orgLabel} is saved`,
      html: buildResumeHtml(params),
      text: buildResumeText(params),
    });

    if (result.error) {
      console.error("[email] Resend error (resume)", result.error);
      return {
        ok: false,
        error: result.error.message ?? "Email delivery failed",
      };
    }

    return { ok: true, messageId: result.data?.id ?? null };
  } catch (e) {
    console.error("[email] unexpected resume-email failure", e);
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Email delivery failed",
    };
  }
}

function buildResumeHtml(p: SendResumeLinkParams): string {
  const orgLabel = p.orgName ? escapeHtml(p.orgName) : "your organization";
  const siteLine = p.siteName
    ? `<p style="color:#64748b;font-size:13px;">Site: ${escapeHtml(p.siteName)}</p>`
    : "";
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #0f172a; background: #f8fafc; margin: 0; padding: 0; }
    .wrap { max-width: 560px; margin: 0 auto; padding: 32px 24px; }
    .card { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 32px; }
    .brand { font-weight: 700; font-size: 18px; letter-spacing: 2px; color: #0f172a; }
    .brand-tag { font-size: 10px; color: #64748b; text-transform: uppercase; letter-spacing: 1.5px; margin-top: 4px; }
    h1 { font-size: 22px; margin: 24px 0 8px 0; color: #0f172a; }
    p { line-height: 1.6; color: #334155; font-size: 14px; }
    .cta { display: inline-block; background: #0f172a; color: #ffffff !important; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 15px; margin-top: 20px; }
    .expires { font-size: 12px; color: #64748b; margin-top: 24px; padding-top: 16px; border-top: 1px solid #e2e8f0; }
    .footer { text-align: center; font-size: 11px; color: #94a3b8; padding: 24px 0 8px 0; }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="card">
      <div class="brand">KESTRALIS</div>
      <div class="brand-tag">ReadyState · SB 553 Assessment</div>

      <h1>Pick up where you left off.</h1>
      <p>
        Your ReadyState SB 553 assessment for <strong>${orgLabel}</strong>
        is saved. Click the button below to continue from any device — no
        account required.
      </p>
      ${siteLine}

      <a class="cta" href="${escapeHtml(p.resumeUrl)}">Continue assessment →</a>

      <p class="expires">
        <strong>This link is valid for ${p.expiresInDays} days.</strong>
        After that, saved progress is automatically deleted. Don&rsquo;t
        forward this email — anyone with the link can view and complete the
        assessment.
      </p>
    </div>

    <div class="footer">
      ReadyState is a Kestralis product · Powered by Sentinel Ridge Security
    </div>
  </div>
</body>
</html>`;
}

function buildResumeText(p: SendResumeLinkParams): string {
  const orgLabel = p.orgName ?? "your organization";
  return `KESTRALIS · ReadyState SB 553 Assessment

Pick up where you left off.

Your ReadyState SB 553 assessment for ${orgLabel} is saved. Click the link below to continue from any device — no account required.

${p.siteName ? `Site: ${p.siteName}\n\n` : ""}Continue: ${p.resumeUrl}

This link is valid for ${p.expiresInDays} days. After that, saved progress is automatically deleted. Don't forward this email — anyone with the link can view and complete the assessment.

—
ReadyState is a Kestralis product · Powered by Sentinel Ridge Security`;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function buildFilename(orgName: string): string {
  const slug = orgName
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/(^-+|-+$)/g, "")
    .toLowerCase();
  const dateStr = new Date().toISOString().split("T")[0];
  return `readystate-${slug || "report"}-${dateStr}.pdf`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
