import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { createClient } from "@/lib/supabase/server";
import { getQuestionById } from "@/lib/assessment/questions";
import type { RiskLevel } from "@/lib/assessment/scoring";
import {
  AssessmentReport,
  type ReportGap,
} from "@/lib/pdf/AssessmentReport";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * GET /api/assessment/[id]/report
 *
 * Generates a Kestralis-branded PDF report for a single assessment and
 * streams it back as application/pdf with an inline Content-Disposition
 * filename. Scoped by RLS to the authenticated user's own assessments.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id: assessmentId } = await params;
  const supabase = await createClient();

  const { data: assessment, error: assessmentError } = await supabase
    .from("assessments")
    .select(
      "id, site_name, site_address, status, created_at, updated_at, organizations(name, industry, employee_count, california_locations)",
    )
    .eq("id", assessmentId)
    .maybeSingle();

  if (assessmentError || !assessment) {
    return NextResponse.json(
      { error: "Assessment not found" },
      { status: 404 },
    );
  }

  const { data: scoresRow } = await supabase
    .from("assessment_scores")
    .select(
      "sb553_score, asis_score, hazard_score, overall_score, risk_level",
    )
    .eq("assessment_id", assessmentId)
    .maybeSingle();

  if (!scoresRow) {
    return NextResponse.json(
      { error: "Assessment has not been scored yet" },
      { status: 400 },
    );
  }

  const { data: responses } = await supabase
    .from("assessment_responses")
    .select("question_id, response, notes")
    .eq("assessment_id", assessmentId);

  // Build the gap list (same logic as the HTML results page)
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

  // Normalize Supabase's array-vs-object foreign-table response
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rawOrg = (assessment as any).organizations;
  const organization = Array.isArray(rawOrg) ? (rawOrg[0] ?? null) : rawOrg;

  const scores = {
    sb553Score: scoresRow.sb553_score ?? 0,
    asisScore: scoresRow.asis_score ?? 0,
    hazardScore: scoresRow.hazard_score ?? 0,
    overallScore: scoresRow.overall_score ?? 0,
    riskLevel: (scoresRow.risk_level ?? "critical") as RiskLevel,
  };

  let buffer: Buffer;
  try {
    buffer = await renderToBuffer(
      <AssessmentReport
        assessment={{
          id: assessment.id,
          site_name: assessment.site_name,
          site_address: assessment.site_address,
          status: assessment.status,
          created_at: assessment.created_at,
          updated_at: assessment.updated_at,
        }}
        organization={organization}
        scores={scores}
        gaps={gaps}
        generatedAt={new Date()}
      />,
    );
  } catch (e) {
    console.error("PDF render failed", e);
    return NextResponse.json(
      { error: "Failed to render PDF report" },
      { status: 500 },
    );
  }

  const orgSlug = (organization?.name ?? "report")
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/(^-+|-+$)/g, "")
    .toLowerCase() || "report";
  const dateStr = new Date().toISOString().split("T")[0];
  const filename = `readystate-${orgSlug}-${dateStr}.pdf`;

  return new NextResponse(buffer as unknown as BodyInit, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Content-Length": String(buffer.length),
      "Cache-Control": "private, no-store",
    },
  });
}
