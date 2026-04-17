"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  getActiveCategories,
  getCriticalCategories,
  type Category,
  type ResponseValue,
} from "@/lib/assessment/questions";
import {
  createOrgAndAssessment,
  saveResponse,
  finalizeAssessment,
  type OrgInfoInput,
} from "../actions";
import { OrgInfoStep } from "./org-info-step";
import { CategoryStep } from "./category-step";
import { ReviewStep } from "./review-step";
import { SaveForLaterButton } from "./save-for-later-button";
import { Progress } from "@/components/ui/progress";

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
  category?: Category;
  label: string;
}

const CATEGORIES = getActiveCategories();

function buildScreens(): Screen[] {
  const screens: Screen[] = [
    { kind: "org-info", label: "Organization & site" },
  ];
  for (const cat of CATEGORIES) {
    screens.push({
      kind: "category",
      category: cat,
      label: cat.title,
    });
  }
  screens.push({ kind: "review", label: "Review & submit" });
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

  // ─── Step 0: create org + assessment ──────────────────────────────
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

  // ─── Category response ────────────────────────────────────────────
  const handleResponseChange = useCallback(
    async (categoryId: string, response: ResponseValue) => {
      if (!assessmentId) {
        toast.error("No active assessment");
        return;
      }
      const existing = responses[categoryId];
      setResponses((prev) => ({
        ...prev,
        [categoryId]: { response, notes: prev[categoryId]?.notes ?? "" },
      }));
      const result = await saveResponse({
        assessmentId,
        questionId: categoryId,
        response,
        notes: existing?.notes ?? null,
      });
      if (!result.ok) {
        toast.error(`Save failed: ${result.error}`);
        setResponses((prev) => ({
          ...prev,
          [categoryId]: existing ?? { response: null, notes: "" },
        }));
      }
    },
    [assessmentId, responses],
  );

  const handleNotesChange = useCallback(
    async (categoryId: string, notes: string) => {
      if (!assessmentId) return;
      const existing = responses[categoryId];
      if (!existing?.response) return;
      setResponses((prev) => ({
        ...prev,
        [categoryId]: { ...prev[categoryId]!, notes },
      }));
      const result = await saveResponse({
        assessmentId,
        questionId: categoryId,
        response: existing.response,
        notes,
      });
      if (!result.ok) {
        toast.error(`Notes save failed: ${result.error}`);
      }
    },
    [assessmentId, responses],
  );

  // ─── Finalize → redirect to thank-you ─────────────────────────────
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

  // ─── Gating: critical categories must be answered ─────────────────
  const canAdvance = useMemo(() => {
    if (currentScreen.kind !== "category") return true;
    const cat = currentScreen.category;
    if (!cat || cat.weight < 3) return true;
    return Boolean(responses[cat.id]?.response);
  }, [currentScreen, responses]);

  // ─── Progress ─────────────────────────────────────────────────────
  const progress = useMemo(() => {
    const total = CATEGORIES.length;
    const answered = CATEGORIES.filter(
      (c) => responses[c.id]?.response,
    ).length;
    return { answered, total };
  }, [responses]);

  const handleNext = () => {
    if (screenIndex < SCREENS.length - 1) setScreenIndex(screenIndex + 1);
  };
  const handleBack = () => {
    if (screenIndex > 0) setScreenIndex(screenIndex - 1);
  };

  const handleJumpToCategory = (categoryId: string) => {
    const idx = SCREENS.findIndex(
      (s) => s.kind === "category" && s.category?.id === categoryId,
    );
    if (idx >= 0) setScreenIndex(idx);
  };

  return (
    <div className="space-y-10">
      {/* ═══ Step indicator + header ══════════════════════════════════ */}
      <header className="space-y-6">
        {/* Progress bar */}
        {currentScreen.kind !== "org-info" && (
          <div className="space-y-2">
            <div className="flex items-baseline justify-between">
              <p className="text-[0.6875rem] font-medium uppercase tracking-[0.06em] text-[color:var(--color-muted)]">
                Step {screenIndex + 1} of {SCREENS.length}
              </p>
              <p className="tabular-figures text-[0.8125rem] font-medium text-[color:var(--color-navy)]">
                {progress.answered}
                <span className="text-[color:var(--color-muted)]">
                  {" / "}{progress.total}
                </span>
              </p>
            </div>
            <Progress value={(progress.answered / progress.total) * 100} />
          </div>
        )}

        {/* Section header */}
        <div className="border-t-2 border-[color:var(--color-navy)] pt-6">
          {currentScreen.kind === "org-info" ? (
            <div>
              <p className="eyebrow">— Begin</p>
              <h1 className="mt-5 text-[clamp(1.75rem,1.25rem+2vw,2.75rem)] font-semibold tracking-[-0.012em] text-[color:var(--color-navy)]">
                Begin the assessment.
              </h1>
              <p className="mt-4 max-w-xl text-[0.9375rem] leading-[1.65] text-[color:var(--color-muted)]">
                Tell us about the organization and the specific site
                being assessed. Each assessment is scoped to one site.
              </p>
            </div>
          ) : currentScreen.kind === "review" ? (
            <div>
              <p className="eyebrow">— Final Review</p>
              <h1 className="mt-5 text-[clamp(1.75rem,1.25rem+2vw,2.75rem)] font-semibold tracking-[-0.012em] text-[color:var(--color-navy)]">
                Review &amp; submit.
              </h1>
            </div>
          ) : (
            <div>
              {currentScreen.category && (
                <p className="eyebrow">
                  — {String(screenIndex).padStart(2, "0")} · {currentScreen.category.statuteRef}
                </p>
              )}
              <h1 className="mt-5 text-[clamp(1.75rem,1.5rem+1vw,2.25rem)] font-bold tracking-[-0.012em] text-[color:var(--color-navy)]">
                {currentScreen.label}
              </h1>
              {currentScreen.category && (
                <p className="mt-4 max-w-2xl text-[0.9375rem] leading-[1.65] text-[color:var(--color-muted)]">
                  {currentScreen.category.description}
                </p>
              )}
            </div>
          )}
        </div>
      </header>

      {/* ═══ Content ══════════════════════════════════════════════════ */}
      {currentScreen.kind === "org-info" && (
        <OrgInfoStep
          initial={initialAssessment}
          onSubmit={handleOrgInfoSubmit}
        />
      )}

      {currentScreen.kind === "category" && currentScreen.category && (
        <CategoryStep
          category={currentScreen.category}
          response={responses[currentScreen.category.id]?.response ?? null}
          notes={responses[currentScreen.category.id]?.notes ?? ""}
          onResponseChange={(r) =>
            handleResponseChange(currentScreen.category!.id, r)
          }
          onNotesChange={(n) =>
            handleNotesChange(currentScreen.category!.id, n)
          }
        />
      )}

      {currentScreen.kind === "review" && (
        <ReviewStep
          responses={responses}
          onJumpToCategory={handleJumpToCategory}
          onSubmit={handleFinalize}
        />
      )}

      {/* ═══ Footer nav ══════════════════════════════════════════════ */}
      {currentScreen.kind !== "org-info" && (
        <div className="flex items-center justify-between gap-3 border-t border-[color:var(--color-border)] pt-8">
          <button
            type="button"
            onClick={handleBack}
            disabled={screenIndex === 0}
            className="btn btn-secondary text-xs px-5 py-2.5 disabled:opacity-40 disabled:pointer-events-none"
          >
            ← Back
          </button>

          <div className="flex items-center gap-6">
            {assessmentId && (
              <SaveForLaterButton assessmentId={assessmentId} />
            )}

            {currentScreen.kind !== "review" && (
              <>
                {!canAdvance && (
                  <span className="hidden text-[0.8125rem] text-[color:var(--color-muted)] md:inline">
                    Required — select a compliance level to continue
                  </span>
                )}
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={!canAdvance}
                  className="btn btn-primary text-xs px-5 py-2.5 disabled:opacity-40 disabled:pointer-events-none"
                >
                  Continue →
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
