import { notFound } from "next/navigation";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { BrandLogo } from "@/components/brand-logo";
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
    .select("id, site_name, status, email_sent_at, organizations(name)")
    .eq("id", id)
    .maybeSingle();

  if (!assessment) notFound();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rawOrg = (assessment as any).organizations;
  const org = Array.isArray(rawOrg) ? (rawOrg[0] ?? null) : (rawOrg ?? null);
  const orgName: string | null = org?.name ?? null;
  const alreadySent = Boolean(assessment.email_sent_at);

  return (
    <div className="min-h-screen bg-white">
      {/* ═══ Nav ═══════════════════════════════════════════════════════ */}
      <header className="sticky top-0 z-20 border-b border-[color:var(--color-border)] bg-white">
        <div className="mx-auto flex max-w-[960px] items-center justify-between px-6 h-16">
          <BrandLogo variant="onLight" height={24} />
          <span className="hidden md:block text-[0.6875rem] font-medium uppercase tracking-[0.1em] text-[color:var(--color-muted)]">
            A Kestralis product
          </span>
        </div>
      </header>

      <main>
        {/* ─── Hero ──────────────────────────────────────────────── */}
        <section className="mx-auto max-w-[960px] px-6 pt-20 pb-14 md:pt-28 md:pb-16 text-center">
          <p className="eyebrow mb-6">— Assessment Complete</p>

          <h1 className="text-[clamp(2.5rem,2rem+2.5vw,4rem)] font-bold leading-[1.06] tracking-[-0.02em] text-[color:var(--color-navy)]">
            Thank you, sincerely.
          </h1>

          {orgName ? (
            <p className="mx-auto mt-6 max-w-xl text-[1.0625rem] leading-[1.65] text-[color:var(--color-muted)]">
              Your ReadyState report for{" "}
              <span className="font-medium text-[color:var(--color-body)]">{orgName}</span> is
              ready. We&rsquo;ll email the PDF to you in the next few minutes.
            </p>
          ) : (
            <p className="mx-auto mt-6 max-w-xl text-[1.0625rem] leading-[1.65] text-[color:var(--color-muted)]">
              Your ReadyState report is ready. We&rsquo;ll email the PDF
              to you in the next few minutes.
            </p>
          )}
        </section>

        {/* ─── Form section ───────────────────────────────────────── */}
        <section className="border-y border-[color:var(--color-border)] bg-[color:var(--color-gray-light)]">
          <div className="mx-auto max-w-[960px] px-6 py-16 md:py-20">
            <div className="grid gap-12 md:grid-cols-12 md:gap-16">
              <div className="md:col-span-5">
                <p className="eyebrow">— Delivery</p>
                <h2 className="mt-5 text-[clamp(1.75rem,1.25rem+2vw,2.75rem)] font-semibold tracking-[-0.012em] text-[color:var(--color-navy)]">
                  Where shall we send it?
                </h2>
                <p className="mt-5 text-[0.875rem] leading-[1.65] text-[color:var(--color-muted)]">
                  One delivery only. No marketing list, no follow-up
                  sequence — just the report, as promised. You can always
                  come back and run another assessment.
                </p>
              </div>

              <div className="md:col-span-7">
                <ContactForm
                  assessmentId={id}
                  alreadySent={alreadySent}
                  orgName={orgName}
                />
              </div>
            </div>
          </div>
        </section>

        {/* ─── Footer ─────────────────────────────────────────────── */}
        <footer className="bg-[color:var(--color-ink)] text-white/60">
          <div className="mx-auto max-w-[960px] px-6 py-8">
            <div className="flex flex-col items-center gap-4 md:flex-row md:justify-between">
              <BrandLogo variant="onDark" height={20} asLink={false} />
              <span className="text-[0.75rem]">readystate.now</span>
            </div>
            <p className="mt-6 text-center text-[0.75rem] text-white/40">
              A product of Kestralis Group, LLC · California, 2026. Not legal advice.
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
}
