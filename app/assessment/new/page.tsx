import { createServiceRoleClient } from "@/lib/supabase/server";
import { BrandLogo } from "@/components/brand-logo";
import {
  Wizard,
  type WizardInitialAssessment,
  type WizardInitialResponse,
} from "./_components/wizard";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ id?: string }>;
}

/**
 * Assessment wizard entry point. Fully public — no auth required.
 *
 * If a ?id=<uuid> query parameter is present, the wizard resumes from
 * the stored responses. Otherwise it starts fresh at the Organization
 * Info step. The assessment UUID is the effective bearer token —
 * anyone with it can view or continue the assessment.
 */
export default async function NewAssessmentPage({ searchParams }: PageProps) {
  const { id: assessmentId } = await searchParams;
  let initialAssessment: WizardInitialAssessment | null = null;
  let initialResponses: WizardInitialResponse[] = [];

  if (assessmentId) {
    const supabase = createServiceRoleClient();

    const { data: assessment } = await supabase
      .from("assessments")
      .select(
        "id, site_name, site_address, status, organizations(id, name, industry, employee_count, california_locations)",
      )
      .eq("id", assessmentId)
      .maybeSingle();

    if (assessment) {
      initialAssessment = assessment as unknown as WizardInitialAssessment;
      const { data: responses } = await supabase
        .from("assessment_responses")
        .select("question_id, response, notes")
        .eq("assessment_id", assessmentId);
      initialResponses =
        (responses as WizardInitialResponse[] | null) ?? [];
    }
  }

  return (
    <div className="min-h-screen bg-paper">
      <header className="border-b border-ink">
        <div className="mx-auto flex max-w-[1100px] items-center justify-between px-6 py-5 md:px-10">
          <BrandLogo variant="onLight" height={36} />
          <span className="eyebrow">The assessment</span>
        </div>
      </header>

      <main className="mx-auto max-w-[1100px] px-6 py-12 md:px-10 md:py-20">
        <Wizard
          initialAssessment={initialAssessment}
          initialResponses={initialResponses}
        />
      </main>
    </div>
  );
}
