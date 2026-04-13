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
    if (!cat || cat.weight < 3) return true; // non-critical categories can be skipped
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
      {/* ═══ Editorial page header ══════════════════════════════════ */}
      <header className="space-y-6">
        <div className="flex items-baseline justify-between border-b border-ink pb-3">
          <p className="eyebrow">
            <span className="font-mono tabular-figures text-ink">
              {String(screenIndex + 1).padStart(2, "0")}
            </span>
            <span className="text-warm-muted-soft">
              {" / "}
              {String(SCREENS.length).padStart(2, "0")}
            </span>
          </p>
          {currentScreen.kind === "category" && (
            <p className="eyebrow hidden md:block">SB 553 Compliance</p>
          )}
        </div>

        {currentScreen.kind === "org-info" ? (
          <div>
            <p className="eyebrow mb-3">Begin</p>
            <h1 className="font-display text-5xl font-light leading-[0.95] tracking-[-0.02em] text-ink md:text-[64px]">
              Begin the{" "}
              <span className="italic text-forest">assessment</span>
              <span className="text-warm-muted">.</span>
            </h1>
            <p className="mt-5 max-w-xl text-[15px] leading-[1.65] text-warm-muted">
              Tell us about the organization and the specific site
              being assessed. Each assessment is scoped to one site.
            </p>
          </div>
        ) : currentScreen.kind === "review" ? (
          <div>
            <p className="eyebrow mb-3">Final review</p>
            <h1 className="font-display text-5xl font-light leading-[0.95] tracking-[-0.02em] text-ink md:text-[64px]">
              Review &amp;{" "}
              <span className="italic text-forest">submit</span>
              <span className="text-warm-muted">.</span>
            </h1>
          </div>
        ) : (
          <div>
            {currentScreen.category && (
              <p className="eyebrow mb-3">
                {currentScreen.category.statuteRef}
              </p>
            )}
            <h1 className="mt-2 font-display text-[40px] font-light leading-[0.98] tracking-[-0.02em] text-ink md:text-[56px]">
              {currentScreen.label}
            </h1>
            {currentScreen.category && (
              <p className="mt-4 max-w-2xl text-[15px] leading-[1.65] text-warm-muted">
                {currentScreen.category.description}
              </p>
            )}
          </div>
        )}

        {/* Progress */}
        {currentScreen.kind !== "org-info" && (
          <div className="space-y-2 pt-4">
            <div className="flex items-baseline justify-between">
              <p className="eyebrow">Progress</p>
              <p className="font-mono tabular-figures text-[13px] text-ink">
                {String(progress.answered).padStart(2, "0")}
                <span className="text-warm-muted-soft">
                  {" / "}
                  {String(progress.total).padStart(2, "0")}
                </span>
              </p>
            </div>
            <div className="relative h-px w-full bg-sand">
              <div
                className="absolute inset-y-0 left-0 bg-forest transition-[width] duration-500"
                style={{
                  width: `${(progress.answered / progress.total) * 100}%`,
                }}
              />
            </div>
          </div>
        )}
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
        <div className="flex items-center justify-between gap-3 border-t border-ink pt-8">
          <button
            type="button"
            onClick={handleBack}
            disabled={screenIndex === 0}
            className="group flex items-baseline gap-2 text-[15px] text-ink disabled:cursor-not-allowed disabled:text-warm-muted-soft"
          >
            <span className="transition-transform duration-300 group-hover:-translate-x-1">
              ←
            </span>
            <span className="link-editorial font-display italic">Back</span>
          </button>

          <div className="flex items-center gap-8">
            {assessmentId && (
              <SaveForLaterButton assessmentId={assessmentId} />
            )}

            {currentScreen.kind !== "review" && (
              <>
                {!canAdvance && (
                  <span className="hidden font-display text-[13px] italic text-warm-muted md:inline">
                    Required — select a compliance level to continue
                  </span>
                )}
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={!canAdvance}
                  className="group flex items-baseline gap-2 text-[15px] text-ink disabled:cursor-not-allowed disabled:text-warm-muted-soft"
                >
                  <span className="link-editorial font-display italic">
                    Continue
                  </span>
                  <span className="transition-transform duration-300 group-hover:translate-x-1">
                    →
                  </span>
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
