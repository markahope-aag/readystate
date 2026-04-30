"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  getActiveSections,
  getCriticalQuestions,
  isSectionNotesId,
  sectionNotesId,
  type ResponseValue,
  type Section,
} from "@/lib/assessment/questions";
import {
  createOrgAndAssessment,
  saveResponse,
  finalizeAssessment,
  type OrgInfoInput,
} from "../actions";
import { OrgInfoStep } from "./org-info-step";
import { SectionStep } from "./section-step";
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

type AnswerState = Record<string, { response: ResponseValue | null }>;
type NotesState = Record<Section["id"], string>;

interface Screen {
  kind: "org-info" | "section" | "review";
  section?: Section;
  label: string;
}

const SECTIONS = getActiveSections();
const CRITICAL_QUESTIONS = getCriticalQuestions();

function buildScreens(): Screen[] {
  const screens: Screen[] = [
    { kind: "org-info", label: "Organization & site" },
  ];
  for (const sec of SECTIONS) {
    screens.push({ kind: "section", section: sec, label: sec.title });
  }
  screens.push({ kind: "review", label: "Review & submit" });
  return screens;
}

const SCREENS = buildScreens();

const VALID_RESPONSES: ResponseValue[] = ["yes", "no", "partial", "na"];
function asResponseValue(v: string): ResponseValue | null {
  return (VALID_RESPONSES as string[]).includes(v) ? (v as ResponseValue) : null;
}

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

  const [answers, setAnswers] = useState<AnswerState>(() => {
    const initial: AnswerState = {};
    for (const r of initialResponses) {
      if (isSectionNotesId(r.question_id)) continue;
      const v = asResponseValue(r.response);
      if (v) initial[r.question_id] = { response: v };
    }
    return initial;
  });

  const [notes, setNotes] = useState<NotesState>(() => {
    const initial: NotesState = { plan: "", people: "", process: "", proof: "" };
    for (const r of initialResponses) {
      if (!isSectionNotesId(r.question_id)) continue;
      const sec = r.question_id.replace(/^notes_/, "") as Section["id"];
      if (sec in initial) initial[sec] = r.notes ?? "";
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

  // ─── Per-question response ────────────────────────────────────────
  const handleResponseChange = useCallback(
    async (questionId: string, response: ResponseValue) => {
      if (!assessmentId) {
        toast.error("No active assessment");
        return;
      }
      const previous = answers[questionId] ?? null;
      setAnswers((prev) => ({
        ...prev,
        [questionId]: { response },
      }));
      const result = await saveResponse({
        assessmentId,
        questionId,
        response,
        notes: null,
      });
      if (!result.ok) {
        toast.error(`Save failed: ${result.error}`);
        setAnswers((prev) => ({
          ...prev,
          [questionId]: previous ?? { response: null },
        }));
      }
    },
    [assessmentId, answers],
  );

  // ─── Section evidence notes ──────────────────────────────────────
  const handleNotesChange = useCallback(
    async (sectionId: Section["id"], value: string) => {
      if (!assessmentId) return;
      const previous = notes[sectionId];
      setNotes((prev) => ({ ...prev, [sectionId]: value }));
      const result = await saveResponse({
        assessmentId,
        questionId: sectionNotesId(sectionId),
        response: "na", // pseudo-row sentinel
        notes: value,
      });
      if (!result.ok) {
        toast.error(`Notes save failed: ${result.error}`);
        setNotes((prev) => ({ ...prev, [sectionId]: previous }));
      }
    },
    [assessmentId, notes],
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

  // ─── Gating: critical questions in current section must be answered ──
  const canAdvance = useMemo(() => {
    if (currentScreen.kind !== "section") return true;
    const sec = currentScreen.section;
    if (!sec) return true;
    const unmet = sec.questions
      .filter((q) => !q.deprecated && q.weight === 3)
      .filter((q) => !answers[q.id]?.response);
    return unmet.length === 0;
  }, [currentScreen, answers]);

  // ─── Progress ─────────────────────────────────────────────────────
  const progress = useMemo(() => {
    let total = 0;
    let answered = 0;
    for (const s of SECTIONS) {
      for (const q of s.questions) {
        if (q.deprecated) continue;
        total++;
        if (answers[q.id]?.response) answered++;
      }
    }
    return { answered, total };
  }, [answers]);

  const handleNext = () => {
    if (screenIndex < SCREENS.length - 1) setScreenIndex(screenIndex + 1);
  };
  const handleBack = () => {
    if (screenIndex > 0) setScreenIndex(screenIndex - 1);
  };

  const handleJumpToSection = (sectionId: Section["id"]) => {
    const idx = SCREENS.findIndex(
      (s) => s.kind === "section" && s.section?.id === sectionId,
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
                  {" / "}
                  {progress.total}
                </span>{" "}
                answered
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
              {currentScreen.section && (
                <p className="eyebrow">— {currentScreen.section.eyebrow}</p>
              )}
              <h1 className="mt-5 text-[clamp(1.75rem,1.5rem+1vw,2.25rem)] font-bold tracking-[-0.012em] text-[color:var(--color-navy)]">
                {currentScreen.label}
              </h1>
              {currentScreen.section && (
                <p className="mt-4 max-w-2xl text-[0.9375rem] leading-[1.65] text-[color:var(--color-muted)]">
                  {currentScreen.section.description}
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

      {currentScreen.kind === "section" && currentScreen.section && (
        <SectionStep
          key={currentScreen.section.id}
          section={currentScreen.section}
          answers={answers}
          notes={notes[currentScreen.section.id]}
          onResponseChange={handleResponseChange}
          onNotesChange={(n) =>
            handleNotesChange(currentScreen.section!.id, n)
          }
        />
      )}

      {currentScreen.kind === "review" && (
        <ReviewStep
          answers={answers}
          notes={notes}
          criticalQuestionIds={CRITICAL_QUESTIONS.map((q) => q.id)}
          onJumpToSection={handleJumpToSection}
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
                    Required — answer the critical questions to continue
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
