"use client";

import { useMemo, useState } from "react";
import {
  getActiveCategories,
  getCriticalCategories,
  RESPONSE_OPTIONS,
  type ResponseValue,
} from "@/lib/assessment/questions";
import { cn } from "@/lib/utils";

interface Props {
  responses: Record<
    string,
    { response: ResponseValue | null; notes: string }
  >;
  onJumpToCategory: (categoryId: string) => void;
  onSubmit: () => Promise<void>;
}

const CATEGORIES = getActiveCategories();

/** Color for response label in review summary */
const RESPONSE_COLOR: Record<string, string> = {
  effective: "text-[color:var(--color-navy)]",
  implemented: "text-[color:var(--color-blue)]",
  partial: "text-[#D97706]",
  not_compliant: "text-[#DC2626]",
  na: "text-[color:var(--color-muted)]",
};

export function ReviewStep({
  responses,
  onJumpToCategory,
  onSubmit,
}: Props) {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const unansweredCritical = useMemo(
    () =>
      getCriticalCategories().filter((c) => !responses[c.id]?.response),
    [responses],
  );

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
      {/* ─── Category summary ───────────────────────────────────── */}
      <ol className="border-t-2 border-[color:var(--color-navy)]">
        {CATEGORIES.map((cat, idx) => {
          const resp = responses[cat.id];
          const selected = resp?.response ?? null;
          const option = selected
            ? RESPONSE_OPTIONS.find((o) => o.value === selected)
            : null;

          return (
            <li
              key={cat.id}
              className="grid grid-cols-12 gap-4 border-b border-[color:var(--color-border)] py-6 md:gap-10 md:py-7"
            >
              <div className="col-span-1">
                <span className="text-[1.5rem] font-bold leading-none text-[color:var(--color-blue-light)] tabular-figures">
                  {String(idx + 1).padStart(2, "0")}
                </span>
              </div>
              <div className="col-span-7 md:col-span-6">
                <h3 className="text-[1.0625rem] font-semibold leading-[1.2] text-[color:var(--color-navy)]">
                  {cat.title}
                </h3>
                {cat.weight === 3 && (
                  <p className="mt-1 text-[0.6875rem] font-semibold uppercase tracking-[0.06em] text-[#DC2626]">
                    Critical
                  </p>
                )}
              </div>
              <div className="col-span-4 md:col-span-5 md:text-right">
                {option ? (
                  <p
                    className={cn(
                      "text-[1.0625rem] font-semibold",
                      RESPONSE_COLOR[selected!] ?? "text-[color:var(--color-muted)]",
                    )}
                  >
                    {option.label}
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={() => onJumpToCategory(cat.id)}
                    className="text-[0.8125rem] font-medium text-[color:var(--color-blue)] hover:text-[color:var(--color-navy)] underline underline-offset-2 transition-colors"
                  >
                    Not evaluated →
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ol>

      {/* ─── Unanswered critical ─────────────────────────────────── */}
      {unansweredCritical.length > 0 && (
        <div className="border border-[#DC2626]/30 bg-[#FEE2E2] rounded-sm px-8 py-8">
          <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.1em] text-[#DC2626] mb-3">
            {unansweredCritical.length} critical{" "}
            {unansweredCritical.length === 1 ? "category" : "categories"}{" "}
            unanswered
          </p>
          <p className="mb-6 text-[0.875rem] text-[#DC2626]/80">
            Critical categories must be evaluated before submission.
          </p>
          <ul className="space-y-3">
            {unansweredCritical.map((cat) => (
              <li
                key={cat.id}
                className="flex items-baseline justify-between gap-4 border-b border-[#DC2626]/20 pb-3"
              >
                <span className="text-[0.9375rem] text-[color:var(--color-body)]">{cat.title}</span>
                <button
                  type="button"
                  onClick={() => onJumpToCategory(cat.id)}
                  className="shrink-0 text-[0.8125rem] font-medium text-[#DC2626] hover:underline"
                >
                  Evaluate →
                </button>
              </li>
            ))}
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
