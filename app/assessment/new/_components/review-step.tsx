"use client";

import { useMemo, useState } from "react";
import {
  getActiveSections,
  type ResponseValue,
  type Section,
} from "@/lib/assessment/questions";
import { cn } from "@/lib/utils";

interface Props {
  answers: Record<string, { response: ResponseValue | null } | undefined>;
  notes: Record<Section["id"], string>;
  criticalQuestionIds: string[];
  onJumpToSection: (sectionId: Section["id"]) => void;
  onSubmit: () => Promise<void>;
}

const SECTIONS = getActiveSections();

function summariseSection(
  section: Section,
  answers: Props["answers"],
): {
  total: number;
  yes: number;
  no: number;
  partial: number;
  na: number;
  unanswered: number;
} {
  let yes = 0;
  let no = 0;
  let partial = 0;
  let na = 0;
  let unanswered = 0;
  let total = 0;
  for (const q of section.questions) {
    if (q.deprecated) continue;
    total++;
    const r = answers[q.id]?.response;
    if (!r) unanswered++;
    else if (r === "yes") yes++;
    else if (r === "no") no++;
    else if (r === "partial") partial++;
    else if (r === "na") na++;
  }
  return { total, yes, no, partial, na, unanswered };
}

export function ReviewStep({
  answers,
  notes,
  criticalQuestionIds,
  onJumpToSection,
  onSubmit,
}: Props) {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const unansweredCritical = useMemo(() => {
    const out: { questionId: string; sectionId: Section["id"] }[] = [];
    for (const s of SECTIONS) {
      for (const q of s.questions) {
        if (q.deprecated) continue;
        if (!criticalQuestionIds.includes(q.id)) continue;
        if (!answers[q.id]?.response) {
          out.push({ questionId: q.id, sectionId: s.id });
        }
      }
    }
    return out;
  }, [answers, criticalQuestionIds]);

  const canSubmit = unansweredCritical.length === 0 && !submitted;

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await onSubmit();
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="border-t-2 border-[color:var(--color-navy)] py-20 text-center">
        <p className="eyebrow mb-4">Submitted</p>
        <h2 className="text-[clamp(2rem,1.5rem+2vw,3rem)] font-bold text-[color:var(--color-navy)]">
          Assessment complete.
        </h2>
        <p className="mt-6 text-[0.9375rem] text-[color:var(--color-muted)]">
          Preparing your report…
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-16">
      {/* ─── Section summary ───────────────────────────────────── */}
      <ol className="border-t-2 border-[color:var(--color-navy)]">
        {SECTIONS.map((section, idx) => {
          const summary = summariseSection(section, answers);
          const sectionNote = notes[section.id];
          return (
            <li
              key={section.id}
              className="grid grid-cols-12 gap-4 border-b border-[color:var(--color-border)] py-7 md:gap-10 md:py-8"
            >
              <div className="col-span-1">
                <span className="text-[1.5rem] font-bold leading-none text-[color:var(--color-blue-light)] tabular-figures">
                  {String(idx + 1).padStart(2, "0")}
                </span>
              </div>
              <div className="col-span-7 md:col-span-6">
                <h3 className="text-[1.125rem] font-semibold leading-[1.2] text-[color:var(--color-navy)]">
                  {section.title}
                </h3>
                <p className="mt-1 text-[0.6875rem] uppercase tracking-[0.08em] text-[color:var(--color-muted)]">
                  {section.eyebrow}
                </p>
                {sectionNote && (
                  <p className="mt-3 max-w-md border-l-2 border-[color:var(--color-blue-light)] pl-3 text-[0.8125rem] italic leading-[1.5] text-[color:var(--color-muted)]">
                    “{truncate(sectionNote, 180)}”
                  </p>
                )}
              </div>
              <div className="col-span-4 md:col-span-5 md:text-right">
                <p className="tabular-figures text-[0.8125rem] font-medium text-[color:var(--color-navy)]">
                  {summary.total - summary.unanswered}
                  <span className="text-[color:var(--color-muted)]">
                    {" / "}
                    {summary.total}
                  </span>{" "}
                  answered
                </p>
                <div className="mt-2 flex flex-wrap justify-start gap-1.5 md:justify-end">
                  <Pill label="Yes" count={summary.yes} tone="navy" />
                  {summary.partial > 0 && (
                    <Pill label="Partial" count={summary.partial} tone="amber" />
                  )}
                  <Pill label="No" count={summary.no} tone="red" />
                  {summary.na > 0 && (
                    <Pill label="N/A" count={summary.na} tone="muted" />
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => onJumpToSection(section.id)}
                  className="mt-2 text-[0.75rem] font-medium text-[color:var(--color-blue)] underline underline-offset-2 transition-colors hover:text-[color:var(--color-navy)]"
                >
                  Edit section →
                </button>
              </div>
            </li>
          );
        })}
      </ol>

      {/* ─── Unanswered critical ─────────────────────────────────── */}
      {unansweredCritical.length > 0 && (
        <div className="rounded-sm border border-[#DC2626]/30 bg-[#FEE2E2] px-8 py-8">
          <p className="mb-3 text-[0.6875rem] font-semibold uppercase tracking-[0.1em] text-[#DC2626]">
            {unansweredCritical.length} critical{" "}
            {unansweredCritical.length === 1 ? "question" : "questions"}{" "}
            unanswered
          </p>
          <p className="mb-6 text-[0.875rem] text-[#DC2626]/80">
            Critical questions must be answered before submission.
          </p>
          <ul className="space-y-3">
            {unansweredCritical.map(({ questionId, sectionId }) => {
              const section = SECTIONS.find((s) => s.id === sectionId);
              const q = section?.questions.find((q) => q.id === questionId);
              if (!section || !q) return null;
              return (
                <li
                  key={questionId}
                  className="flex items-baseline justify-between gap-4 border-b border-[#DC2626]/20 pb-3"
                >
                  <span className="text-[0.875rem] text-[color:var(--color-body)]">
                    <span className="font-semibold text-[color:var(--color-navy)]">
                      {section.title}
                      {" — "}
                    </span>
                    {q.prompt}
                  </span>
                  <button
                    type="button"
                    onClick={() => onJumpToSection(sectionId)}
                    className="shrink-0 text-[0.8125rem] font-medium text-[#DC2626] hover:underline"
                  >
                    Answer →
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* ─── Submit ──────────────────────────────────────────────── */}
      <div className="border-t-2 border-[color:var(--color-navy)] pt-10 text-center">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!canSubmit || submitting}
          className="btn btn-primary text-base px-12 py-4 disabled:opacity-40 disabled:pointer-events-none"
        >
          {submitting ? "Submitting…" : "Submit Assessment →"}
        </button>
        <p className="mt-6 text-[0.8125rem] text-[color:var(--color-muted)]">
          After submitting, you&rsquo;ll be asked where to send the PDF report.
        </p>
      </div>
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function truncate(s: string, n: number): string {
  if (s.length <= n) return s;
  return s.slice(0, n).trimEnd() + "…";
}

type PillTone = "navy" | "red" | "amber" | "muted";

function Pill({
  label,
  count,
  tone,
}: {
  label: string;
  count: number;
  tone: PillTone;
}) {
  if (count === 0) return null;
  const cls =
    tone === "navy"
      ? "border-[color:var(--color-navy)] text-[color:var(--color-navy)]"
      : tone === "red"
        ? "border-[#DC2626] text-[#DC2626]"
        : tone === "amber"
          ? "border-[#D97706] text-[#D97706]"
          : "border-[color:var(--color-muted)] text-[color:var(--color-muted)]";
  return (
    <span
      className={cn(
        "inline-flex items-baseline gap-1 border px-2 py-0.5 text-[0.6875rem] font-semibold tracking-[0.06em] tabular-figures",
        cls,
      )}
    >
      <span>{label}</span>
      <span>·</span>
      <span>{count}</span>
    </span>
  );
}
