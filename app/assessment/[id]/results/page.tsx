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

const CONSULTATION_URL = "https://kestralisgroup.com/contact/consultation";

/** Score color by risk band */
const SCORE_COLOR: Record<RiskLevel, string> = {
  critical: "text-[#DC2626]",
  high: "text-[#D97706]",
  moderate: "text-[color:var(--color-blue)]",
  low: "text-[#16A34A]",
};

/** Border color for gap severity */
const GAP_BORDER: Record<string, string> = {
  not_compliant: "border-l-[#DC2626]",
  partial: "border-l-[#D97706]",
  implemented: "border-l-[color:var(--color-navy)]",
};

/** Response label color */
const RESPONSE_COLOR: Record<string, string> = {
  effective: "text-[color:var(--color-navy)]",
  implemented: "text-[color:var(--color-blue)]",
  partial: "text-[#D97706]",
  not_compliant: "text-[#DC2626]",
  na: "text-[color:var(--color-muted)]",
};

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
  const riskMeta = getRiskLabel(riskLevel);

  return (
    <div className="min-h-screen bg-white">
      {/* ═══ Nav ═══════════════════════════════════════════════════════ */}
      <header className="sticky top-0 z-20 border-b border-[color:var(--color-border)] bg-white">
        <div className="mx-auto flex max-w-[960px] items-center justify-between px-6 h-16">
          <BrandLogo variant="onLight" height={24} />
          <span className="hidden md:block text-[0.6875rem] font-medium uppercase tracking-[0.1em] text-[color:var(--color-muted)]">
            A Kestralis product
          </span>
        </div>
      </header>

      {/* ═══ Masthead ═══════════════════════════════════════════════ */}
      <section className="border-b border-[color:var(--color-border)]">
        <div className="mx-auto max-w-[960px] px-6 pt-14 pb-14 md:pt-20 md:pb-16">
          <div className="flex flex-wrap items-baseline justify-between gap-4 mb-10">
            <div className="flex items-baseline gap-6">
              <span className="eyebrow">SB 553 Assessment</span>
              <span className="text-[0.6875rem] text-[color:var(--color-muted)] hidden md:inline">
                {formatDate(assessedAt)}
              </span>
            </div>
            <DownloadReportButton assessmentId={id} />
          </div>

          <div className="grid gap-10 md:grid-cols-12 md:gap-8 md:items-end">
            <div className="md:col-span-8">
              <h1 className="text-[clamp(2.5rem,2rem+2.5vw,4rem)] font-bold leading-[1.06] tracking-[-0.02em] text-[color:var(--color-navy)]">
                {org?.name ?? "Unknown"}
              </h1>
              <p className="mt-3 text-[1.0625rem] text-[color:var(--color-muted)]">
                {assessment.site_name ?? "—"}
                {assessment.site_address && <span> · {assessment.site_address}</span>}
              </p>
            </div>
            <div className="md:col-span-4">
              {/* Score badge */}
              <div className="border-2 border-[color:var(--color-navy)] rounded-sm p-6">
                <p className="eyebrow mb-2">Overall Score</p>
                <p className={cn("text-[4rem] font-bold tabular-figures leading-none", SCORE_COLOR[riskLevel])}>
                  {scores.overall_score ?? 0}
                </p>
                <p className={cn("mt-2 text-[0.875rem] font-semibold uppercase tracking-[0.06em]", SCORE_COLOR[riskLevel])}>
                  {riskMeta.label}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ Category scorecard ═════════════════════════════════════ */}
      <section className="border-b border-[color:var(--color-border)]">
        <div className="mx-auto max-w-[960px] px-6 py-16 md:py-20">
          <p className="eyebrow">— Scorecard</p>
          <h2 className="mt-5 text-[clamp(1.75rem,1.25rem+2vw,2.75rem)] font-semibold tracking-[-0.012em] text-[color:var(--color-navy)]">
            Category results.
          </h2>

          <ol className="mt-12 border-t-2 border-[color:var(--color-navy)]">
            {getActiveCategories().map((cat, idx) => {
              const resp = responseMap.get(cat.id);
              const opt = resp ? RESPONSE_OPTIONS.find((o) => o.value === resp) : null;
              return (
                <li
                  key={cat.id}
                  className="grid grid-cols-12 gap-4 border-b border-[color:var(--color-border)] py-5 md:gap-8 md:py-6"
                >
                  <div className="col-span-1">
                    <span className="text-[1.25rem] font-bold text-[color:var(--color-blue-light)] tabular-figures leading-none">
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <div className="col-span-7 md:col-span-6">
                    <h3 className="text-[0.9375rem] font-semibold text-[color:var(--color-navy)]">
                      {cat.title}
                    </h3>
                    <p className="mt-0.5 text-[0.6875rem] text-[color:var(--color-muted)]">
                      {cat.statuteRef}
                    </p>
                  </div>
                  <div className="col-span-4 md:col-span-5 md:text-right">
                    <p className={cn(
                      "text-[0.9375rem] font-semibold",
                      RESPONSE_COLOR[resp ?? ""] ?? "text-[color:var(--color-muted)]",
                    )}>
                      {opt?.label ?? (resp === "na" ? "N/A" : "—")}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>

          {/* Overall score — large */}
          <div className="mt-20 border-t-2 border-[color:var(--color-navy)] pt-16 text-center">
            <p className="eyebrow mb-4">Overall Program Rating</p>
            <p className={cn("text-[clamp(5rem,4rem+5vw,9rem)] font-bold tabular-figures leading-none", SCORE_COLOR[riskLevel])}>
              {scores.overall_score ?? 0}
            </p>
            <p className={cn("mt-4 text-[1.125rem] font-semibold uppercase tracking-[0.06em]", SCORE_COLOR[riskLevel])}>
              {riskMeta.label}
            </p>
            <p className="mt-6 mx-auto max-w-lg text-[0.9375rem] leading-[1.65] text-[color:var(--color-body)]">
              {riskMeta.description}
            </p>
          </div>
        </div>
      </section>

      {/* ═══ Gap analysis ══════════════════════════════════════════ */}
      {gaps.length > 0 && (
        <section className="border-b border-[color:var(--color-border)]">
          <div className="mx-auto max-w-[960px] px-6 py-16 md:py-20">
            <p className="eyebrow">— Gap Analysis</p>
            <h2 className="mt-5 text-[clamp(1.75rem,1.25rem+2vw,2.75rem)] font-semibold tracking-[-0.012em] text-[color:var(--color-navy)]">
              Areas below full compliance.
            </h2>
            <p className="mt-3 text-[0.9375rem] text-[color:var(--color-muted)]">
              {gaps.length} {gaps.length === 1 ? "category" : "categories"} rated
              below Effective, sorted by severity.
            </p>

            <div className="mt-12 space-y-6">
              {gaps.map((gap) => {
                const opt = RESPONSE_OPTIONS.find((o) => o.value === gap.response);
                const rec = recommendations[gap.category.id];
                const borderClass = GAP_BORDER[gap.response] ?? "border-l-[color:var(--color-navy)]";
                return (
                  <article
                    key={gap.category.id}
                    className={cn("border border-[color:var(--color-border)] border-l-[3px] rounded-sm p-6 md:p-8", borderClass)}
                  >
                    <div className="flex items-baseline justify-between gap-4 mb-3">
                      <p className={cn(
                        "text-[0.6875rem] font-semibold uppercase tracking-[0.1em]",
                        gap.response === "not_compliant" ? "text-[#DC2626]" : gap.response === "partial" ? "text-[#D97706]" : "text-[color:var(--color-blue)]",
                      )}>
                        {gap.category.weight === 3 ? "Critical" : "Important"} · {opt?.label ?? gap.response}
                      </p>
                    </div>
                    <h3 className="text-[1.125rem] font-semibold text-[color:var(--color-navy)]">
                      {gap.category.title}
                    </h3>
                    <p className="mt-1 text-[0.75rem] text-[color:var(--color-muted)]">
                      {gap.category.statuteRef}
                    </p>
                    {rec && (
                      <div className="mt-4 pt-4 border-t border-[color:var(--color-border)]">
                        <p className="eyebrow mb-2">Remediation</p>
                        <p className="text-[0.875rem] leading-[1.65] text-[color:var(--color-body)]">
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

      {/* ═══ CTA — the conversion moment ═══════════════════════════ */}
      <section className="bg-[color:var(--color-navy)] text-white">
        <div className="mx-auto max-w-[960px] px-6 py-20 md:py-28">
          <div className="grid gap-10 md:grid-cols-12 md:gap-14 md:items-end">
            <div className="md:col-span-7">
              <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-[color:var(--color-blue-light)]">
                — Next Steps
              </p>
              <h2 className="mt-5 text-[clamp(2rem,1.5rem+2vw,3rem)] font-bold text-white">
                Close the gaps.
              </h2>
              <p className="mt-4 text-[color:var(--color-blue-light)] leading-[1.65] max-w-md">
                Your report identifies what needs to change. A thirty-minute
                consultation with a Kestralis principal is the fastest path
                to a remediation plan.
              </p>
            </div>
            <div className="md:col-span-5 md:border-l md:border-white/15 md:pl-10 flex flex-col gap-4">
              <a
                href={CONSULTATION_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-ghost-light text-base py-4"
              >
                Schedule a Consultation →
              </a>
              <Link
                href="/assessment/new"
                className="text-center text-[0.8125rem] font-medium text-white/60 hover:text-white transition-colors"
              >
                Start another assessment
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ Footer ═════════════════════════════════════════════════ */}
      <footer className="bg-[color:var(--color-ink)] text-white/60">
        <div className="mx-auto max-w-[960px] px-6 py-8">
          <div className="flex flex-col items-center gap-4 md:flex-row md:justify-between">
            <BrandLogo variant="onDark" height={20} asLink={false} />
            <span className="text-[0.75rem]">readystate.now</span>
          </div>
          <p className="mt-6 text-center text-[0.75rem] text-white/40">
            A product of Kestralis Group, LLC · California, 2026. Not legal advice.
          </p>
        </div>
      </footer>
    </div>
  );
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

function NoScoresYet({ assessmentId }: { assessmentId: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-6">
      <div className="max-w-md space-y-5 text-center">
        <p className="eyebrow">Pending</p>
        <h1 className="text-[clamp(2rem,1.5rem+2vw,3rem)] font-bold text-[color:var(--color-navy)]">
          Not yet scored.
        </h1>
        <p className="text-[0.875rem] leading-[1.65] text-[color:var(--color-muted)]">
          Finish and submit the assessment to generate the report.
        </p>
        <div className="flex justify-center pt-4">
          <Link href={`/assessment/new?id=${assessmentId}`} className="btn btn-primary">
            Resume Assessment →
          </Link>
        </div>
      </div>
    </div>
  );
}
