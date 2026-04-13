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
      {/* ─── Category summary ───────────────────────────────────── */}
      <div className="space-y-0">
        {CATEGORIES.map((cat, idx) => {
          const resp = responses[cat.id];
          const selected = resp?.response ?? null;
          const option = selected
            ? RESPONSE_OPTIONS.find((o) => o.value === selected)
            : null;

          return (
            <div
              key={cat.id}
              className="grid grid-cols-12 gap-4 border-t border-ink/30 py-8 md:gap-10 md:py-10"
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
                {cat.weight === 3 && (
                  <p className="mt-1 font-display text-[12px] italic text-risk-red">
                    Critical
                  </p>
                )}
              </div>
              <div className="col-span-4 md:col-span-5 md:text-right">
                {option ? (
                  <p
                    className={cn(
                      "font-display text-[18px] italic md:text-[22px]",
                      selected === "effective"
                        ? "text-forest"
                        : selected === "implemented"
                          ? "text-forest-soft"
                          : selected === "partial"
                            ? "text-sand-deep"
                            : selected === "not_compliant"
                              ? "text-risk-red"
                              : "text-warm-muted",
                    )}
                  >
                    {option.label}
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={() => onJumpToCategory(cat.id)}
                    className="link-editorial font-display text-[14px] italic text-warm-muted hover:text-ink"
                  >
                    Not evaluated →
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ─── Unanswered critical ─────────────────────────────────── */}
      {unansweredCritical.length > 0 && (
        <div className="border-t border-risk-red/50 bg-risk-red-soft px-8 py-10 md:px-12">
          <p className="eyebrow mb-3 text-risk-red">
            {unansweredCritical.length} critical{" "}
            {unansweredCritical.length === 1 ? "category" : "categories"}{" "}
            unanswered
          </p>
          <p className="mb-6 text-[14px] text-risk-red/80">
            Critical categories must be evaluated before submission.
          </p>
          <ul className="space-y-3">
            {unansweredCritical.map((cat) => (
              <li
                key={cat.id}
                className="flex items-baseline justify-between gap-4 border-b border-risk-red/20 pb-3"
              >
                <span className="text-[15px] text-ink">{cat.title}</span>
                <button
                  type="button"
                  onClick={() => onJumpToCategory(cat.id)}
                  className="link-editorial shrink-0 font-display text-[13px] italic text-risk-red"
                >
                  Evaluate →
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ─── Submit ──────────────────────────────────────────────── */}
      <div className="border-t border-ink pt-10 text-center">
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
          After submitting, you&rsquo;ll be asked where to send the PDF
          report.
        </p>
      </div>
    </div>
  );
}
