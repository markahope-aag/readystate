"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  RESPONSE_OPTIONS,
  type Category,
  type ResponseValue,
} from "@/lib/assessment/questions";

interface Props {
  category: Category;
  response: ResponseValue | null;
  notes: string;
  onResponseChange: (r: ResponseValue) => void;
  onNotesChange: (n: string) => void;
}

/** Color-coded background for selected compliance level */
const SELECTED_BG: Record<string, string> = {
  effective: "bg-[color:var(--color-navy)]",
  implemented: "bg-[color:var(--color-navy)]",
  partial: "bg-[#D97706]",
  not_compliant: "bg-[#DC2626]",
  na: "bg-[color:var(--color-muted)]",
};

export function CategoryStep({
  category,
  response,
  notes,
  onResponseChange,
  onNotesChange,
}: Props) {
  const [showNotes, setShowNotes] = useState(Boolean(notes));
  const [localNotes, setLocalNotes] = useState(notes);

  const isCritical = category.weight === 3;

  const commitNotes = () => {
    if (localNotes !== notes) onNotesChange(localNotes);
  };

  return (
    <div className="grid gap-12 md:grid-cols-12 md:gap-16">
      {/* ─── Left column — sub-requirements ─────────────────────── */}
      <div className="md:col-span-7">
        <div className="mb-6 flex items-baseline gap-3">
          <p className="eyebrow">Statutory requirements</p>
          {isCritical && (
            <span className="text-[0.75rem] font-semibold uppercase tracking-[0.06em] text-[#DC2626]">
              Critical
            </span>
          )}
        </div>

        <p className="mb-6 text-[0.875rem] leading-[1.65] text-[color:var(--color-muted)]">
          Consider each of the following when evaluating your
          program&rsquo;s compliance with this area. All sub-requirements
          should be met for a rating of &ldquo;Effective.&rdquo;
        </p>

        <ol className="space-y-0">
          {category.subRequirements.map((req, i) => (
            <li
              key={i}
              className="flex items-start gap-4 border-t border-[color:var(--color-border)] pt-4 pb-4 first:border-t-0 first:pt-0"
            >
              <span className="mt-0.5 tabular-figures text-[0.6875rem] font-medium tracking-[0.08em] text-[color:var(--color-blue)]">
                {String(i + 1).padStart(2, "0")}
              </span>
              <p className="flex-1 text-[0.9375rem] leading-[1.55] text-[color:var(--color-body)]">
                {req}
              </p>
            </li>
          ))}
        </ol>

        {/* Optional notes */}
        {response && (
          <div className="mt-8 border-t border-[color:var(--color-border)] pt-6">
            {!showNotes ? (
              <button
                type="button"
                onClick={() => setShowNotes(true)}
                className="text-[0.8125rem] font-medium text-[color:var(--color-blue)] hover:text-[color:var(--color-navy)] underline underline-offset-2 transition-colors"
              >
                + Add evidence or context notes
              </button>
            ) : (
              <div className="space-y-2">
                <p className="form-label">Evidence · optional</p>
                <textarea
                  value={localNotes}
                  onChange={(e) => setLocalNotes(e.target.value)}
                  onBlur={commitNotes}
                  placeholder="Policy document name, link, relevant evidence, or notes on gaps…"
                  rows={3}
                  className="form-input min-h-[100px] resize-y placeholder:italic"
                />
                <button
                  type="button"
                  onClick={() => {
                    commitNotes();
                    if (!localNotes.trim()) setShowNotes(false);
                  }}
                  className="text-[0.75rem] font-medium text-[color:var(--color-muted)] hover:text-[color:var(--color-navy)]"
                >
                  {localNotes.trim() ? "Save notes" : "Hide"}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ─── Right column — compliance selector ─────────────────── */}
      <div className="md:col-span-5">
        <p className="eyebrow mb-6">Your evaluation</p>

        <div className="border border-[color:var(--color-border)] rounded-sm overflow-hidden">
          {RESPONSE_OPTIONS.map((opt) => {
            const selected = response === opt.value;
            const bg = selected ? SELECTED_BG[opt.value] ?? "bg-[color:var(--color-navy)]" : "";
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => onResponseChange(opt.value)}
                className={cn(
                  "group w-full border-t border-[color:var(--color-border)] px-5 py-5 text-left transition-all first:border-t-0",
                  selected ? `${bg} text-white` : "bg-white hover:bg-[color:var(--color-gray-light)]",
                )}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p
                      className={cn(
                        "text-[1.0625rem] font-semibold",
                        selected ? "text-white" : "text-[color:var(--color-navy)]",
                      )}
                    >
                      {opt.label}
                    </p>
                    <p
                      className={cn(
                        "mt-1 text-[0.75rem] leading-[1.5]",
                        selected ? "text-white/70" : "text-[color:var(--color-muted)]",
                      )}
                    >
                      {opt.description}
                    </p>
                  </div>
                  {selected && (
                    <span className="mt-0.5 shrink-0 text-[1.125rem] text-white font-bold">
                      ✓
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Visual weight indicator */}
        <div className="mt-6 flex items-baseline justify-between border-t border-[color:var(--color-border)] pt-4">
          <p className="eyebrow">Weight</p>
          <p className="text-[0.8125rem] font-medium text-[color:var(--color-navy)]">
            {category.weight === 3
              ? "Critical — citation risk"
              : category.weight === 2
                ? "Important — remediate within 90 days"
                : "Informational"}
          </p>
        </div>
      </div>
    </div>
  );
}
