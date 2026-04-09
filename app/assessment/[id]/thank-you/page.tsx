import { notFound } from "next/navigation";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { ContactForm } from "./_components/contact-form";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ThankYouPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = createServiceRoleClient();

  const { data: assessment } = await supabase
    .from("assessments")
    .select(
      "id, site_name, status, email_sent_at, organizations(name)",
    )
    .eq("id", id)
    .maybeSingle();

  if (!assessment) notFound();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rawOrg = (assessment as any).organizations;
  const org = Array.isArray(rawOrg) ? (rawOrg[0] ?? null) : (rawOrg ?? null);
  const orgName: string | null = org?.name ?? null;
  const alreadySent = Boolean(assessment.email_sent_at);

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-2xl px-6 py-16 md:py-24">
        <div className="space-y-3 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Assessment complete
          </p>
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
            Thank you for completing the assessment.
          </h1>
          <p className="mx-auto max-w-xl text-base text-muted-foreground">
            {orgName
              ? `Your ReadyState report for ${orgName} is ready. We'll email the PDF to you in the next few minutes.`
              : "Your ReadyState report is ready. We'll email the PDF to you in the next few minutes."}
          </p>
        </div>

        <div className="mt-12">
          <ContactForm
            assessmentId={id}
            alreadySent={alreadySent}
            orgName={orgName}
          />
        </div>

        <p className="mt-10 text-center text-xs text-muted-foreground">
          ReadyState is a Kestralis product · Powered by Sentinel Ridge Security
        </p>
      </div>
    </main>
  );
}
