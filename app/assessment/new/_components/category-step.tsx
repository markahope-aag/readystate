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

/**
 * One assessment category per screen. Shows:
 *   1. The sub-requirements as an informational checklist
 *   2. A compliance-level selector (the actual answer)
 *   3. Optional notes area
 */
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
            <span className="font-display text-[12px] italic text-risk-red">
              Critical
            </span>
          )}
        </div>

        <p className="mb-6 text-[14px] leading-[1.65] text-warm-muted">
          Consider each of the following when evaluating your
          program&rsquo;s compliance with this area. All sub-requirements
          should be met for a rating of &ldquo;Effective.&rdquo;
        </p>

        <ol className="space-y-4">
          {category.subRequirements.map((req, i) => (
            <li
              key={i}
              className="flex items-start gap-4 border-t border-ink/20 pt-4 first:border-t-0 first:pt-0"
            >
              <span className="mt-0.5 font-mono tabular-figures text-[11px] text-warm-muted-soft">
                {String(i + 1).padStart(2, "0")}
              </span>
              <p className="flex-1 text-[15px] leading-[1.55] text-ink">
                {req}
              </p>
            </li>
          ))}
        </ol>

        {/* Optional notes */}
        {response && (
          <div className="mt-8 border-t border-ink/20 pt-6">
            {!showNotes ? (
              <button
                type="button"
                onClick={() => setShowNotes(true)}
                className="link-editorial font-display text-[13px] italic text-warm-muted hover:text-ink"
              >
                + Add evidence or context notes
              </button>
            ) : (
              <div className="space-y-2">
                <p className="eyebrow">Evidence · optional</p>
                <textarea
                  value={localNotes}
                  onChange={(e) => setLocalNotes(e.target.value)}
                  onBlur={commitNotes}
                  placeholder="Policy document name, link, relevant evidence, or notes on gaps…"
                  rows={3}
                  className="w-full resize-y border-b border-ink/30 bg-transparent py-2 font-sans text-[14px] leading-relaxed text-ink placeholder:italic placeholder:text-warm-muted-soft focus:border-ink focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => {
                    commitNotes();
                    if (!localNotes.trim()) setShowNotes(false);
                  }}
                  className="font-display text-[12px] italic text-warm-muted hover:text-ink"
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

        <div className="space-y-0">
          {RESPONSE_OPTIONS.map((opt, i) => {
            const selected = response === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => onResponseChange(opt.value)}
                className={cn(
                  "group w-full border-t border-ink/25 px-5 py-5 text-left transition-colors first:border-t-0",
                  selected
                    ? "bg-forest text-paper"
                    : "hover:bg-paper-deep",
                )}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p
                      className={cn(
                        "font-display text-[18px] font-medium italic md:text-[20px]",
                        selected ? "text-paper" : "text-ink",
                      )}
                    >
                      {opt.label}
                    </p>
                    <p
                      className={cn(
                        "mt-1 text-[12px] leading-[1.5] md:text-[13px]",
                        selected ? "text-paper/70" : "text-warm-muted",
                      )}
                    >
                      {opt.description}
                    </p>
                  </div>
                  {selected && (
                    <span className="mt-1 shrink-0 font-display text-[20px] text-paper">
                      ✓
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Visual weight indicator */}
        <div className="mt-6 flex items-baseline justify-between border-t border-ink/20 pt-4">
          <p className="eyebrow">Weight</p>
          <p className="font-display text-[14px] italic text-ink">
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
