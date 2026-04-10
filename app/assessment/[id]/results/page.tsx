import Link from "next/link";
import { notFound } from "next/navigation";
import { createServiceRoleClient } from "@/lib/supabase/server";
import {
  getQuestionById,
  sectionMeta,
  type Question,
  type QuestionSection,
} from "@/lib/assessment/questions";
import {
  getRiskLabel,
  getRiskLevel,
  type RiskLevel,
} from "@/lib/assessment/scoring";
import { recommendations } from "@/lib/assessment/recommendations";
import { BrandLogo } from "@/components/brand-logo";
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

const SECTION_ROMANS: Record<QuestionSection, string> = {
  sb553: "I",
  asis: "II",
  hazard: "III",
};

const CONSULTATION_URL = "https://meetings.hubspot.com/mark-hope2";

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function ResultsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createServiceRoleClient();

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
    <div className="min-h-screen bg-paper">
      <header className="border-b border-ink">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-5 md:px-12">
          <BrandLogo variant="onLight" height={36} />
          <span className="eyebrow">The report</span>
        </div>
      </header>

      {/* ═══ Masthead — big editorial splash ════════════════════════════ */}
      <section className="relative border-b border-ink">
        <div className="mx-auto max-w-[1400px] px-6 pt-16 pb-16 md:px-12 md:pt-20 md:pb-20">
          <div className="mb-12 flex flex-wrap items-baseline justify-between gap-4 md:mb-16">
            <div className="flex items-baseline gap-6">
              <span className="eyebrow">Assessment report</span>
              <span className="eyebrow hidden md:inline">
                Issued · {formatDate(assessedAt)}
              </span>
            </div>
            <DownloadReportButton assessmentId={id} />
          </div>

          {/* Org name — oversized Fraunces */}
          <div className="grid gap-10 md:grid-cols-12 md:gap-8">
            <div className="md:col-span-8">
              <h1 className="font-display text-[48px] font-light leading-[0.98] tracking-[-0.022em] text-ink md:text-[88px] lg:text-[112px]">
                {org?.name ?? "Unknown organization"}
                <span className="text-warm-muted">.</span>
              </h1>
              <p className="mt-6 font-display text-[18px] font-light italic leading-snug text-warm-muted md:text-[22px]">
                {assessment.site_name ?? "—"}
                {assessment.site_address ? (
                  <span className="text-warm-muted-soft">
                    {" · "}
                    {assessment.site_address}
                  </span>
                ) : null}
              </p>
            </div>

            {/* Risk band */}
            <div className="md:col-span-4">
              <RiskBand level={riskLevel} />
            </div>
          </div>
        </div>
      </section>

      {/* ═══ Score summary — typographic, no rings ══════════════════════ */}
      <section className="border-b border-ink">
        <div className="mx-auto max-w-[1400px] px-6 py-20 md:px-12 md:py-24">
          <div className="mb-12 grid gap-10 md:mb-16 md:grid-cols-12">
            <div className="md:col-span-4">
              <p className="eyebrow mb-3">Section I</p>
              <h2 className="font-display text-[44px] font-light leading-[0.95] tracking-[-0.02em] text-ink md:text-[64px]">
                The{" "}
                <span className="italic text-forest">scorecard</span>
                <span className="text-warm-muted">.</span>
              </h2>
            </div>
            <div className="md:col-span-6 md:col-start-7">
              <p className="text-[16px] leading-[1.7] text-ink md:text-[17px]">
                Three weighted sections, one overall rating. Each
                section is scored independently from its own questions,
                then combined via the standard ReadyState weighting
                (SB 553 at 50%, ASIS at 30%, Site Hazard at 20%).
              </p>
            </div>
          </div>

          {/* Three section scores as editorial entries */}
          <div className="space-y-0 border-t border-ink">
            <SectionScoreEntry
              section="sb553"
              score={scores.sb553_score ?? 0}
              weightPercent={50}
            />
            <SectionScoreEntry
              section="asis"
              score={scores.asis_score ?? 0}
              weightPercent={30}
            />
            <SectionScoreEntry
              section="hazard"
              score={scores.hazard_score ?? 0}
              weightPercent={20}
            />
          </div>

          {/* Overall — massive Fraunces display */}
          <div className="mt-20 border-t-2 border-ink pt-16 md:mt-24 md:pt-20">
            <OverallBlock
              score={scores.overall_score ?? 0}
              riskLevel={riskLevel}
            />
          </div>
        </div>
      </section>

      {/* ═══ Gap analysis ═══════════════════════════════════════════════ */}
      <section className="border-b border-ink">
        <div className="mx-auto max-w-[1400px] px-6 py-20 md:px-12 md:py-24">
          <div className="mb-12 grid gap-10 md:mb-16 md:grid-cols-12">
            <div className="md:col-span-4">
              <p className="eyebrow mb-3">Section II</p>
              <h2 className="font-display text-[44px] font-light leading-[0.95] tracking-[-0.02em] text-ink md:text-[64px]">
                The{" "}
                <span className="italic text-forest">gap</span>
                <br />
                analysis
                <span className="text-warm-muted">.</span>
              </h2>
            </div>
            <div className="md:col-span-6 md:col-start-7">
              <p className="text-[16px] leading-[1.7] text-ink md:text-[17px]">
                {gaps.length === 0
                  ? "No gaps identified. Every question answered yes or n/a — an uncommonly strong posture that should be reviewed for honesty before relying on it."
                  : `${gaps.length} finding${gaps.length === 1 ? "" : "s"} requiring attention. Sorted by weight (critical first), then by response severity. Every finding ties to a specific statutory or standard requirement.`}
              </p>
            </div>
          </div>

          {gaps.length > 0 && <GapTable gaps={gaps} />}
        </div>
      </section>

      {/* ═══ Recommendations ════════════════════════════════════════════ */}
      {topCritical.length > 0 && (
        <section className="border-b border-ink">
          <div className="mx-auto max-w-[1400px] px-6 py-20 md:px-12 md:py-24">
            <div className="mb-12 grid gap-10 md:mb-16 md:grid-cols-12">
              <div className="md:col-span-4">
                <p className="eyebrow mb-3">Section III</p>
                <h2 className="font-display text-[44px] font-light leading-[0.95] tracking-[-0.02em] text-ink md:text-[64px]">
                  Where to{" "}
                  <span className="italic text-risk-red">start</span>
                  <span className="text-warm-muted">.</span>
                </h2>
              </div>
              <div className="md:col-span-6 md:col-start-7">
                <p className="text-[16px] leading-[1.7] text-ink md:text-[17px]">
                  The top {topCritical.length} critical finding
                  {topCritical.length === 1 ? "" : "s"}, with concrete
                  remediation guidance. These carry direct statutory
                  exposure — close them first.
                </p>
              </div>
            </div>

            <div className="space-y-0">
              {topCritical.map(({ question }, idx) => (
                <RecommendationEntry
                  key={question.id}
                  question={question}
                  number={idx + 1}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══ Colophon / CTA ═════════════════════════════════════════════ */}
      <section className="border-b border-ink bg-ink text-paper">
        <div className="mx-auto max-w-[1400px] px-6 py-20 md:px-12 md:py-28">
          <div className="grid gap-10 md:grid-cols-12 md:items-end">
            <div className="md:col-span-8">
              <p className="eyebrow mb-6 text-sand">
                Next movement
              </p>
              <h2 className="font-display text-[44px] font-light leading-[0.95] tracking-[-0.025em] text-paper md:text-[80px]">
                Close the{" "}
                <span className="italic text-sand">gaps</span>
                <span className="text-warm-muted-soft">.</span>
              </h2>
            </div>
            <div className="md:col-span-4">
              <p className="mb-8 text-[15px] leading-[1.7] text-sand-soft">
                Schedule a free consultation to walk through the
                findings and build a remediation plan, or start a
                fresh assessment for another site.
              </p>
              <div className="flex flex-col gap-4">
                <a
                  href={CONSULTATION_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-baseline gap-3 border-b border-sand pb-1 font-display text-[20px] italic text-paper"
                >
                  <span>Schedule a consultation</span>
                  <span className="transition-transform duration-300 group-hover:translate-x-1">
                    →
                  </span>
                </a>
                <Link
                  href="/assessment/new"
                  className="group inline-flex items-baseline gap-3 pb-1 font-display text-[15px] italic text-sand-soft"
                >
                  <span className="link-editorial">
                    Start another assessment
                  </span>
                  <span className="transition-transform duration-300 group-hover:translate-x-1">
                    →
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-sand bg-paper">
        <div className="mx-auto max-w-[1400px] px-6 py-10 md:px-12">
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <BrandLogo variant="onLight" height={32} asLink={false} />
            <div className="flex flex-col items-start gap-1 text-xs text-warm-muted md:items-end">
              <p>
                A product of Kestralis Group, LLC ·{" "}
                <span className="italic">California, 2026</span>
              </p>
              <p>
                Not legal advice. Powered by{" "}
                <span className="italic">Asymmetric Marketing</span>.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
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
    if (b.question.weight !== a.question.weight) {
      return b.question.weight - a.question.weight;
    }
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

function RiskBand({ level }: { level: RiskLevel }) {
  const { label, description } = getRiskLabel(level);
  const toneClass = toneForRisk(level);
  return (
    <div className="border-2 border-ink p-6 md:p-7">
      <p className="eyebrow mb-3">Overall rating</p>
      <p
        className={cn(
          "font-display text-[36px] font-light italic leading-[1] md:text-[44px]",
          toneClass,
        )}
      >
        {label}
        <span className="text-warm-muted">.</span>
      </p>
      <p className="mt-4 text-[13px] leading-[1.6] text-warm-muted">
        {description}
      </p>
    </div>
  );
}

function SectionScoreEntry({
  section,
  score,
  weightPercent,
}: {
  section: QuestionSection;
  score: number;
  weightPercent: number;
}) {
  const level = getRiskLevel(score);
  const toneClass = toneForRisk(level);
  return (
    <article className="group grid grid-cols-12 items-baseline gap-4 border-b border-ink/30 py-10 md:gap-10 md:py-14">
      <div className="col-span-12 md:col-span-1">
        <span className="font-display text-[32px] font-light italic leading-none text-forest md:text-[44px]">
          {SECTION_ROMANS[section]}
        </span>
      </div>

      <div className="col-span-12 md:col-span-5">
        <p className="eyebrow mb-2">
          {section === "sb553"
            ? "Statutory"
            : section === "asis"
              ? "Professional standard"
              : "Site profile"}
        </p>
        <h3 className="font-display text-[28px] font-light leading-[1.02] tracking-[-0.015em] text-ink md:text-[36px]">
          {SECTION_SHORT_LABELS[section]}
        </h3>
        <p className="mt-2 font-mono tabular-figures text-[11px] text-warm-muted">
          Weighted {weightPercent}% of overall score
        </p>
      </div>

      <div className="col-span-12 md:col-span-6">
        <div className="flex items-baseline justify-between gap-6 border-b border-ink/20 pb-2">
          <span className="eyebrow">Score</span>
          <span
            className={cn(
              "font-display text-[64px] font-light leading-none tabular-figures md:text-[96px]",
              toneClass,
            )}
          >
            {score}
            <span className="text-warm-muted">%</span>
          </span>
        </div>
        <p
          className={cn(
            "mt-3 font-display text-[14px] italic",
            toneClass,
          )}
        >
          {getRiskLabel(level).label}
        </p>
      </div>
    </article>
  );
}

function OverallBlock({
  score,
  riskLevel,
}: {
  score: number;
  riskLevel: RiskLevel;
}) {
  const meta = getRiskLabel(riskLevel);
  const toneClass = toneForRisk(riskLevel);
  return (
    <div className="grid gap-10 md:grid-cols-12 md:gap-16">
      <div className="md:col-span-6">
        <p className="eyebrow mb-4">Overall program rating</p>
        <div
          className={cn(
            "font-display font-light leading-[0.8] tabular-figures",
            toneClass,
          )}
        >
          <span className="block text-[200px] tracking-[-0.04em] md:text-[320px]">
            {score}
          </span>
        </div>
      </div>
      <div className="md:col-span-5 md:col-start-8">
        <p
          className={cn(
            "font-display text-[40px] font-light italic leading-[0.95] tracking-[-0.01em] md:text-[56px]",
            toneClass,
          )}
        >
          {meta.label}
          <span className="text-warm-muted">.</span>
        </p>
        <p className="mt-8 text-[15px] leading-[1.7] text-ink md:text-[16px]">
          {meta.description}
        </p>
      </div>
    </div>
  );
}

function GapTable({ gaps }: { gaps: Gap[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-t border-b border-ink">
            <Th className="min-w-[80px]">§</Th>
            <Th className="min-w-[120px]">Item</Th>
            <Th className="w-full">Finding</Th>
            <Th className="min-w-[110px]">Response</Th>
            <Th className="min-w-[120px] text-right">Priority</Th>
          </tr>
        </thead>
        <tbody>
          {gaps.map(({ question, response }) => (
            <GapRow
              key={question.id}
              question={question}
              response={response}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Th({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <th
      className={cn(
        "py-3 pr-4 text-left font-display text-[12px] font-medium italic text-forest",
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
  const priorityLabel =
    question.weight === 3
      ? "Critical"
      : question.weight === 2
        ? "High"
        : "Medium";
  const priorityTone =
    question.weight === 3
      ? "text-risk-red"
      : question.weight === 2
        ? "text-warm-muted"
        : "text-warm-muted-soft";
  const responseTone =
    response === "no" ? "text-risk-red" : "text-warm-muted";

  return (
    <tr className="border-b border-ink/20 align-top">
      <td className="py-5 pr-4 font-mono text-[10px] uppercase tracking-wide text-warm-muted">
        {SECTION_ROMANS[question.section]}
      </td>
      <td className="py-5 pr-4 font-mono text-[10px] text-warm-muted-soft">
        {question.id}
      </td>
      <td className="py-5 pr-4">
        <p className="font-display text-[17px] font-light leading-snug text-ink md:text-[18px]">
          {question.question}
        </p>
        <p className="mt-1 font-display text-[12px] italic text-warm-muted-soft">
          {question.category}
        </p>
      </td>
      <td className={cn("py-5 pr-4", responseTone)}>
        <span className="font-display text-[16px] italic">
          {response === "no" ? "No" : "Partial"}
        </span>
      </td>
      <td className={cn("py-5 pr-0 text-right", priorityTone)}>
        <span className="font-display text-[16px] italic">
          {priorityLabel}
        </span>
      </td>
    </tr>
  );
}

function RecommendationEntry({
  question,
  number,
}: {
  question: Question;
  number: number;
}) {
  const rec = recommendations[question.id];
  return (
    <article className="grid grid-cols-12 gap-4 border-b border-ink/30 py-10 md:gap-10 md:py-14">
      <div className="col-span-12 md:col-span-1">
        <span className="font-display text-[32px] font-light italic leading-none text-risk-red md:text-[44px]">
          {String(number).padStart(2, "0")}
        </span>
      </div>
      <div className="col-span-12 md:col-span-5">
        <p className="eyebrow mb-3 text-risk-red">
          Critical · {question.id}
        </p>
        <h3 className="font-display text-[22px] font-light leading-[1.2] text-ink md:text-[26px]">
          {question.question}
        </h3>
      </div>
      <div className="col-span-12 md:col-span-6">
        <p className="eyebrow mb-3">Remediation</p>
        <p className="border-l-2 border-forest pl-5 text-[15px] leading-[1.7] text-ink md:text-[16px]">
          {rec ?? "Remediation guidance is being prepared for this item."}
        </p>
      </div>
    </article>
  );
}

function toneForRisk(level: RiskLevel): string {
  switch (level) {
    case "low":
      return "text-forest";
    case "moderate":
      return "text-forest-soft";
    case "high":
      return "text-sand-deep";
    case "critical":
      return "text-risk-red";
  }
}

function NoScoresYet({ assessmentId }: { assessmentId: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-6">
      <div className="max-w-md space-y-5 text-center">
        <p className="eyebrow">Pending</p>
        <h1 className="font-display text-[40px] font-light leading-[1] tracking-[-0.015em] text-ink md:text-[56px]">
          Not yet{" "}
          <span className="italic text-forest">scored</span>
          <span className="text-warm-muted">.</span>
        </h1>
        <p className="text-sm leading-[1.65] text-warm-muted">
          This assessment hasn&apos;t been submitted yet. Finish
          answering the questions and submit to generate the report.
        </p>
        <div className="flex justify-center gap-6 pt-2">
          <Link
            href={`/assessment/new?id=${assessmentId}`}
            className="group inline-flex items-baseline gap-2 font-display text-[18px] italic text-ink"
          >
            <span className="link-editorial">Resume assessment</span>
            <span className="transition-transform duration-300 group-hover:translate-x-1">
              →
            </span>
          </Link>
          <Link
            href="/"
            className="group inline-flex items-baseline gap-2 font-display text-[16px] italic text-warm-muted"
          >
            <span className="link-editorial">Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
