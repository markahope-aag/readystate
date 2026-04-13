import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-paper text-ink">
      {/* ═══ Header — logo + prominent CTA ═══════════════════════════════ */}
      <header className="relative z-20 border-b border-ink">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-6 px-6 py-4 md:px-12">
          <BrandLogo variant="onLight" height={38} />
          <Link
            href="/assessment/new"
            className="inline-flex items-center gap-2 rounded bg-forest px-5 py-2.5 text-[14px] font-semibold text-paper transition-colors hover:bg-forest-deep"
          >
            Start Assessment
          </Link>
        </div>
      </header>

      {/* ═══ Hero — the core message ═════════════════════════════════════ */}
      <section className="relative">
        <div className="mx-auto max-w-[1400px] px-6 pt-20 pb-24 md:px-12 md:pt-28 md:pb-32">
          <div className="mb-12 flex items-baseline gap-6 md:mb-16">
            <span className="eyebrow">California SB 553</span>
          </div>

          <div className="grid gap-12 md:grid-cols-12 md:gap-8">
            <div className="md:col-span-8">
              <h1 className="font-display text-[52px] font-light leading-[0.94] tracking-[-0.028em] text-ink md:text-[100px] lg:text-[120px]">
                Not just a plan
                <span className="text-warm-muted">.</span>
                <br />
                An effective
                <br />
                <span className="italic text-forest">prevention</span>{" "}
                program
                <span className="text-warm-muted">.</span>
              </h1>
            </div>

            <div className="flex flex-col justify-end md:col-span-4">
              <blockquote className="border-l-2 border-forest pl-5">
                <p className="font-display text-[16px] font-light italic leading-snug text-ink md:text-[18px]">
                  &ldquo;An employer shall establish, implement and maintain
                  an effective workplace violence prevention plan.&rdquo;
                </p>
                <cite className="mt-3 block text-[12px] not-italic text-warm-muted">
                  — California SB 553
                </cite>
              </blockquote>
            </div>
          </div>

          <div className="mt-16 h-px w-full bg-ink md:mt-20" />

          <div className="mt-16 grid gap-12 md:grid-cols-12 md:gap-16">
            <div className="md:col-span-5">
              <p className="text-[17px] leading-[1.65] text-ink md:text-[18px]">
                SB 553 requires every California employer to have a
                written Workplace Violence Prevention Plan — but a plan
                that sits in a binder isn&rsquo;t a prevention program.
                ReadyState evaluates whether your program is{" "}
                <strong>actually effective</strong>: implemented,
                maintained, and capable of preventing violence before it
                happens.
              </p>
            </div>
            <div className="md:col-span-6 md:col-start-7">
              <p className="text-[17px] leading-[1.65] text-ink md:text-[18px]">
                The assessment covers every requirement of the statute —
                the written plan, responsible persons, employee
                involvement, hazard identification, training, reporting
                procedures, emergency response, the violent incident log,
                and recordkeeping — evaluated as a working program, not
                just checked off as paperwork.
              </p>
              <div className="mt-10 flex flex-wrap items-center gap-6">
                <Link
                  href="/assessment/new"
                  className="inline-flex items-center gap-3 rounded bg-forest px-8 py-4 font-display text-[18px] font-medium text-paper transition-colors hover:bg-forest-deep md:text-[20px]"
                >
                  Start Your Assessment
                  <span className="text-paper/60">→</span>
                </Link>
                <span className="text-[13px] text-warm-muted">
                  Free · no sign-up · ~45 minutes
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ Prevention vs. Reaction ═════════════════════════════════════ */}
      <section className="border-t border-ink bg-paper-deep">
        <div className="mx-auto max-w-[1400px] px-6 py-24 md:px-12 md:py-32">
          <div className="mb-16 md:mb-20">
            <p className="eyebrow mb-4">The distinction</p>
            <h2 className="max-w-3xl font-display text-[44px] font-light leading-[0.95] tracking-[-0.02em] text-ink md:text-[72px]">
              Prevention is{" "}
              <span className="italic text-forest">not</span> reaction
              <span className="text-warm-muted">.</span>
            </h2>
          </div>

          <div className="grid gap-12 md:grid-cols-2 md:gap-16">
            {/* Prevention column */}
            <div className="border-t-2 border-forest pt-8">
              <p className="font-display text-[13px] font-medium italic text-forest">
                Prevention
              </p>
              <h3 className="mt-3 font-display text-[28px] font-light leading-[1.05] text-ink md:text-[36px]">
                Proactive, systematic measures to identify and eliminate
                risk <span className="italic">before</span> violence occurs.
              </h3>
              <p className="mt-6 text-[15px] leading-[1.65] text-warm-muted">
                Prevention is about building a culture and infrastructure
                where violence is less likely to occur. It addresses root
                causes, early warning signs, and behavioral indicators.
              </p>
              <ul className="mt-6 space-y-3 text-[14px] text-ink">
                <PreventionItem>
                  Detection and management of leading indicators
                </PreventionItem>
                <PreventionItem>
                  Identification and intervention of behavioral indicators
                  of violence risk
                </PreventionItem>
                <PreventionItem>
                  Conflict resolution training and clear zero-tolerance
                  policies
                </PreventionItem>
                <PreventionItem>
                  Secure building access and environmental controls
                </PreventionItem>
                <PreventionItem>
                  Background checks and pre-employment screening
                </PreventionItem>
              </ul>
            </div>

            {/* Reaction column */}
            <div className="border-t-2 border-warm-muted pt-8">
              <p className="font-display text-[13px] font-medium italic text-warm-muted">
                Reaction
              </p>
              <h3 className="mt-3 font-display text-[28px] font-light leading-[1.05] text-ink md:text-[36px]">
                Immediate, tactical actions taken{" "}
                <span className="italic">during or after</span> an incident.
              </h3>
              <p className="mt-6 text-[15px] leading-[1.65] text-warm-muted">
                Reaction is the execution of a crisis plan designed to
                minimize harm, protect lives, and stabilize the situation.
                Necessary — but not sufficient on its own.
              </p>
              <ul className="mt-6 space-y-3 text-[14px] text-ink">
                <ReactionItem>Emergency lockdowns</ReactionItem>
                <ReactionItem>
                  Run-Hide-Fight or equivalent protocols
                </ReactionItem>
                <ReactionItem>Calling 911 / law enforcement</ReactionItem>
                <ReactionItem>Post-incident trauma counseling</ReactionItem>
                <ReactionItem>Critical incident stress debriefing</ReactionItem>
              </ul>
            </div>
          </div>

          <div className="mt-20 border-t border-ink pt-10">
            <p className="max-w-3xl text-[17px] leading-[1.65] text-ink md:text-[18px]">
              <strong className="font-semibold">SB 553 mandates prevention.</strong>{" "}
              Most organizations have reactive protocols but lack the
              proactive, systematic prevention infrastructure the statute
              requires. ReadyState identifies where your program falls
              short — and what to fix first.
            </p>
          </div>
        </div>
      </section>

      {/* ═══ What the Assessment Evaluates ══════════════════════════════ */}
      <section className="border-t border-ink">
        <div className="mx-auto max-w-[1400px] px-6 py-24 md:px-12 md:py-32">
          <div className="mb-16 grid gap-12 md:mb-20 md:grid-cols-12">
            <div className="md:col-span-5">
              <p className="eyebrow mb-4">The assessment</p>
              <h2 className="font-display text-[44px] font-light leading-[0.95] tracking-[-0.02em] text-ink md:text-[64px]">
                Every requirement
                <span className="text-warm-muted">,</span>
                <br />
                <span className="italic text-forest">evaluated</span>
                <span className="text-warm-muted">.</span>
              </h2>
            </div>
            <div className="md:col-span-6 md:col-start-7">
              <p className="text-[16px] leading-[1.7] text-ink md:text-[17px]">
                ReadyState evaluates your workplace violence prevention
                program against every explicit requirement of SB 553 —
                not as a checklist of paperwork, but as a working system.
                Each area is assessed for whether it&rsquo;s actually
                implemented, maintained, and effective.
              </p>
            </div>
          </div>

          <div className="space-y-0">
            <RequirementEntry
              number="01"
              title="Written Plan & Accessibility"
              description="Is there a written plan? Is it site-specific to each work area? Accessible to all employees, their representatives, and Cal/OSHA at all times?"
            />
            <RequirementEntry
              number="02"
              title="Responsible Persons & Administration"
              description="Are named individuals responsible for implementation? Are their roles clearly differentiated? Is there coordination with other employers in shared facilities?"
            />
            <RequirementEntry
              number="03"
              title="Employee Involvement"
              description="Are employees actively involved in developing AND implementing the plan — including hazard identification, inspections, reporting concerns, designing training, and reviewing effectiveness?"
            />
            <RequirementEntry
              number="04"
              title="Hazard Identification & Correction"
              description="Are workplace violence hazards identified periodically, after each incident, and when new hazards emerge? Are unsafe conditions inspected? Are corrections implemented in a timely manner?"
            />
            <RequirementEntry
              number="05"
              title="Training Program"
              description="Is training provided initially and annually? Is it language-appropriate? Does it cover the plan, reporting procedures, job-specific hazards, and the incident log — with interactive Q&A?"
            />
            <RequirementEntry
              number="06"
              title="Reporting, Response & Anti-Retaliation"
              description="Can employees report incidents without fear of reprisal? Are investigations conducted and results communicated? Are procedures actually effective — not just written rules that sit unused?"
            />
            <RequirementEntry
              number="07"
              title="Emergency Response Procedures"
              description="Can employees be alerted to the presence, location, and nature of a WPV emergency? Are evacuation and sheltering plans appropriate and feasible? Is security and law enforcement coordination established?"
            />
            <RequirementEntry
              number="08"
              title="Violent Incident Log"
              description="Are all incidents recorded with the required fields — date, time, location, WPV type (1–4), incident classification, detailed description, circumstances, consequences, and responder information — with PII properly omitted?"
            />
            <RequirementEntry
              number="09"
              title="Recordkeeping"
              description="Are hazard records and incident logs retained for 5 years? Training records for 1 year? Are all records available to Cal/OSHA on request and to employees within 15 calendar days at no cost?"
            />
            <RequirementEntry
              number="10"
              title="Plan Review & Continuous Improvement"
              description="Is the plan reviewed at least annually, after every deficiency, and following each incident? Is effectiveness actually evaluated and the plan revised as needed?"
            />
          </div>
        </div>
      </section>

      {/* ═══ How it Works ════════════════════════════════════════════════ */}
      <section className="border-t border-ink bg-paper-deep">
        <div className="mx-auto max-w-[1400px] px-6 py-24 md:px-12 md:py-32">
          <div className="grid gap-12 md:grid-cols-2 md:gap-20">
            <div>
              <p className="eyebrow mb-4">How it works</p>
              <h2 className="font-display text-[44px] font-light leading-[0.95] tracking-[-0.02em] text-ink md:text-[64px]">
                Evaluate<span className="text-warm-muted">.</span> Score
                <span className="text-warm-muted">.</span>{" "}
                <span className="italic text-forest">Fix</span>
                <span className="text-warm-muted">.</span>
              </h2>
            </div>
            <div className="space-y-10">
              <Step
                n={1}
                title="Scope your site"
                body="Enter your organization details and the specific site being evaluated. Every assessment is scoped to one physical location."
              />
              <Step
                n={2}
                title="Evaluate each requirement"
                body="Rate your program's compliance across every SB 553 statutory requirement — not yes/no checkboxes, but an honest evaluation of whether each area is actually working."
              />
              <Step
                n={3}
                title="Get your report"
                body="Enter your email and receive a Kestralis-branded PDF report with your compliance score, a gap analysis sorted by severity, and concrete remediation guidance for every critical shortfall."
              />
            </div>
          </div>
        </div>
      </section>

      {/* ═══ CTA — dominant, unmissable ══════════════════════════════════ */}
      <section className="border-t border-ink bg-forest text-paper">
        <div className="mx-auto max-w-[1400px] px-6 py-24 md:px-12 md:py-32">
          <div className="grid gap-10 md:grid-cols-12 md:items-center">
            <div className="md:col-span-7">
              <h2 className="font-display text-[48px] font-light leading-[0.95] tracking-[-0.025em] text-paper md:text-[80px]">
                Start your assessment
                <span className="text-paper/40">.</span>
              </h2>
              <p className="mt-6 max-w-xl text-[16px] leading-[1.7] text-paper/70 md:text-[17px]">
                Free. No account required. The complete report with
                compliance scoring and prioritized remediation guidance is
                delivered to your inbox within minutes.
              </p>
            </div>
            <div className="md:col-span-5 md:text-right">
              <Link
                href="/assessment/new"
                className="inline-flex items-center gap-3 rounded bg-paper px-10 py-5 font-display text-[20px] font-medium text-forest transition-colors hover:bg-paper-deep md:text-[24px]"
              >
                Start Assessment
                <span className="text-forest/50">→</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ Footer ═════════════════════════════════════════════════════ */}
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
                Structured evaluation against California SB 553. Not
                legal advice. Powered by{" "}
                <span className="italic">Asymmetric Marketing</span>.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────

function PreventionItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3">
      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-forest" />
      <span className="leading-[1.5]">{children}</span>
    </li>
  );
}

function ReactionItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3">
      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-warm-muted" />
      <span className="leading-[1.5] text-warm-muted">{children}</span>
    </li>
  );
}

function RequirementEntry({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <article className="grid grid-cols-12 gap-4 border-t border-ink/30 py-8 md:gap-10 md:py-10">
      <div className="col-span-2 md:col-span-1">
        <span className="font-display text-[28px] font-light italic leading-none text-forest md:text-[36px]">
          {number}
        </span>
      </div>
      <div className="col-span-10 md:col-span-4">
        <h3 className="font-display text-[20px] font-light leading-[1.1] tracking-[-0.01em] text-ink md:text-[24px]">
          {title}
        </h3>
      </div>
      <div className="col-span-12 md:col-span-7">
        <p className="text-[14px] leading-[1.65] text-warm-muted md:text-[15px]">
          {description}
        </p>
      </div>
    </article>
  );
}

function Step({
  n,
  title,
  body,
}: {
  n: number;
  title: string;
  body: string;
}) {
  return (
    <div className="flex gap-5">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-ink font-display text-[15px] font-medium italic">
        {n}
      </div>
      <div>
        <h3 className="font-display text-[18px] font-medium leading-[1.1] text-ink md:text-[20px]">
          {title}
        </h3>
        <p className="mt-2 text-[14px] leading-[1.65] text-warm-muted md:text-[15px]">
          {body}
        </p>
      </div>
    </div>
  );
}
