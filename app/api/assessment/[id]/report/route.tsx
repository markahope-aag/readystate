import { NextResponse, type NextRequest } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { createServiceRoleClient } from "@/lib/supabase/server";
import {
  detectModel,
  getActiveSections,
  isSectionNotesId,
  type ResponseValue,
} from "@/lib/assessment/questions";
import { computeScores, type RiskLevel } from "@/lib/assessment/scoring";
import {
  AssessmentReport,
  type ReportGap,
} from "@/lib/pdf/AssessmentReport";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: assessmentId } = await params;
  const supabase = createServiceRoleClient();

  const { data: assessment, error: assessmentError } = await supabase
    .from("assessments")
    .select(
      "id, site_name, site_address, status, created_at, updated_at, organizations(name, industry, employee_count, california_locations)",
    )
    .eq("id", assessmentId)
    .maybeSingle();

  if (assessmentError || !assessment) {
    return NextResponse.json({ error: "Assessment not found" }, { status: 404 });
  }

  const { data: scoresRow } = await supabase
    .from("assessment_scores")
    .select("overall_score, risk_level")
    .eq("assessment_id", assessmentId)
    .maybeSingle();

  if (!scoresRow) {
    return NextResponse.json({ error: "Assessment not scored yet" }, { status: 400 });
  }

  const { data: responses } = await supabase
    .from("assessment_responses")
    .select("question_id, response, notes")
    .eq("assessment_id", assessmentId);

  const rows = (responses ?? []) as Array<{
    question_id: string;
    response: string;
    notes: string | null;
  }>;
  const realRows = rows.filter((r) => !isSectionNotesId(r.question_id));
  const model = detectModel(realRows.map((r) => r.question_id));

  if (model === "v2") {
    return NextResponse.json(
      {
        error:
          "PDF download is unavailable for legacy v2 assessments. View results in the browser.",
      },
      { status: 410 },
    );
  }

  const result = computeScores(
    realRows.map((r) => ({ question_id: r.question_id, response: r.response })),
  );

  // Section notes
  const sectionNotes: Record<string, string> = {};
  for (const r of rows) {
    if (isSectionNotesId(r.question_id) && r.notes) {
      sectionNotes[r.question_id.replace(/^notes_/, "")] = r.notes;
    }
  }

  // Build gap list
  const responseMap = new Map<string, ResponseValue>();
  for (const r of realRows) {
    if (
      r.response === "yes" ||
      r.response === "no" ||
      r.response === "partial" ||
      r.response === "na"
    ) {
      responseMap.set(r.question_id, r.response);
    }
  }
  const gaps: ReportGap[] = [];
  for (const section of getActiveSections()) {
    for (const q of section.questions) {
      if (q.deprecated) continue;
      const response = responseMap.get(q.id);
      if (!response || response === "yes" || response === "na") continue;
      gaps.push({ question: q, section, response });
    }
  }
  gaps.sort((a, b) => {
    if (b.question.weight !== a.question.weight)
      return b.question.weight - a.question.weight;
    const sev: Record<string, number> = { no: 2, partial: 1 };
    return (sev[b.response] ?? 0) - (sev[a.response] ?? 0);
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rawOrg = (assessment as any).organizations;
  const organization = Array.isArray(rawOrg) ? (rawOrg[0] ?? null) : rawOrg;

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
        scores={{
          overallScore: scoresRow.overall_score ?? 0,
          riskLevel: (scoresRow.risk_level ?? "critical") as RiskLevel,
        }}
        sectionScores={result.sectionScores}
        sectionNotes={sectionNotes}
        gaps={gaps}
        generatedAt={new Date()}
      />,
    );
  } catch (e) {
    console.error("PDF render failed", e);
    return NextResponse.json({ error: "Failed to render PDF" }, { status: 500 });
  }

  const orgSlug = (organization?.name ?? "report")
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/(^-+|-+$)/g, "")
    .toLowerCase() || "report";
  const dateStr = new Date().toISOString().split("T")[0];

  return new NextResponse(buffer as unknown as BodyInit, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="readystate-${orgSlug}-${dateStr}.pdf"`,
      "Content-Length": String(buffer.length),
      "Cache-Control": "private, no-store",
    },
  });
}
