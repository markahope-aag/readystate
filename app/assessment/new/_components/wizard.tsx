"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  questions,
  sectionMeta,
  type Question,
  type QuestionSection,
} from "@/lib/assessment/questions";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  createOrgAndAssessment,
  saveResponse,
  finalizeAssessment,
  type OrgInfoInput,
  type ResponseValue,
} from "../actions";
import { OrgInfoStep } from "./org-info-step";
import { CategoryStep } from "./category-step";
import { ReviewStep } from "./review-step";

export interface WizardInitialAssessment {
  id: string;
  site_name: string | null;
  site_address: string | null;
  status: string;
  organizations: {
    id: string;
    name: string;
    industry: string | null;
    employee_count: number | null;
    california_locations: number | null;
  } | null;
}

export interface WizardInitialResponse {
  question_id: string;
  response: string;
  notes: string | null;
}

type ResponseState = Record<
  string,
  { response: ResponseValue | null; notes: string }
>;

interface Screen {
  kind: "org-info" | "category" | "review";
  section?: QuestionSection;
  category?: string;
  questions?: Question[];
  label: string;
}

/**
 * Flatten the question bank into a linear sequence of wizard screens:
 * [org-info] → [one screen per category in sb553 → asis → hazard order] → [review]
 */
function buildScreens(): Screen[] {
  const screens: Screen[] = [
    { kind: "org-info", label: "Organization & site information" },
  ];

  for (const section of ["sb553", "asis", "hazard"] as const) {
    const sectionQs = questions.filter(
      (q) => q.section === section && !q.deprecated,
    );
    const categoryOrder: string[] = [];
    for (const q of sectionQs) {
      if (!categoryOrder.includes(q.category)) categoryOrder.push(q.category);
    }
    for (const cat of categoryOrder) {
      screens.push({
        kind: "category",
        section,
        category: cat,
        questions: sectionQs.filter((q) => q.category === cat),
        label: `${sectionMeta[section].label} — ${cat}`,
      });
    }
  }

  screens.push({ kind: "review", label: "Review & Submit" });
  return screens;
}

const SCREENS = buildScreens();

export function Wizard({
  initialAssessment,
  initialResponses,
}: {
  initialAssessment: WizardInitialAssessment | null;
  initialResponses: WizardInitialResponse[];
}) {
  const router = useRouter();
  const [assessmentId, setAssessmentId] = useState<string | null>(
    initialAssessment?.id ?? null,
  );
  const [screenIndex, setScreenIndex] = useState(initialAssessment ? 1 : 0);

  const [responses, setResponses] = useState<ResponseState>(() => {
    const initial: ResponseState = {};
    for (const r of initialResponses) {
      initial[r.question_id] = {
        response: r.response as ResponseValue,
        notes: r.notes ?? "",
      };
    }
    return initial;
  });

  const currentScreen = SCREENS[screenIndex];

  // ─── Step 0: create org + assessment ─────────────────────────────────────
  const handleOrgInfoSubmit = async (data: OrgInfoInput) => {
    const result = await createOrgAndAssessment(data);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    setAssessmentId(result.data.assessmentId);
    router.replace(`/assessment/new?id=${result.data.assessmentId}`);
    setScreenIndex(1);
    toast.success("Assessment created");
  };

  // ─── Steps 1–3: auto-save response on click ──────────────────────────────
  const handleResponseChange = useCallback(
    async (questionId: string, response: ResponseValue) => {
      if (!assessmentId) {
        toast.error("No active assessment — return to Step 1");
        return;
      }
      const existing = responses[questionId];
      // Optimistic update
      setResponses((prev) => ({
        ...prev,
        [questionId]: {
          response,
          notes: prev[questionId]?.notes ?? "",
        },
      }));
      const result = await saveResponse({
        assessmentId,
        questionId,
        response,
        notes: existing?.notes ?? null,
      });
      if (!result.ok) {
        toast.error(`Save failed: ${result.error}`);
        setResponses((prev) => ({
          ...prev,
          [questionId]: existing ?? { response: null, notes: "" },
        }));
      }
    },
    [assessmentId, responses],
  );

  const handleNotesChange = useCallback(
    async (questionId: string, notes: string) => {
      if (!assessmentId) return;
      const existing = responses[questionId];
      if (!existing?.response) return; // Notes require a response first
      setResponses((prev) => ({
        ...prev,
        [questionId]: { ...prev[questionId]!, notes },
      }));
      const result = await saveResponse({
        assessmentId,
        questionId,
        response: existing.response,
        notes,
      });
      if (!result.ok) {
        toast.error(`Notes save failed: ${result.error}`);
      }
    },
    [assessmentId, responses],
  );

  // ─── Step 4: finalize → redirect to thank-you page ─────────────────────
  const handleFinalize = async () => {
    if (!assessmentId) return;
    const result = await finalizeAssessment(assessmentId);
    if (!result.ok) {
      toast.error(`Submit failed: ${result.error}`);
      return;
    }
    toast.success("Assessment submitted");
    router.push(`/assessment/${assessmentId}/thank-you`);
  };

  // ─── Gating: can user click Next on current category? ──────────────────
  const canAdvance = useMemo(() => {
    if (currentScreen.kind !== "category") return true;
    return (currentScreen.questions ?? [])
      .filter((q) => q.weight === 3)
      .every((q) => responses[q.id]?.response);
  }, [currentScreen, responses]);

  // ─── Section progress (for the in-category progress bar) ─────────────────
  const sectionProgress = useMemo(() => {
    if (currentScreen.kind !== "category" || !currentScreen.section)
      return null;
    const section = currentScreen.section;
    const sectionQs = questions.filter(
      (q) => q.section === section && !q.deprecated,
    );
    const answered = sectionQs.filter((q) => responses[q.id]?.response).length;
    return { answered, total: sectionQs.length };
  }, [currentScreen, responses]);

  const handleNext = () => {
    if (screenIndex < SCREENS.length - 1) setScreenIndex(screenIndex + 1);
  };

  const handleBack = () => {
    if (screenIndex > 0) setScreenIndex(screenIndex - 1);
  };

  /**
   * Jump directly to the category screen containing a given question.
   * Used by the review step to fix unanswered critical questions.
   */
  const handleJumpToQuestion = (questionId: string) => {
    const q = questions.find((qq) => qq.id === questionId);
    if (!q) return;
    const idx = SCREENS.findIndex(
      (s) =>
        s.kind === "category" &&
        s.section === q.section &&
        s.category === q.category,
    );
    if (idx >= 0) setScreenIndex(idx);
  };

  return (
    <div className="space-y-6">
      <header className="space-y-3">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Step {screenIndex + 1} of {SCREENS.length}
        </p>
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
          {currentScreen.label}
        </h1>
        {sectionProgress && (
          <div className="space-y-1 pt-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Section progress</span>
              <span>
                {sectionProgress.answered} / {sectionProgress.total} answered
              </span>
            </div>
            <Progress
              value={
                (sectionProgress.answered / sectionProgress.total) * 100
              }
            />
          </div>
        )}
      </header>

      {currentScreen.kind === "org-info" && (
        <OrgInfoStep
          initial={initialAssessment}
          onSubmit={handleOrgInfoSubmit}
        />
      )}

      {currentScreen.kind === "category" && (
        <CategoryStep
          questions={currentScreen.questions ?? []}
          responses={responses}
          onResponseChange={handleResponseChange}
          onNotesChange={handleNotesChange}
        />
      )}

      {currentScreen.kind === "review" && (
        <ReviewStep
          responses={responses}
          onJumpToQuestion={handleJumpToQuestion}
          onSubmit={handleFinalize}
        />
      )}

      {currentScreen.kind !== "org-info" && (
        <div className="flex items-center justify-between border-t pt-6">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={screenIndex === 0}
          >
            ← Back
          </Button>
          {currentScreen.kind !== "review" && (
            <div className="flex items-center gap-3">
              {!canAdvance && (
                <span className="text-xs text-muted-foreground">
                  Answer all critical questions to continue
                </span>
              )}
              <Button onClick={handleNext} disabled={!canAdvance}>
                Next →
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
