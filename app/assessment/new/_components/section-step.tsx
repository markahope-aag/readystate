"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import {
  RESPONSE_OPTIONS_V3,
  type Question,
  type ResponseValue,
  type Section,
} from "@/lib/assessment/questions";

export interface QuestionAnswerState {
  response: ResponseValue | null;
}

interface Props {
  section: Section;
  /** Map of questionId → current response */
  answers: Record<string, QuestionAnswerState | undefined>;
  /** Section-level evidence notes */
  notes: string;
  onResponseChange: (questionId: string, response: ResponseValue) => void;
  onNotesChange: (notes: string) => void;
}

/** Color-coded background for selected response option */
const SELECTED_BG: Record<ResponseValue, string> = {
  yes: "bg-[color:var(--color-navy)]",
  partial: "bg-[#D97706]",
  no: "bg-[#DC2626]",
  na: "bg-[color:var(--color-muted)]",
};

/** Color-coded text for the description shown after selection */
const RESPONSE_TEXT: Record<ResponseValue, string> = {
  yes: "text-[color:var(--color-navy)]",
  partial: "text-[#D97706]",
  no: "text-[#DC2626]",
  na: "text-[color:var(--color-muted)]",
};

/**
 * One section per screen. Renders a vertical list of questions
 * (Y/N or Y/N/Partial) followed by a single optional evidence/context box
 * scoped to this section.
 */
export function SectionStep({
  section,
  answers,
  notes,
  onResponseChange,
  onNotesChange,
}: Props) {
  const [showNotes, setShowNotes] = useState(Boolean(notes));
  const [localNotes, setLocalNotes] = useState(notes);

  // Sync local state when the parent swaps to a different section.
  useEffect(() => {
    setLocalNotes(notes);
    setShowNotes(Boolean(notes));
  }, [notes]);

  const commitNotes = () => {
    if (localNotes !== notes) onNotesChange(localNotes);
  };

  return (
    <div className="space-y-12">
      {/* ─── Question list ───────────────────────────────────────── */}
      <ol className="border-t-2 border-[color:var(--color-navy)]">
        {section.questions
          .filter((q) => !q.deprecated)
          .map((q, i) => (
            <QuestionRow
              key={q.id}
              index={i}
              question={q}
              response={answers[q.id]?.response ?? null}
              onChange={(r) => onResponseChange(q.id, r)}
            />
          ))}
      </ol>

      {/* ─── Section evidence/context ────────────────────────────── */}
      <div className="border-t border-[color:var(--color-border)] pt-8">
        {!showNotes ? (
          <button
            type="button"
            onClick={() => setShowNotes(true)}
            className="text-[0.8125rem] font-medium text-[color:var(--color-blue)] underline underline-offset-2 transition-colors hover:text-[color:var(--color-navy)]"
          >
            + Add evidence or context for this section
          </button>
        ) : (
          <div className="space-y-3">
            <div className="flex items-baseline justify-between">
              <p className="form-label">Evidence · {section.title}</p>
              <p className="text-[0.6875rem] uppercase tracking-[0.08em] text-[color:var(--color-muted)]">
                Optional · scoped to this section
              </p>
            </div>
            <textarea
              value={localNotes}
              onChange={(e) => setLocalNotes(e.target.value)}
              onBlur={commitNotes}
              placeholder="Policy document name, link, relevant evidence, or notes on gaps for this section…"
              rows={4}
              className="form-input min-h-[120px] resize-y placeholder:italic"
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
    </div>
  );
}

// ─── Question row ─────────────────────────────────────────────────────────────

function QuestionRow({
  index,
  question,
  response,
  onChange,
}: {
  index: number;
  question: Question;
  response: ResponseValue | null;
  onChange: (r: ResponseValue) => void;
}) {
  const isCritical = question.weight === 3;
  const options: ResponseValue[] =
    question.responseType === "yes_no_partial"
      ? ["yes", "partial", "no"]
      : ["yes", "no"];
  if (question.allowNa) options.push("na");

  return (
    <li className="grid grid-cols-12 gap-4 border-b border-[color:var(--color-border)] py-7 md:gap-8 md:py-8">
      <div className="col-span-12 md:col-span-7">
        <div className="flex flex-wrap items-baseline gap-3">
          <span className="tabular-figures text-[0.75rem] font-semibold tracking-[0.08em] text-[color:var(--color-blue)]">
            {String(index + 1).padStart(2, "0")}
          </span>
          {isCritical && (
            <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.06em] text-[#DC2626]">
              Critical
            </span>
          )}
          {question.statuteRef && (
            <span className="text-[0.6875rem] uppercase tracking-[0.08em] text-[color:var(--color-muted)]">
              {question.statuteRef}
            </span>
          )}
        </div>
        <p className="mt-3 text-[0.9375rem] leading-[1.55] text-[color:var(--color-body)] md:text-[1rem]">
          {question.prompt}
        </p>
        {question.guidance && question.guidance.length > 0 && (
          <ul className="mt-4 space-y-2 border-l-2 border-[color:var(--color-blue-light)] pl-4">
            {question.guidance.map((g, i) => (
              <li
                key={i}
                className="text-[0.8125rem] leading-[1.55] text-[color:var(--color-muted)]"
              >
                {g}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="col-span-12 md:col-span-5">
        <div className="flex flex-wrap gap-2">
          {options.map((opt) => {
            const selected = response === opt;
            const meta = RESPONSE_OPTIONS_V3[opt];
            const bg = selected
              ? SELECTED_BG[opt]
              : "bg-white hover:bg-[color:var(--color-gray-light)]";
            return (
              <button
                key={opt}
                type="button"
                onClick={() => onChange(opt)}
                className={cn(
                  "min-w-[80px] border px-4 py-2 text-left transition-all",
                  selected
                    ? `${bg} border-transparent text-white`
                    : "border-[color:var(--color-border)] text-[color:var(--color-navy)]",
                )}
                title={meta.description}
              >
                <span
                  className={cn(
                    "block text-[0.9375rem] font-semibold",
                    selected ? "text-white" : "text-[color:var(--color-navy)]",
                  )}
                >
                  {meta.label}
                </span>
              </button>
            );
          })}
        </div>
        {response && (
          <p
            className={cn(
              "mt-2 text-[0.75rem]",
              RESPONSE_TEXT[response],
            )}
          >
            {RESPONSE_OPTIONS_V3[response].description}
          </p>
        )}
      </div>
    </li>
  );
}
