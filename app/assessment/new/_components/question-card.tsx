"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { Question } from "@/lib/assessment/questions";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
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
  onResponseChange: (r: ResponseValue) => void;
  onNotesChange: (n: string) => void;
}

export function QuestionCard({
  question,
  response,
  notes,
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
    <Card
      className={cn(
        isCritical && "border-destructive/30",
        response && "ring-1 ring-primary/20",
      )}
    >
      <CardContent className="space-y-4 p-5">
        <div className="space-y-2">
          <div className="flex items-start gap-3">
            {isCritical && (
              <span className="mt-0.5 shrink-0 rounded-sm bg-destructive/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-destructive">
                Critical
              </span>
            )}
            <p className="flex-1 text-sm font-medium leading-snug">
              {question.question}
            </p>
          </div>
          <p className="pl-0 text-xs leading-relaxed text-muted-foreground">
            {question.guidance}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {RESPONSE_OPTIONS.map((opt) => {
            const selected = response === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => onResponseChange(opt.value)}
                className={cn(
                  "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  selected
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-input bg-background text-foreground hover:bg-muted",
                )}
              >
                {opt.label}
              </button>
            );
          })}
        </div>

        {response && (
          <div className="pt-1">
            {!showNotes ? (
              <button
                type="button"
                onClick={() => setShowNotes(true)}
                className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
              >
                + Add notes
              </button>
            ) : (
              <div className="space-y-2">
                <Textarea
                  value={localNotes}
                  onChange={(e) => setLocalNotes(e.target.value)}
                  onBlur={commitNotes}
                  placeholder="Optional notes, evidence, or context…"
                  rows={2}
                />
                <button
                  type="button"
                  onClick={() => {
                    commitNotes();
                    if (!localNotes.trim()) setShowNotes(false);
                  }}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  {localNotes.trim() ? "Save notes" : "Hide"}
                </button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
