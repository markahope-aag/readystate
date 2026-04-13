import { NextResponse, type NextRequest } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { getCategoryById, type ResponseValue } from "@/lib/assessment/questions";
import type { RiskLevel } from "@/lib/assessment/scoring";
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
    .select("question_id, response")
    .eq("assessment_id", assessmentId);

  // Build gap list — categories rated below "effective"
  const gaps: ReportGap[] = [];
  for (const r of (responses ?? []) as Array<{ question_id: string; response: string }>) {
    if (r.response === "effective" || r.response === "na") continue;
    const category = getCategoryById(r.question_id);
    if (!category) continue;
    gaps.push({ category, response: r.response as ResponseValue });
  }
  gaps.sort((a, b) => {
    if (b.category.weight !== a.category.weight) return b.category.weight - a.category.weight;
    const severity: Record<string, number> = { not_compliant: 3, partial: 2, implemented: 1 };
    return (severity[b.response] ?? 0) - (severity[a.response] ?? 0);
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
