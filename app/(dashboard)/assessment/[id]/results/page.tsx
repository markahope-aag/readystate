import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  getQuestionById,
  sectionMeta,
  type Question,
  type QuestionSection,
} from "@/lib/assessment/questions";
import {
  getRiskColor,
  getRiskLabel,
  getRiskLevel,
  type RiskLevel,
} from "@/lib/assessment/scoring";
import { recommendations } from "@/lib/assessment/recommendations";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DownloadReportButton } from "@/components/download-report-button";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

type ResponseValue = "yes" | "no" | "partial" | "na";

interface ResponseRow {
  question_id: string;
  response: ResponseValue;
  notes: string | null;
}

interface Gap {
  question: Question;
  response: "no" | "partial";
  notes: string | null;
}

const SECTION_SHORT_LABELS: Record<QuestionSection, string> = {
  sb553: "SB 553 Compliance",
  asis: "ASIS Standard",
  hazard: "Site Hazard",
};

const CONSULTATION_URL = "https://meetings.hubspot.com/mark-hope2";

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function ResultsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/");

  const { id } = await params;
  const supabase = await createClient();

  const { data: assessment } = await supabase
    .from("assessments")
    .select(
      "id, site_name, site_address, status, created_at, updated_at, organizations(id, name, industry, employee_count, california_locations)",
    )
    .eq("id", id)
    .maybeSingle();

  if (!assessment) notFound();

  const { data: scores } = await supabase
    .from("assessment_scores")
    .select(
      "sb553_score, asis_score, hazard_score, overall_score, risk_level",
    )
    .eq("assessment_id", id)
    .maybeSingle();

  if (!scores) {
    return <NoScoresYet assessmentId={id} />;
  }

  const { data: responses } = await supabase
    .from("assessment_responses")
    .select("question_id, response, notes")
    .eq("assessment_id", id);

  const gaps = buildGapList((responses as ResponseRow[] | null) ?? []);
  const topCritical = gaps
    .filter((g) => g.question.weight === 3 && g.response === "no")
    .slice(0, 5);

  const riskLevel = (scores.risk_level ?? "critical") as RiskLevel;
  const org = assessment.organizations as unknown as {
    id: string;
    name: string;
    industry: string | null;
    employee_count: number | null;
    california_locations: number | null;
  } | null;
  const assessedAt = assessment.updated_at ?? assessment.created_at;

  return (
    <>
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header className="border-b bg-card">
        <div className="mx-auto max-w-5xl px-6 py-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Assessment Report
              </p>
              <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
                {org?.name ?? "Unknown organization"}
              </h1>
              <p className="text-sm text-muted-foreground">
                {[assessment.site_name, assessment.site_address]
                  .filter(Boolean)
                  .join(" · ") || "Site details unavailable"}
              </p>
              <p className="pt-1 text-xs text-muted-foreground">
                Assessed {formatDate(assessedAt)}
              </p>
            </div>

            <div className="flex flex-col items-start gap-3 sm:items-end">
              <RiskBadge level={riskLevel} />
              <DownloadReportButton assessmentId={id} />
            </div>
          </div>
        </div>
      </header>

      {/* ── Body ───────────────────────────────────────────────────────── */}
      <main className="mx-auto max-w-5xl space-y-14 px-6 py-12">
        {/* ─── Score Summary ─────────────────────────────────────────── */}
        <section className="space-y-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Score Summary
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            <SectionScoreCard section="sb553" score={scores.sb553_score ?? 0} />
            <SectionScoreCard section="asis" score={scores.asis_score ?? 0} />
            <SectionScoreCard section="hazard" score={scores.hazard_score ?? 0} />
          </div>
          <OverallScoreBlock
            score={scores.overall_score ?? 0}
            riskLevel={riskLevel}
          />
        </section>

        {/* ─── Gap Analysis ──────────────────────────────────────────── */}
        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold">Gap Analysis</h2>
            <p className="text-sm text-muted-foreground">
              {gaps.length === 0
                ? "No gaps identified. All questions answered 'yes' or 'n/a'."
                : `${gaps.length} finding${
                    gaps.length === 1 ? "" : "s"
                  } requiring attention, sorted by severity.`}
            </p>
          </div>
          {gaps.length > 0 && <GapTable gaps={gaps} />}
        </section>

        {/* ─── Recommendations ───────────────────────────────────────── */}
        {topCritical.length > 0 && (
          <section className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold">Recommended Next Steps</h2>
              <p className="text-sm text-muted-foreground">
                Top {topCritical.length} critical finding
                {topCritical.length === 1 ? "" : "s"} — start here. Each
                carries direct statutory or high-consequence risk.
              </p>
            </div>
            <div className="space-y-3">
              {topCritical.map(({ question }) => (
                <RecommendationCard key={question.id} question={question} />
              ))}
            </div>
          </section>
        )}

        {/* ─── Footer CTA ────────────────────────────────────────────── */}
        <section className="flex flex-col items-center justify-center gap-3 border-t pt-10 sm:flex-row">
          <a
            href={CONSULTATION_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button size="lg">Schedule a Consultation</Button>
          </a>
          <Link href="/assessment/new">
            <Button size="lg" variant="outline">
              Start New Assessment
            </Button>
          </Link>
        </section>
      </main>
    </>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildGapList(responses: ResponseRow[]): Gap[] {
  const gaps: Gap[] = [];
  for (const r of responses) {
    if (r.response !== "no" && r.response !== "partial") continue;
    const question = getQuestionById(r.question_id);
    if (!question) continue;
    gaps.push({ question, response: r.response, notes: r.notes });
  }
  return gaps.sort((a, b) => {
    // Weight descending (critical first)
    if (b.question.weight !== a.question.weight) {
      return b.question.weight - a.question.weight;
    }
    // Within same weight: 'no' before 'partial'
    if (a.response !== b.response) {
      return a.response === "no" ? -1 : 1;
    }
    return a.question.id.localeCompare(b.question.id);
  });
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function RiskBadge({ level }: { level: RiskLevel }) {
  const colors = getRiskColor(level);
  const { label } = getRiskLabel(level);
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-4 py-1.5 text-sm font-semibold",
        colors.bg,
        colors.text,
        colors.border,
      )}
    >
      {label}
    </span>
  );
}

function ScoreRing({
  value,
  colorClass,
  size = 96,
}: {
  value: number;
  colorClass: string;
  size?: number;
}) {
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(100, Math.max(0, value)) / 100) * circumference;
  return (
    <div
      className={cn("relative shrink-0", colorClass)}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          className="stroke-muted"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <span className="text-xl font-bold text-foreground">{value}</span>
      </div>
    </div>
  );
}

function SectionScoreCard({
  section,
  score,
}: {
  section: QuestionSection;
  score: number;
}) {
  const level = getRiskLevel(score);
  const colors = getRiskColor(level);
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-5">
        <ScoreRing value={score} colorClass={colors.accent} />
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {SECTION_SHORT_LABELS[section]}
          </p>
          <p className="mt-1 text-3xl font-bold leading-none">{score}%</p>
          <p className="mt-2 text-xs text-muted-foreground">
            {getRiskLabel(level).label}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function OverallScoreBlock({
  score,
  riskLevel,
}: {
  score: number;
  riskLevel: RiskLevel;
}) {
  const colors = getRiskColor(riskLevel);
  const meta = getRiskLabel(riskLevel);
  return (
    <Card className={cn("border-2", colors.border)}>
      <CardContent className="p-8">
        <div className="flex flex-col items-center gap-6 md:flex-row md:items-center">
          <div
            className={cn(
              "flex shrink-0 flex-col items-center justify-center rounded-full border-2 px-8 py-6",
              colors.bg,
              colors.text,
              colors.border,
            )}
          >
            <div className="text-5xl font-bold leading-none">{score}</div>
            <div className="mt-1 text-[10px] font-semibold uppercase tracking-wider">
              Overall
            </div>
          </div>
          <div className="flex-1 space-y-2 text-center md:text-left">
            <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Overall Program Rating
            </p>
            <p className="text-xl font-semibold">{meta.label}</p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {meta.description}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function GapTable({ gaps }: { gaps: Gap[] }) {
  return (
    <Card>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/30">
            <tr>
              <TableHead>Section</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="min-w-[280px]">Finding</TableHead>
              <TableHead>Response</TableHead>
              <TableHead>Priority</TableHead>
            </tr>
          </thead>
          <tbody>
            {gaps.map(({ question, response }) => (
              <GapRow key={question.id} question={question} response={response} />
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function TableHead({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <th
      className={cn(
        "px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground",
        className,
      )}
    >
      {children}
    </th>
  );
}

function GapRow({
  question,
  response,
}: {
  question: Question;
  response: "no" | "partial";
}) {
  const isCriticalNo = response === "no" && question.weight === 3;
  const priorityLabel =
    question.weight === 3 ? "Critical" : question.weight === 2 ? "High" : "Medium";
  return (
    <tr
      className={cn(
        "border-b last:border-0",
        isCriticalNo && "bg-red-50/40",
      )}
    >
      <td className="whitespace-nowrap px-4 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {sectionMeta[question.section].label.split(" ")[0]}
      </td>
      <td className="px-4 py-3 text-xs text-muted-foreground">
        {question.category}
      </td>
      <td className="px-4 py-3 text-sm leading-snug">
        <span className="mr-2 font-mono text-xs text-muted-foreground">
          {question.id}
        </span>
        {question.question}
      </td>
      <td className="whitespace-nowrap px-4 py-3">
        <ResponsePill response={response} />
      </td>
      <td className="whitespace-nowrap px-4 py-3">
        <PriorityPill weight={question.weight} label={priorityLabel} />
      </td>
    </tr>
  );
}

function ResponsePill({ response }: { response: "no" | "partial" }) {
  return (
    <span
      className={cn(
        "inline-block rounded-full border px-2 py-0.5 text-xs font-semibold",
        response === "no"
          ? "border-red-200 bg-red-50 text-red-900"
          : "border-amber-200 bg-amber-50 text-amber-900",
      )}
    >
      {response === "no" ? "No" : "Partial"}
    </span>
  );
}

function PriorityPill({ weight, label }: { weight: 1 | 2 | 3; label: string }) {
  const cls =
    weight === 3
      ? "border-red-200 bg-red-50 text-red-900"
      : weight === 2
        ? "border-amber-200 bg-amber-50 text-amber-900"
        : "border-border bg-muted text-muted-foreground";
  return (
    <span
      className={cn(
        "inline-block rounded-full border px-2 py-0.5 text-xs font-semibold",
        cls,
      )}
    >
      {label}
    </span>
  );
}

function RecommendationCard({ question }: { question: Question }) {
  const rec = recommendations[question.id];
  return (
    <Card className="border-destructive/30">
      <CardContent className="space-y-3 p-5">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 shrink-0 rounded-sm bg-destructive/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-destructive">
            Critical
          </span>
          <div className="flex-1 space-y-3">
            <p className="text-sm font-medium leading-snug">
              {question.question}
            </p>
            <div className="border-l-2 border-primary/40 pl-3 text-sm leading-relaxed">
              {rec ?? "Remediation guidance is being prepared for this item."}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function NoScoresYet({ assessmentId }: { assessmentId: string }) {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl items-center justify-center px-6">
      <Card>
        <CardContent className="space-y-4 p-10 text-center">
          <h1 className="text-2xl font-semibold">Assessment not yet scored</h1>
          <p className="text-sm text-muted-foreground">
            This assessment has not been submitted. Finish answering the
            questions and click Submit to generate your report.
          </p>
          <div className="flex justify-center gap-2 pt-2">
            <Link href={`/assessment/new?id=${assessmentId}`}>
              <Button>Resume assessment</Button>
            </Link>
            <Link href="/">
              <Button variant="outline">Home</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
