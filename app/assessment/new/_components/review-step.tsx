"use client";

import { useMemo, useState } from "react";
import {
  getCriticalQuestions,
  questions,
  sectionMeta,
} from "@/lib/assessment/questions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

type Tone = "positive" | "negative" | "warning" | "neutral";

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
      <Card>
        <CardContent className="space-y-2 p-10 text-center">
          <p className="text-xl font-semibold">Assessment submitted</p>
          <p className="text-sm text-muted-foreground">
            Your responses have been saved. A scoring report will be available
            shortly.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {sectionSummaries.map(({ section, total, counts }) => (
        <Card key={section}>
          <CardHeader>
            <CardTitle className="text-lg">
              {sectionMeta[section].label}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-5 gap-2">
              <SummaryPill label="Yes" value={counts.yes} tone="positive" />
              <SummaryPill
                label="Partial"
                value={counts.partial}
                tone="warning"
              />
              <SummaryPill label="No" value={counts.no} tone="negative" />
              <SummaryPill label="N/A" value={counts.na} tone="neutral" />
              <SummaryPill
                label="Skipped"
                value={counts.unanswered}
                tone={counts.unanswered > 0 ? "warning" : "neutral"}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {total - counts.unanswered} of {total} questions answered
            </p>
          </CardContent>
        </Card>
      ))}

      {unansweredCritical.length > 0 && (
        <Card className="border-destructive/40">
          <CardHeader>
            <CardTitle className="text-base text-destructive">
              {unansweredCritical.length} critical question
              {unansweredCritical.length === 1 ? "" : "s"} unanswered
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-3 text-xs text-muted-foreground">
              Critical (weight 3) questions must be answered before you can
              submit.
            </p>
            <ul className="space-y-2">
              {unansweredCritical.map((q) => (
                <li
                  key={q.id}
                  className="flex items-start justify-between gap-3 text-sm"
                >
                  <span className="flex-1">
                    <span className="font-mono text-xs text-muted-foreground">
                      {q.id}
                    </span>{" "}
                    {q.question}
                  </span>
                  <button
                    type="button"
                    onClick={() => onJumpToQuestion(q.id)}
                    className="shrink-0 text-xs text-primary underline-offset-4 hover:underline"
                  >
                    Go to question →
                  </button>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <Button
        onClick={handleSubmit}
        disabled={!canSubmit || submitting}
        size="lg"
        className="w-full"
      >
        {submitting ? "Submitting…" : "Submit Assessment"}
      </Button>
    </div>
  );
}

function SummaryPill({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: Tone;
}) {
  const toneClasses: Record<Tone, string> = {
    positive: "bg-emerald-50 text-emerald-900 border-emerald-200",
    negative: "bg-red-50 text-red-900 border-red-200",
    warning: "bg-amber-50 text-amber-900 border-amber-200",
    neutral: "bg-muted text-muted-foreground border-border",
  };
  return (
    <div
      className={cn(
        "rounded-md border px-2 py-1.5 text-center",
        toneClasses[tone],
      )}
    >
      <div className="text-base font-semibold">{value}</div>
      <div className="text-[10px] uppercase tracking-wide">{label}</div>
    </div>
  );
}
