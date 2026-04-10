"use client";

import type { Question } from "@/lib/assessment/questions";
import type { ResponseValue } from "../actions";
import { QuestionCard } from "./question-card";

interface Props {
  questions: Question[];
  responses: Record<
    string,
    { response: ResponseValue | null; notes: string }
  >;
  onResponseChange: (
    questionId: string,
    response: ResponseValue,
  ) => Promise<void>;
  onNotesChange: (questionId: string, notes: string) => Promise<void>;
}

export function CategoryStep({
  questions,
  responses,
  onResponseChange,
  onNotesChange,
}: Props) {
  return (
    <div>
      {questions.map((q, i) => (
        <QuestionCard
          key={q.id}
          question={q}
          index={i}
          total={questions.length}
          response={responses[q.id]?.response ?? null}
          notes={responses[q.id]?.notes ?? ""}
          onResponseChange={(r) => onResponseChange(q.id, r)}
          onNotesChange={(n) => onNotesChange(q.id, n)}
        />
      ))}
    </div>
  );
}
