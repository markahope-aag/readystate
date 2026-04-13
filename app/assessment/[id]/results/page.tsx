import Link from "next/link";
import { notFound } from "next/navigation";
import { createServiceRoleClient } from "@/lib/supabase/server";
import {
  getCategoryById,
  getActiveCategories,
  RESPONSE_OPTIONS,
  type Category,
  type ResponseValue,
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

interface Gap {
  category: Category;
  response: ResponseValue;
}

const CONSULTATION_URL = "https://meetings.hubspot.com/mark-hope2";

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
    .select("overall_score, risk_level")
    .eq("assessment_id", id)
    .maybeSingle();

  if (!scores) {
    return <NoScoresYet assessmentId={id} />;
  }

  const { data: responses } = await supabase
    .from("assessment_responses")
    .select("question_id, response")
    .eq("assessment_id", id);

  // Build response map + gap list
  const responseMap = new Map<string, ResponseValue>();
  const gaps: Gap[] = [];
  for (const r of (responses ?? []) as Array<{ question_id: string; response: string }>) {
    responseMap.set(r.question_id, r.response as ResponseValue);
    if (r.response === "effective" || r.response === "na") continue;
    const category = getCategoryById(r.question_id);
    if (!category) continue;
    gaps.push({ category, response: r.response as ResponseValue });
  }
  gaps.sort((a, b) => {
    if (b.category.weight !== a.category.weight) return b.category.weight - a.category.weight;
    const sev: Record<string, number> = { not_compliant: 3, partial: 2, implemented: 1 };
    return (sev[b.response] ?? 0) - (sev[a.response] ?? 0);
  });

  const riskLevel = (scores.risk_level ?? "critical") as RiskLevel;
  const org = assessment.organizations as unknown as {
    id: string; name: string; industry: string | null;
    employee_count: number | null; california_locations: number | null;
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

      {/* ═══ Masthead ═══════════════════════════════════════════════ */}
      <section className="relative border-b border-ink">
        <div className="mx-auto max-w-[1400px] px-6 pt-16 pb-16 md:px-12 md:pt-20 md:pb-20">
          <div className="mb-12 flex flex-wrap items-baseline justify-between gap-4 md:mb-16">
            <div className="flex items-baseline gap-6">
              <span className="eyebrow">SB 553 Assessment</span>
              <span className="eyebrow hidden md:inline">
                Issued · {formatDate(assessedAt)}
              </span>
            </div>
            <DownloadReportButton assessmentId={id} />
          </div>

          <div className="grid gap-10 md:grid-cols-12 md:gap-8">
            <div className="md:col-span-8">
              <h1 className="font-display text-[48px] font-light leading-[0.98] tracking-[-0.022em] text-ink md:text-[88px] lg:text-[112px]">
                {org?.name ?? "Unknown"}
                <span className="text-warm-muted">.</span>
              </h1>
              <p className="mt-6 font-display text-[18px] font-light italic leading-snug text-warm-muted md:text-[22px]">
                {assessment.site_name ?? "—"}
                {assessment.site_address && (
                  <span className="text-warm-muted-soft">
                    {" · "}{assessment.site_address}
                  </span>
                )}
              </p>
            </div>
            <div className="md:col-span-4">
              <RiskBand level={riskLevel} score={scores.overall_score ?? 0} />
            </div>
          </div>
        </div>
      </section>

      {/* ═══ Category scorecard ═════════════════════════════════════ */}
      <section className="border-b border-ink">
        <div className="mx-auto max-w-[1400px] px-6 py-20 md:px-12 md:py-24">
          <div className="mb-12 md:mb-16">
            <p className="eyebrow mb-3">Scorecard</p>
            <h2 className="font-display text-[44px] font-light leading-[0.95] tracking-[-0.02em] text-ink md:text-[64px]">
              Category{" "}
              <span className="italic text-forest">results</span>
              <span className="text-warm-muted">.</span>
            </h2>
          </div>

          <div className="space-y-0 border-t border-ink">
            {getActiveCategories().map((cat, idx) => {
              const resp = responseMap.get(cat.id);
              const opt = resp ? RESPONSE_OPTIONS.find((o) => o.value === resp) : null;
              return (
                <div
                  key={cat.id}
                  className="grid grid-cols-12 gap-4 border-b border-ink/30 py-8 md:gap-10 md:py-10"
                >
                  <div className="col-span-1">
                    <span className="font-display text-[28px] font-light italic leading-none text-forest">
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <div className="col-span-7 md:col-span-6">
                    <h3 className="font-display text-[18px] font-light leading-[1.1] text-ink md:text-[22px]">
                      {cat.title}
                    </h3>
                    <p className="mt-1 font-display text-[11px] italic text-warm-muted-soft">
                      {cat.statuteRef}
                    </p>
                  </div>
                  <div className="col-span-4 md:col-span-5 md:text-right">
                    <p className={cn(
                      "font-display text-[18px] italic md:text-[22px]",
                      !resp ? "text-warm-muted-soft"
                        : resp === "effective" ? "text-forest"
                        : resp === "implemented" ? "text-forest-soft"
                        : resp === "partial" ? "text-sand-deep"
                        : resp === "not_compliant" ? "text-risk-red"
                        : "text-warm-muted",
                    )}>
                      {opt?.label ?? (resp === "na" ? "N/A" : "—")}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Overall score */}
          <div className="mt-20 border-t-2 border-ink pt-16 md:mt-24 md:pt-20">
            <OverallBlock score={scores.overall_score ?? 0} riskLevel={riskLevel} />
          </div>
        </div>
      </section>

      {/* ═══ Gap analysis ══════════════════════════════════════════ */}
      {gaps.length > 0 && (
        <section className="border-b border-ink">
          <div className="mx-auto max-w-[1400px] px-6 py-20 md:px-12 md:py-24">
            <div className="mb-12 md:mb-16">
              <p className="eyebrow mb-3">Gaps</p>
              <h2 className="font-display text-[44px] font-light leading-[0.95] tracking-[-0.02em] text-ink md:text-[64px]">
                Areas below{" "}
                <span className="italic text-forest">full compliance</span>
                <span className="text-warm-muted">.</span>
              </h2>
              <p className="mt-4 max-w-2xl text-[15px] leading-[1.65] text-warm-muted">
                {gaps.length} {gaps.length === 1 ? "category" : "categories"} rated
                below Effective, sorted by severity.
              </p>
            </div>

            <div className="space-y-0 border-t border-ink">
              {gaps.map((gap, idx) => {
                const opt = RESPONSE_OPTIONS.find((o) => o.value === gap.response);
                const rec = recommendations[gap.category.id];
                return (
                  <article
                    key={gap.category.id}
                    className="grid grid-cols-12 gap-4 border-b border-ink/30 py-10 md:gap-10 md:py-12"
                  >
                    <div className="col-span-1">
                      <span className={cn(
                        "font-display text-[28px] font-light italic leading-none",
                        gap.category.weight === 3 ? "text-risk-red" : "text-forest",
                      )}>
                        {String(idx + 1).padStart(2, "0")}
                      </span>
                    </div>
                    <div className="col-span-11 md:col-span-5">
                      <p className={cn("eyebrow mb-2", gap.category.weight === 3 && "text-risk-red")}>
                        {gap.category.weight === 3 ? "Critical" : "Important"} ·{" "}
                        {opt?.label ?? gap.response}
                      </p>
                      <h3 className="font-display text-[22px] font-light leading-[1.15] text-ink md:text-[26px]">
                        {gap.category.title}
                      </h3>
                      <p className="mt-2 font-display text-[12px] italic text-warm-muted-soft">
                        {gap.category.statuteRef}
                      </p>
                    </div>
                    {rec && (
                      <div className="col-span-12 md:col-span-6">
                        <p className="eyebrow mb-3">Remediation</p>
                        <p className="border-l-2 border-forest pl-5 text-[15px] leading-[1.7] text-ink">
                          {rec}
                        </p>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ═══ CTA ════════════════════════════════════════════════════ */}
      <section className="border-b border-ink bg-forest text-paper">
        <div className="mx-auto max-w-[1400px] px-6 py-20 md:px-12 md:py-28">
          <div className="grid gap-10 md:grid-cols-12 md:items-end">
            <div className="md:col-span-8">
              <p className="eyebrow mb-6 text-sand">Next steps</p>
              <h2 className="font-display text-[44px] font-light leading-[0.95] tracking-[-0.025em] text-paper md:text-[80px]">
                Close the{" "}
                <span className="italic text-sand">gaps</span>
                <span className="text-paper/40">.</span>
              </h2>
            </div>
            <div className="md:col-span-4">
              <div className="flex flex-col gap-4">
                <a
                  href={CONSULTATION_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-baseline gap-3 border-b border-sand pb-1 font-display text-[20px] italic text-paper"
                >
                  <span>Schedule a consultation</span>
                  <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                </a>
                <Link
                  href="/assessment/new"
                  className="group inline-flex items-baseline gap-3 pb-1 font-display text-[15px] italic text-sand-soft"
                >
                  <span className="link-editorial">Start another assessment</span>
                  <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ Footer ═════════════════════════════════════════════════ */}
      <footer className="border-t border-sand bg-paper">
        <div className="mx-auto max-w-[1400px] px-6 py-10 md:px-12">
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <BrandLogo variant="onLight" height={32} asLink={false} />
            <div className="flex flex-col items-start gap-1 text-xs text-warm-muted md:items-end">
              <p>A product of Kestralis Group, LLC · <span className="italic">California, 2026</span></p>
              <p>Not legal advice. Powered by <span className="italic">Asymmetric Marketing</span>.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function RiskBand({ level, score }: { level: RiskLevel; score: number }) {
  const { label, description } = getRiskLabel(level);
  const tone = level === "low" ? "text-forest" : level === "moderate" ? "text-forest-soft" : level === "high" ? "text-sand-deep" : "text-risk-red";
  return (
    <div className="border-2 border-ink p-6 md:p-7">
      <p className="eyebrow mb-3">Overall</p>
      <p className={cn("font-display text-[64px] font-light tabular-figures leading-none md:text-[80px]", tone)}>
        {score}
      </p>
      <p className={cn("mt-3 font-display text-[18px] italic", tone)}>
        {label}<span className="text-warm-muted">.</span>
      </p>
      <p className="mt-4 text-[13px] leading-[1.6] text-warm-muted">{description}</p>
    </div>
  );
}

function OverallBlock({ score, riskLevel }: { score: number; riskLevel: RiskLevel }) {
  const meta = getRiskLabel(riskLevel);
  const tone = riskLevel === "low" ? "text-forest" : riskLevel === "moderate" ? "text-forest-soft" : riskLevel === "high" ? "text-sand-deep" : "text-risk-red";
  return (
    <div className="grid gap-10 md:grid-cols-12 md:gap-16">
      <div className="md:col-span-6">
        <p className="eyebrow mb-4">Overall program rating</p>
        <div className={cn("font-display font-light leading-[0.8] tabular-figures", tone)}>
          <span className="block text-[200px] tracking-[-0.04em] md:text-[280px]">{score}</span>
        </div>
      </div>
      <div className="md:col-span-5 md:col-start-8">
        <p className={cn("font-display text-[40px] font-light italic leading-[0.95] md:text-[56px]", tone)}>
          {meta.label}<span className="text-warm-muted">.</span>
        </p>
        <p className="mt-8 text-[15px] leading-[1.7] text-ink md:text-[16px]">{meta.description}</p>
      </div>
    </div>
  );
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

function NoScoresYet({ assessmentId }: { assessmentId: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-6">
      <div className="max-w-md space-y-5 text-center">
        <p className="eyebrow">Pending</p>
        <h1 className="font-display text-[40px] font-light leading-[1] text-ink md:text-[56px]">
          Not yet <span className="italic text-forest">scored</span><span className="text-warm-muted">.</span>
        </h1>
        <p className="text-sm leading-[1.65] text-warm-muted">Finish and submit the assessment to generate the report.</p>
        <div className="flex justify-center gap-6 pt-2">
          <Link href={`/assessment/new?id=${assessmentId}`} className="group inline-flex items-baseline gap-2 font-display text-[18px] italic text-ink">
            <span className="link-editorial">Resume assessment</span>
            <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
