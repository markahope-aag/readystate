"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { Question } from "@/lib/assessment/questions";
import type { ResponseValue } from "../actions";

const RESPONSE_OPTIONS: { value: ResponseValue; label: string }[] = [
  { value: "yes", label: "Yes" },
  { value: "partial", label: "Partial" },
  { value: "no", label: "No" },
  { value: "na", label: "N/A" },
];

interface Props {
  question: Question;
  response: ResponseValue | null;
  notes: string;
  index: number;
  total: number;
  onResponseChange: (r: ResponseValue) => void;
  onNotesChange: (n: string) => void;
}

export function QuestionCard({
  question,
  response,
  notes,
  index,
  total,
  onResponseChange,
  onNotesChange,
}: Props) {
  const [showNotes, setShowNotes] = useState(Boolean(notes));
  const [localNotes, setLocalNotes] = useState(notes);

  const isCritical = question.weight === 3;

  const commitNotes = () => {
    if (localNotes !== notes) onNotesChange(localNotes);
  };

  return (
    <article className="group relative border-t border-ink/30 py-10 first:border-t-0 first:pt-2 md:py-12">
      <div className="grid gap-6 md:grid-cols-12 md:gap-10">
        {/* ─── Left rail — folio + weight ──────────────────────── */}
        <div className="md:col-span-2">
          <p className="font-mono tabular-figures text-[11px] text-warm-muted">
            {String(index + 1).padStart(2, "0")}
            <span className="text-warm-muted-soft">
              {" / "}
              {String(total).padStart(2, "0")}
            </span>
          </p>
          {isCritical && (
            <p className="mt-2 font-display text-[13px] italic leading-tight text-risk-red">
              Critical
            </p>
          )}
          {!isCritical && question.weight === 2 && (
            <p className="mt-2 font-display text-[13px] italic leading-tight text-warm-muted">
              Important
            </p>
          )}
          {!isCritical && question.weight === 1 && (
            <p className="mt-2 font-display text-[13px] italic leading-tight text-warm-muted-soft">
              Informational
            </p>
          )}
          <p className="mt-3 font-mono text-[10px] text-warm-muted-soft">
            {question.id}
          </p>
        </div>

        {/* ─── Center — question + guidance ─────────────────────── */}
        <div className="md:col-span-7">
          <p className="font-display text-[22px] font-light leading-[1.25] text-ink md:text-[26px]">
            {question.question}
          </p>
          <p className="mt-4 text-[14px] leading-[1.65] text-warm-muted md:text-[15px]">
            {question.guidance}
          </p>

          {/* Notes expander */}
          {response && (
            <div className="mt-5">
              {!showNotes ? (
                <button
                  type="button"
                  onClick={() => setShowNotes(true)}
                  className="link-editorial font-display text-[13px] italic text-warm-muted hover:text-ink"
                >
                  + Add evidence note
                </button>
              ) : (
                <div className="space-y-2">
                  <p className="eyebrow">Evidence · optional</p>
                  <textarea
                    value={localNotes}
                    onChange={(e) => setLocalNotes(e.target.value)}
                    onBlur={commitNotes}
                    placeholder="Link to the document, name the policy, quote the relevant passage…"
                    rows={2}
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
                    {localNotes.trim() ? "Save note" : "Hide"}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ─── Right — response options ─────────────────────────── */}
        <div className="md:col-span-3">
          <p className="eyebrow mb-3">Your answer</p>
          <div className="grid grid-cols-4 gap-0 border border-ink/40 md:grid-cols-1 md:border-0">
            {RESPONSE_OPTIONS.map((opt, i) => {
              const selected = response === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => onResponseChange(opt.value)}
                  className={cn(
                    "relative font-display text-[15px] italic transition-colors",
                    "border-ink/40 py-3 md:border-0",
                    i > 0 && "border-l md:border-l-0",
                    "md:flex md:items-center md:justify-between md:border-t md:py-3 md:text-[17px]",
                    i === 0 && "md:border-t-0",
                    selected
                      ? "bg-forest text-paper md:bg-transparent md:text-forest"
                      : "text-ink hover:bg-paper-deep md:hover:bg-transparent md:hover:text-forest",
                  )}
                >
                  <span className="md:flex md:items-baseline md:gap-2">
                    {selected && (
                      <span className="hidden font-display text-forest md:inline">
                        ✓
                      </span>
                    )}
                    {opt.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </article>
  );
}
