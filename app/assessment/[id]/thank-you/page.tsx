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
    <div className="min-h-screen bg-paper">
      <header className="border-b border-ink">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-5 md:px-12">
          <BrandLogo variant="onLight" height={36} />
          <span className="eyebrow">The colophon</span>
        </div>
      </header>

      <main className="relative">
        {/* ─── Hero — reverent, centered ──────────────────────────── */}
        <section className="mx-auto max-w-[1100px] px-6 pt-24 pb-16 text-center md:px-10 md:pt-32 md:pb-20">
          <p className="eyebrow mb-8">Assessment · complete</p>

          <h1 className="mx-auto max-w-4xl font-display text-[56px] font-light leading-[0.95] tracking-[-0.025em] text-ink md:text-[104px]">
            Thank you
            <span className="text-warm-muted">,</span>
            <br />
            <span className="italic text-forest">sincerely</span>
            <span className="text-warm-muted">.</span>
          </h1>

          {orgName && (
            <p className="mx-auto mt-10 max-w-xl font-display text-[18px] font-light italic leading-relaxed text-warm-muted md:text-[20px]">
              Your ReadyState report for{" "}
              <span className="not-italic text-ink">{orgName}</span> is
              ready. We&rsquo;ll email the PDF to you in the next few
              minutes.
            </p>
          )}
          {!orgName && (
            <p className="mx-auto mt-10 max-w-xl font-display text-[18px] font-light italic leading-relaxed text-warm-muted md:text-[20px]">
              Your ReadyState report is ready. We&rsquo;ll email the PDF
              to you in the next few minutes.
            </p>
          )}
        </section>

        {/* ─── Form section ───────────────────────────────────────── */}
        <section className="border-y border-ink bg-paper-deep">
          <div className="mx-auto max-w-[1100px] px-6 py-20 md:px-10 md:py-28">
            <div className="grid gap-12 md:grid-cols-12 md:gap-16">
              <div className="md:col-span-5">
                <p className="eyebrow mb-4">Delivery</p>
                <h2 className="font-display text-[40px] font-light leading-[1] tracking-[-0.02em] text-ink md:text-[56px]">
                  Where shall we{" "}
                  <span className="italic text-forest">send it</span>
                  <span className="text-warm-muted">?</span>
                </h2>
                <p className="mt-6 max-w-sm text-[14px] leading-[1.65] text-warm-muted md:text-[15px]">
                  One delivery only. No marketing list, no follow-up
                  sequence — just the report, as promised. You can
                  always come back and run another assessment.
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

        <footer className="border-t border-sand bg-paper">
          <div className="mx-auto max-w-[1400px] px-6 py-10 md:px-12">
            <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
              <BrandLogo variant="onLight" height={32} asLink={false} />
              <div className="flex flex-col items-start gap-1 text-xs text-warm-muted md:items-end">
                <p>
                  A product of Kestralis Group, LLC ·{" "}
                  <span className="italic">California, 2026</span>
                </p>
                <p>
                  Not legal advice. Powered by{" "}
                  <span className="italic">Asymmetric Marketing</span>.
                </p>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
