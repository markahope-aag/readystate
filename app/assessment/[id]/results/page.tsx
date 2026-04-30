import Link from "next/link";
import { notFound } from "next/navigation";
import { createServiceRoleClient } from "@/lib/supabase/server";
import {
  detectModel,
  getActiveSections,
  getLegacyCategoryById,
  isSectionNotesId,
  RESPONSE_OPTIONS_V3,
  type LegacyCategory,
  type Question,
  type ResponseValue,
  type Section,
} from "@/lib/assessment/questions";
import {
  computeScores,
  computeScoresLegacy,
  getRiskLabel,
  type RiskLevel,
} from "@/lib/assessment/scoring";
import {
  recommendations,
  sectionRecommendations,
} from "@/lib/assessment/recommendations";
import { BrandLogo } from "@/components/brand-logo";
import { DownloadReportButton } from "@/components/download-report-button";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

interface V3Gap {
  question: Question;
  section: Section;
  response: ResponseValue;
}

interface LegacyGap {
  category: LegacyCategory;
  response: string;
}

const CONSULTATION_URL = "https://kestralisgroup.com/contact/consultation";

/** Score color by risk band */
const SCORE_COLOR: Record<RiskLevel, string> = {
  critical: "text-[#DC2626]",
  high: "text-[#D97706]",
  moderate: "text-[color:var(--color-blue)]",
  low: "text-[#16A34A]",
};

/** Border color for v3 gap card severity */
const V3_GAP_BORDER: Record<ResponseValue, string> = {
  no: "border-l-[#DC2626]",
  partial: "border-l-[#D97706]",
  yes: "border-l-[color:var(--color-navy)]",
  na: "border-l-[color:var(--color-muted)]",
};

/** Border color for legacy v2 gap card severity */
const V2_GAP_BORDER: Record<string, string> = {
  not_compliant: "border-l-[#DC2626]",
  partial: "border-l-[#D97706]",
  implemented: "border-l-[color:var(--color-navy)]",
};

const V2_RESPONSE_LABEL: Record<string, string> = {
  effective: "Effective",
  implemented: "Implemented",
  partial: "Partial",
  not_compliant: "Not Compliant",
  na: "N/A",
};

const V2_RESPONSE_COLOR: Record<string, string> = {
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

  const { data: responseRows } = await supabase
    .from("assessment_responses")
    .select("question_id, response, notes")
    .eq("assessment_id", id);

  const rows = (responseRows ?? []) as Array<{
    question_id: string;
    response: string;
    notes: string | null;
  }>;
  const realRows = rows.filter((r) => !isSectionNotesId(r.question_id));
  const model = detectModel(realRows.map((r) => r.question_id));

  const riskLevel = (scores.risk_level ?? "critical") as RiskLevel;
  const overallScore = scores.overall_score ?? 0;
  const org = assessment.organizations as unknown as {
    id: string;
    name: string;
    industry: string | null;
    employee_count: number | null;
    california_locations: number | null;
  } | null;
  const assessedAt = assessment.updated_at ?? assessment.created_at;
  const riskMeta = getRiskLabel(riskLevel);

  return (
    <div className="min-h-screen bg-white">
      {/* ═══ Nav ═══════════════════════════════════════════════════════ */}
      <header className="sticky top-0 z-20 border-b border-[color:var(--color-border)] bg-white">
        <div className="mx-auto flex h-16 max-w-[960px] items-center justify-between px-6">
          <BrandLogo variant="onLight" height={24} />
          <span className="hidden text-[0.6875rem] font-medium uppercase tracking-[0.1em] text-[color:var(--color-muted)] md:block">
            <a
              href="https://kestralisgroup.com"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-[color:var(--color-navy)]"
            >
              A Kestralis product
            </a>
          </span>
        </div>
      </header>

      {/* ═══ Masthead ═══════════════════════════════════════════════ */}
      <section className="border-b border-[color:var(--color-border)]">
        <div className="mx-auto max-w-[960px] px-6 pb-14 pt-14 md:pb-16 md:pt-20">
          <div className="mb-10 flex flex-wrap items-baseline justify-between gap-4">
            <div className="flex items-baseline gap-6">
              <span className="eyebrow">SB 553 Assessment</span>
              <span className="hidden text-[0.6875rem] text-[color:var(--color-muted)] md:inline">
                {formatDate(assessedAt)}
              </span>
            </div>
            <DownloadReportButton assessmentId={id} />
          </div>

          <div className="grid gap-10 md:grid-cols-12 md:items-end md:gap-8">
            <div className="md:col-span-8">
              <h1 className="text-[clamp(2.5rem,2rem+2.5vw,4rem)] font-bold leading-[1.06] tracking-[-0.02em] text-[color:var(--color-navy)]">
                {org?.name ?? "Unknown"}
              </h1>
              <p className="mt-3 text-[1.0625rem] text-[color:var(--color-muted)]">
                {assessment.site_name ?? "—"}
                {assessment.site_address && (
                  <span> · {assessment.site_address}</span>
                )}
              </p>
            </div>
            <div className="md:col-span-4">
              <div className="rounded-sm border-2 border-[color:var(--color-navy)] p-6">
                <p className="eyebrow mb-2">Overall Score</p>
                <p
                  className={cn(
                    "text-[4rem] font-bold tabular-figures leading-none",
                    SCORE_COLOR[riskLevel],
                  )}
                >
                  {overallScore}
                </p>
                <p
                  className={cn(
                    "mt-2 text-[0.875rem] font-semibold uppercase tracking-[0.06em]",
                    SCORE_COLOR[riskLevel],
                  )}
                >
                  {riskMeta.label}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {model === "v2" ? (
        <LegacyBody rows={realRows} riskLevel={riskLevel} score={overallScore} />
      ) : (
        <V3Body
          rows={rows}
          riskLevel={riskLevel}
          score={overallScore}
        />
      )}

      {/* ═══ CTA ═══════════════════════════════════════════════════ */}
      <section className="bg-[color:var(--color-navy)] text-white">
        <div className="mx-auto max-w-[960px] px-6 py-20 md:py-28">
          <div className="grid gap-10 md:grid-cols-12 md:items-end md:gap-14">
            <div className="md:col-span-7">
              <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-[color:var(--color-blue-light)]">
                — Next Steps
              </p>
              <h2 className="mt-5 text-[clamp(2rem,1.5rem+2vw,3rem)] font-bold text-white">
                Close the gaps.
              </h2>
              <p className="mt-4 max-w-md leading-[1.65] text-[color:var(--color-blue-light)]">
                Your report identifies what needs to change. A thirty-minute
                consultation with a Kestralis principal is the fastest path
                to a remediation plan.
              </p>
            </div>
            <div className="flex flex-col gap-4 md:col-span-5 md:border-l md:border-white/15 md:pl-10">
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
                className="text-center text-[0.8125rem] font-medium text-white/60 transition-colors hover:text-white"
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
            A product of{" "}
            <a
              href="https://kestralisgroup.com"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 transition-colors hover:text-white/60"
            >
              Kestralis Group, LLC
            </a>{" "}
            · California, 2026. Not legal advice.
          </p>
        </div>
      </footer>
    </div>
  );
}

// ─── v3 results body ─────────────────────────────────────────────────────────

function V3Body({
  rows,
  riskLevel,
  score,
}: {
  rows: Array<{ question_id: string; response: string; notes: string | null }>;
  riskLevel: RiskLevel;
  score: number;
}) {
  const meta = getRiskLabel(riskLevel);

  const result = computeScores(
    rows
      .filter((r) => !isSectionNotesId(r.question_id))
      .map((r) => ({ question_id: r.question_id, response: r.response })),
  );

  const sectionNotes: Record<string, string> = {};
  for (const r of rows) {
    if (isSectionNotesId(r.question_id) && r.notes) {
      sectionNotes[r.question_id.replace(/^notes_/, "")] = r.notes;
    }
  }

  const responseMap = new Map<string, ResponseValue>();
  for (const r of rows) {
    if (isSectionNotesId(r.question_id)) continue;
    if (
      r.response === "yes" ||
      r.response === "no" ||
      r.response === "partial" ||
      r.response === "na"
    ) {
      responseMap.set(r.question_id, r.response);
    }
  }

  const gaps: V3Gap[] = [];
  for (const section of getActiveSections()) {
    for (const q of section.questions) {
      if (q.deprecated) continue;
      const r = responseMap.get(q.id);
      if (!r || r === "yes" || r === "na") continue;
      gaps.push({ question: q, section, response: r });
    }
  }
  gaps.sort((a, b) => {
    if (b.question.weight !== a.question.weight)
      return b.question.weight - a.question.weight;
    const sev: Record<string, number> = { no: 2, partial: 1 };
    return (sev[b.response] ?? 0) - (sev[a.response] ?? 0);
  });

  return (
    <>
      {/* ═══ Section scorecard ═════════════════════════════════════ */}
      <section className="border-b border-[color:var(--color-border)]">
        <div className="mx-auto max-w-[960px] px-6 py-16 md:py-20">
          <p className="eyebrow">— Scorecard</p>
          <h2 className="mt-5 text-[clamp(1.75rem,1.25rem+2vw,2.75rem)] font-semibold tracking-[-0.012em] text-[color:var(--color-navy)]">
            Section results.
          </h2>

          <ol className="mt-12 border-t-2 border-[color:var(--color-navy)]">
            {result.sectionScores.map((s, idx) => {
              const note = sectionNotes[s.sectionId];
              const tone =
                s.score === null
                  ? "text-[color:var(--color-muted)]"
                  : s.score >= 80
                    ? "text-[#16A34A]"
                    : s.score >= 60
                      ? "text-[color:var(--color-blue)]"
                      : s.score >= 40
                        ? "text-[#D97706]"
                        : "text-[#DC2626]";
              return (
                <li
                  key={s.sectionId}
                  className="grid grid-cols-12 gap-4 border-b border-[color:var(--color-border)] py-6 md:gap-8 md:py-8"
                >
                  <div className="col-span-1">
                    <span className="tabular-figures text-[1.25rem] font-bold leading-none text-[color:var(--color-blue-light)]">
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <div className="col-span-7 md:col-span-7">
                    <h3 className="text-[1.125rem] font-semibold text-[color:var(--color-navy)]">
                      {s.title}
                    </h3>
                    <p className="mt-1 text-[0.6875rem] uppercase tracking-[0.08em] text-[color:var(--color-muted)]">
                      {s.answeredCount} of {s.totalQuestions} answered
                    </p>
                    {note && (
                      <p className="mt-3 max-w-md border-l-2 border-[color:var(--color-blue-light)] pl-3 text-[0.8125rem] italic leading-[1.5] text-[color:var(--color-muted)]">
                        “{note}”
                      </p>
                    )}
                  </div>
                  <div className="col-span-4 text-right">
                    {s.score === null ? (
                      <p className="text-[1.5rem] font-semibold text-[color:var(--color-muted)]">
                        —
                      </p>
                    ) : (
                      <p
                        className={cn(
                          "text-[clamp(2rem,1.5rem+1vw,2.75rem)] font-bold tabular-figures leading-none",
                          tone,
                        )}
                      >
                        {s.score}
                      </p>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>

          {/* Overall score — large */}
          <div className="mt-20 border-t-2 border-[color:var(--color-navy)] pt-16 text-center">
            <p className="eyebrow mb-4">Overall Program Rating</p>
            <p
              className={cn(
                "text-[clamp(5rem,4rem+5vw,9rem)] font-bold tabular-figures leading-none",
                SCORE_COLOR[riskLevel],
              )}
            >
              {score}
            </p>
            <p
              className={cn(
                "mt-4 text-[1.125rem] font-semibold uppercase tracking-[0.06em]",
                SCORE_COLOR[riskLevel],
              )}
            >
              {meta.label}
            </p>
            <p className="mx-auto mt-6 max-w-lg text-[0.9375rem] leading-[1.65] text-[color:var(--color-body)]">
              {meta.description}
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
              Where to focus.
            </h2>
            <p className="mt-3 text-[0.9375rem] text-[color:var(--color-muted)]">
              {gaps.length} {gaps.length === 1 ? "question" : "questions"}{" "}
              rated below Yes, sorted by severity.
            </p>

            <div className="mt-12 space-y-6">
              {gaps.map((gap) => {
                const opt = RESPONSE_OPTIONS_V3[gap.response];
                const rec =
                  recommendations[gap.question.id] ??
                  sectionRecommendations[gap.section.id];
                const borderClass =
                  V3_GAP_BORDER[gap.response] ??
                  "border-l-[color:var(--color-navy)]";
                const isCritical = gap.question.weight === 3;
                return (
                  <article
                    key={gap.question.id}
                    className={cn(
                      "rounded-sm border border-[color:var(--color-border)] border-l-[3px] p-6 md:p-8",
                      borderClass,
                    )}
                  >
                    <p
                      className={cn(
                        "mb-3 text-[0.6875rem] font-semibold uppercase tracking-[0.1em]",
                        gap.response === "no"
                          ? "text-[#DC2626]"
                          : gap.response === "partial"
                            ? "text-[#D97706]"
                            : "text-[color:var(--color-blue)]",
                      )}
                    >
                      {gap.section.title} ·{" "}
                      {isCritical ? "Critical" : "Important"} · {opt.label}
                    </p>
                    <h3 className="text-[1.0625rem] font-semibold leading-[1.3] text-[color:var(--color-navy)]">
                      {gap.question.prompt}
                    </h3>
                    {gap.question.statuteRef && (
                      <p className="mt-1 text-[0.75rem] text-[color:var(--color-muted)]">
                        {gap.question.statuteRef}
                      </p>
                    )}
                    {rec && (
                      <div className="mt-4 border-t border-[color:var(--color-border)] pt-4">
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
    </>
  );
}

// ─── Legacy v2 results body (read-only) ──────────────────────────────────────

function LegacyBody({
  rows,
  riskLevel,
  score,
}: {
  rows: Array<{ question_id: string; response: string }>;
  riskLevel: RiskLevel;
  score: number;
}) {
  const meta = getRiskLabel(riskLevel);
  const result = computeScoresLegacy(rows);

  const responseMap = new Map<string, string>();
  const gaps: LegacyGap[] = [];
  for (const r of rows) {
    responseMap.set(r.question_id, r.response);
    if (r.response === "effective" || r.response === "na") continue;
    const cat = getLegacyCategoryById(r.question_id);
    if (!cat) continue;
    gaps.push({ category: cat, response: r.response });
  }
  gaps.sort((a, b) => {
    if (b.category.weight !== a.category.weight)
      return b.category.weight - a.category.weight;
    const sev: Record<string, number> = {
      not_compliant: 3,
      partial: 2,
      implemented: 1,
    };
    return (sev[b.response] ?? 0) - (sev[a.response] ?? 0);
  });

  return (
    <>
      <section className="border-b border-[color:var(--color-border)]">
        <div className="mx-auto max-w-[960px] px-6 py-16 md:py-20">
          <p className="eyebrow">— Scorecard · v2 (legacy)</p>
          <h2 className="mt-5 text-[clamp(1.75rem,1.25rem+2vw,2.75rem)] font-semibold tracking-[-0.012em] text-[color:var(--color-navy)]">
            Category results.
          </h2>

          <ol className="mt-12 border-t-2 border-[color:var(--color-navy)]">
            {result.categoryScores.map((c, idx) => {
              const responseLabel = c.response
                ? V2_RESPONSE_LABEL[c.response] ?? c.response
                : "—";
              const colorClass = c.response
                ? V2_RESPONSE_COLOR[c.response] ?? "text-[color:var(--color-muted)]"
                : "text-[color:var(--color-muted)]";
              return (
                <li
                  key={c.categoryId}
                  className="grid grid-cols-12 gap-4 border-b border-[color:var(--color-border)] py-5 md:gap-8 md:py-6"
                >
                  <div className="col-span-1">
                    <span className="tabular-figures text-[1.25rem] font-bold leading-none text-[color:var(--color-blue-light)]">
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <div className="col-span-7 md:col-span-6">
                    <h3 className="text-[0.9375rem] font-semibold text-[color:var(--color-navy)]">
                      {c.title}
                    </h3>
                  </div>
                  <div className="col-span-4 md:col-span-5 md:text-right">
                    <p className={cn("text-[1.0625rem] font-semibold", colorClass)}>
                      {responseLabel}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>

          <div className="mt-20 border-t-2 border-[color:var(--color-navy)] pt-16 text-center">
            <p className="eyebrow mb-4">Overall Program Rating</p>
            <p
              className={cn(
                "text-[clamp(5rem,4rem+5vw,9rem)] font-bold tabular-figures leading-none",
                SCORE_COLOR[riskLevel],
              )}
            >
              {score}
            </p>
            <p
              className={cn(
                "mt-4 text-[1.125rem] font-semibold uppercase tracking-[0.06em]",
                SCORE_COLOR[riskLevel],
              )}
            >
              {meta.label}
            </p>
            <p className="mx-auto mt-6 max-w-lg text-[0.9375rem] leading-[1.65] text-[color:var(--color-body)]">
              {meta.description}
            </p>
          </div>
        </div>
      </section>

      {gaps.length > 0 && (
        <section className="border-b border-[color:var(--color-border)]">
          <div className="mx-auto max-w-[960px] px-6 py-16 md:py-20">
            <p className="eyebrow">— Gap Analysis</p>
            <h2 className="mt-5 text-[clamp(1.75rem,1.25rem+2vw,2.75rem)] font-semibold tracking-[-0.012em] text-[color:var(--color-navy)]">
              Areas below full compliance.
            </h2>

            <div className="mt-12 space-y-6">
              {gaps.map((gap) => {
                const borderClass =
                  V2_GAP_BORDER[gap.response] ??
                  "border-l-[color:var(--color-navy)]";
                return (
                  <article
                    key={gap.category.id}
                    className={cn(
                      "rounded-sm border border-[color:var(--color-border)] border-l-[3px] p-6 md:p-8",
                      borderClass,
                    )}
                  >
                    <p
                      className={cn(
                        "mb-3 text-[0.6875rem] font-semibold uppercase tracking-[0.1em]",
                        gap.response === "not_compliant"
                          ? "text-[#DC2626]"
                          : gap.response === "partial"
                            ? "text-[#D97706]"
                            : "text-[color:var(--color-blue)]",
                      )}
                    >
                      {gap.category.weight === 3 ? "Critical" : "Important"} ·{" "}
                      {V2_RESPONSE_LABEL[gap.response] ?? gap.response}
                    </p>
                    <h3 className="text-[1.125rem] font-semibold text-[color:var(--color-navy)]">
                      {gap.category.title}
                    </h3>
                    <p className="mt-1 text-[0.75rem] text-[color:var(--color-muted)]">
                      {gap.category.statuteRef}
                    </p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>
      )}
    </>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
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
