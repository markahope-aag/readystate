"use client";

import { useMemo, useState } from "react";
import {
  getCriticalQuestions,
  questions,
  sectionMeta,
} from "@/lib/assessment/questions";
import { cn } from "@/lib/utils";
import type { ResponseValue } from "../actions";

interface Props {
  responses: Record<
    string,
    { response: ResponseValue | null; notes: string }
  >;
  onJumpToQuestion: (questionId: string) => void;
  onSubmit: () => Promise<void>;
}

export function ReviewStep({ responses, onJumpToQuestion, onSubmit }: Props) {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const unansweredCritical = useMemo(
    () => getCriticalQuestions().filter((q) => !responses[q.id]?.response),
    [responses],
  );

  const sectionSummaries = useMemo(() => {
    return (["sb553", "asis", "hazard"] as const).map((section) => {
      const sectionQs = questions.filter(
        (q) => q.section === section && !q.deprecated,
      );
      const counts = { yes: 0, partial: 0, no: 0, na: 0, unanswered: 0 };
      for (const q of sectionQs) {
        const r = responses[q.id]?.response;
        if (!r) counts.unanswered++;
        else counts[r]++;
      }
      return { section, total: sectionQs.length, counts };
    });
  }, [responses]);

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
      <div className="border-t border-ink py-20 text-center">
        <p className="eyebrow mb-4">Submitted</p>
        <h2 className="font-display text-5xl font-light italic text-forest md:text-6xl">
          Assessment complete.
        </h2>
        <p className="mt-6 text-[15px] text-warm-muted">
          Preparing your report…
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-16">
      {/* ─── Section summaries — editorial scorecard ───────────────── */}
      <div className="space-y-0">
        {sectionSummaries.map(({ section, total, counts }, idx) => {
          const romans = ["I", "II", "III"];
          return (
            <div
              key={section}
              className={cn(
                "grid gap-6 border-t border-ink/30 py-10 md:grid-cols-12 md:gap-10 md:py-12",
                idx === 0 && "border-t",
              )}
            >
              <div className="md:col-span-4">
                <p className="font-display text-[13px] italic text-forest">
                  Section {romans[idx]}
                </p>
                <h3 className="mt-2 font-display text-[28px] font-light leading-[1.05] tracking-[-0.015em] text-ink md:text-[36px]">
                  {sectionMeta[section].label}
                </h3>
                <p className="mt-4 font-mono tabular-figures text-[12px] text-warm-muted">
                  {String(total - counts.unanswered).padStart(2, "0")}{" "}
                  <span className="text-warm-muted-soft">
                    / {String(total).padStart(2, "0")} answered
                  </span>
                </p>
              </div>

              <div className="md:col-span-8">
                <div className="grid grid-cols-5 gap-0 border-t border-ink/30">
                  <TypographicCount
                    label="Yes"
                    value={counts.yes}
                    accent="positive"
                  />
                  <TypographicCount
                    label="Partial"
                    value={counts.partial}
                    accent="neutral"
                  />
                  <TypographicCount
                    label="No"
                    value={counts.no}
                    accent="negative"
                  />
                  <TypographicCount
                    label="N/A"
                    value={counts.na}
                    accent="muted"
                  />
                  <TypographicCount
                    label="Skipped"
                    value={counts.unanswered}
                    accent={counts.unanswered > 0 ? "neutral" : "muted"}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ─── Unanswered critical errata ─────────────────────────────── */}
      {unansweredCritical.length > 0 && (
        <div className="border-t border-risk-red/50 bg-risk-red-soft px-8 py-10 md:px-12">
          <div className="grid gap-6 md:grid-cols-12 md:gap-10">
            <div className="md:col-span-4">
              <p className="eyebrow mb-3 text-risk-red">Errata</p>
              <h3 className="font-display text-[28px] font-light leading-[1] tracking-[-0.015em] text-risk-red md:text-[32px]">
                <span className="italic">
                  {unansweredCritical.length}
                </span>{" "}
                critical{" "}
                {unansweredCritical.length === 1
                  ? "question"
                  : "questions"}{" "}
                unanswered.
              </h3>
              <p className="mt-4 text-[14px] leading-[1.6] text-risk-red/80">
                These questions must be answered before the assessment
                can be submitted.
              </p>
            </div>
            <ul className="space-y-3 md:col-span-8">
              {unansweredCritical.map((q) => (
                <li
                  key={q.id}
                  className="flex items-baseline justify-between gap-4 border-b border-risk-red/20 pb-3"
                >
                  <span className="flex-1 text-[15px] leading-snug text-ink">
                    <span className="mr-2 font-mono text-[11px] text-risk-red/70">
                      {q.id}
                    </span>
                    {q.question}
                  </span>
                  <button
                    type="button"
                    onClick={() => onJumpToQuestion(q.id)}
                    className="link-editorial shrink-0 font-display text-[13px] italic text-risk-red"
                  >
                    Jump to question →
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* ─── Submit ─────────────────────────────────────────────────── */}
      <div className="border-t border-ink pt-10 text-center">
        <p className="eyebrow mb-6">Colophon</p>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!canSubmit || submitting}
          className={cn(
            "group inline-flex items-baseline gap-3 font-display text-[36px] font-light italic md:text-[56px]",
            canSubmit && !submitting
              ? "text-forest hover:text-forest-deep"
              : "cursor-not-allowed text-warm-muted-soft",
          )}
        >
          <span className="link-editorial">
            {submitting ? "Submitting…" : "Submit assessment"}
          </span>
          <span className="transition-transform duration-300 group-hover:translate-x-2">
            →
          </span>
        </button>
        <p className="mt-6 text-[13px] text-warm-muted">
          After submitting, you&apos;ll be asked where to send the PDF
          report.
        </p>
      </div>
    </div>
  );
}

function TypographicCount({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent: "positive" | "negative" | "neutral" | "muted";
}) {
  const tone =
    accent === "positive"
      ? "text-forest"
      : accent === "negative"
        ? "text-risk-red"
        : accent === "neutral"
          ? "text-ink"
          : "text-warm-muted-soft";
  return (
    <div className="border-r border-ink/20 py-6 pl-4 pr-4 text-center last:border-r-0 md:pl-6">
      <p
        className={cn(
          "font-display text-[40px] font-light leading-none tabular-figures md:text-[56px]",
          tone,
        )}
      >
        {value}
      </p>
      <p className="mt-2 font-display text-[11px] italic text-warm-muted">
        {label}
      </p>
    </div>
  );
}
