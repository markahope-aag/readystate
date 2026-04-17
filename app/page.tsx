import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-white text-[color:var(--color-body)]">
      {/* ═══ Nav ═══════════════════════════════════════════════════════════ */}
      <header className="sticky top-0 z-20 border-b border-[color:var(--color-border)] bg-white">
        <div className="mx-auto flex max-w-[960px] items-center justify-between gap-6 px-6 h-16">
          <BrandLogo variant="onLight" height={24} />
          <div className="flex items-center gap-6">
            <a href="https://kestralisgroup.com" target="_blank" rel="noopener noreferrer" className="hidden md:block text-[0.6875rem] font-medium uppercase tracking-[0.1em] text-[color:var(--color-muted)] hover:text-[color:var(--color-navy)] transition-colors">
              A Kestralis product
            </a>
            <Link href="/assessment/new" className="btn btn-primary text-xs px-5 py-2.5">
              Start Assessment
            </Link>
          </div>
        </div>
      </header>

      {/* ═══ Hero ══════════════════════════════════════════════════════════ */}
      <section className="border-t-2 border-[color:var(--color-navy)]">
        <div className="mx-auto max-w-[960px] px-6 pt-24 pb-20 md:pt-28 md:pb-24">
          <p className="eyebrow">— SB 553 Compliance Assessment</p>

          <h1 className="mt-6 text-[clamp(2.5rem,2rem+2.5vw,4rem)] font-bold leading-[1.06] tracking-[-0.02em] text-[color:var(--color-navy)] max-w-[16ch]">
            Not just a plan. An effective prevention program.
          </h1>

          <p className="mt-6 text-[1.0625rem] leading-[1.75] text-[color:var(--color-body)] max-w-[60ch]">
            SB 553 requires every California employer to have a written
            Workplace Violence Prevention Plan — but a plan that sits in a
            binder isn&rsquo;t a prevention program. ReadyState evaluates
            whether your program is <strong>actually effective</strong>:
            implemented, maintained, and capable of preventing violence
            before it happens.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-6">
            <Link href="/assessment/new" className="btn btn-primary">
              Start Your Assessment →
            </Link>
            <span className="text-[0.75rem] text-[color:var(--color-muted)]">
              Free · no sign-up · ~45 minutes
            </span>
          </div>
        </div>
      </section>

      {/* ═══ Blockquote ═══════════════════════════════════════════════════ */}
      <div className="mx-auto max-w-[960px] px-6">
        <blockquote className="bg-[color:var(--color-gray-light)] border-l-4 border-[color:var(--color-navy)] rounded-r-sm px-8 py-6 my-0">
          <p className="text-[1.0625rem] leading-[1.65] italic text-[color:var(--color-body)]">
            &ldquo;An employer shall establish, implement and maintain an
            effective workplace violence prevention plan.&rdquo;
          </p>
          <cite className="mt-3 block text-[0.6875rem] font-semibold uppercase tracking-[0.1em] text-[color:var(--color-blue)] not-italic">
            — California SB 553
          </cite>
        </blockquote>
      </div>

      {/* ═══ Prevention vs. Reaction ═══════════════════════════════════════ */}
      <section className="bg-[color:var(--color-gray-light)]">
        <div className="mx-auto max-w-[960px] px-6 py-[clamp(4rem,6vw,8rem)]">
          <p className="eyebrow">— The Distinction</p>
          <h2 className="mt-5 text-[clamp(1.75rem,1.25rem+2vw,2.75rem)] font-semibold tracking-[-0.012em] text-[color:var(--color-navy)]">
            Prevention is not reaction.
          </h2>

          <div className="mt-14 grid gap-8 md:grid-cols-2 md:gap-10">
            {/* Prevention card */}
            <div className="bg-white border border-[color:var(--color-border)] border-l-[3px] border-l-[color:var(--color-navy)] rounded-sm p-8">
              <h3 className="text-[1.125rem] font-bold text-[color:var(--color-navy)]">Prevention</h3>
              <p className="mt-3 text-[0.875rem] leading-[1.65] text-[color:var(--color-body)]">
                Proactive, systematic measures to identify and eliminate
                risk before violence occurs.
              </p>
              <ul className="mt-5 space-y-3 text-[0.875rem] text-[color:var(--color-body)]">
                <BulletItem>Detection and management of leading indicators</BulletItem>
                <BulletItem>Identification and intervention of behavioral indicators of violence risk</BulletItem>
                <BulletItem>Conflict resolution training and clear zero-tolerance policies</BulletItem>
                <BulletItem>Secure building access and environmental controls</BulletItem>
                <BulletItem>Background checks and pre-employment screening</BulletItem>
              </ul>
            </div>

            {/* Reaction card */}
            <div className="bg-white border border-[color:var(--color-border)] border-l-[3px] border-l-[color:var(--color-muted)] rounded-sm p-8">
              <h3 className="text-[1.125rem] font-bold text-[color:var(--color-navy)]">Reaction</h3>
              <p className="mt-3 text-[0.875rem] leading-[1.65] text-[color:var(--color-body)]">
                Immediate, tactical actions taken during or after an incident.
              </p>
              <ul className="mt-5 space-y-3 text-[0.875rem] text-[color:var(--color-muted)]">
                <BulletItem muted>Emergency lockdowns</BulletItem>
                <BulletItem muted>Run-Hide-Fight or equivalent protocols</BulletItem>
                <BulletItem muted>Calling 911 / law enforcement</BulletItem>
                <BulletItem muted>Post-incident trauma counseling</BulletItem>
                <BulletItem muted>Critical incident stress debriefing</BulletItem>
              </ul>
            </div>
          </div>

          {/* SB 553 mandates prevention callout */}
          <div className="mt-14 bg-[color:var(--color-navy)] text-white rounded-sm px-8 py-6">
            <p className="text-[1.0625rem] leading-[1.65] font-semibold">
              SB 553 mandates prevention.{" "}
              <span className="font-normal text-[color:var(--color-blue-light)]">
                Most organizations have reactive protocols but lack the
                proactive, systematic prevention infrastructure the statute
                requires. ReadyState identifies where your program falls
                short — and what to fix first.
              </span>
            </p>
          </div>
        </div>
      </section>

      {/* ═══ 10 Assessment Areas ══════════════════════════════════════════ */}
      <section className="bg-white">
        <div className="mx-auto max-w-[960px] px-6 py-[clamp(4rem,6vw,8rem)]">
          <p className="eyebrow">— The Assessment</p>
          <h2 className="mt-5 text-[clamp(1.75rem,1.25rem+2vw,2.75rem)] font-semibold tracking-[-0.012em] text-[color:var(--color-navy)]">
            Every requirement, evaluated.
          </h2>

          <ol className="mt-14 border-t-2 border-[color:var(--color-navy)]">
            <RequirementEntry number="01" title="Written Plan & Accessibility" description="Is there a written plan? Is it site-specific? Accessible to all employees, their representatives, and Cal/OSHA?" />
            <RequirementEntry number="02" title="Responsible Persons & Administration" description="Are named individuals responsible for implementation? Are roles clearly differentiated?" />
            <RequirementEntry number="03" title="Employee Involvement" description="Are employees actively involved in developing AND implementing the plan — including hazard identification and reporting?" />
            <RequirementEntry number="04" title="Hazard Identification & Correction" description="Are hazards identified periodically, after each incident, and when new hazards emerge? Are corrections timely?" />
            <RequirementEntry number="05" title="Training Program" description="Is training provided initially and annually? Is it language-appropriate with interactive Q&A?" />
            <RequirementEntry number="06" title="Reporting, Response & Anti-Retaliation" description="Can employees report incidents without fear of reprisal? Are investigations conducted and results communicated?" />
            <RequirementEntry number="07" title="Emergency Response Procedures" description="Can employees be alerted to emergencies? Are evacuation and sheltering plans feasible?" />
            <RequirementEntry number="08" title="Violent Incident Log" description="Are all incidents recorded with required fields — date, time, location, WPV type, description, circumstances, and consequences?" />
            <RequirementEntry number="09" title="Recordkeeping" description="Are hazard records and incident logs retained for 5 years? Training records for 1 year? Available to Cal/OSHA on request?" />
            <RequirementEntry number="10" title="Plan Review & Continuous Improvement" description="Is the plan reviewed annually, after every deficiency, and following each incident?" />
          </ol>
        </div>
      </section>

      {/* ═══ How It Works ═════════════════════════════════════════════════ */}
      <section className="bg-[color:var(--color-gray-light)]">
        <div className="mx-auto max-w-[960px] px-6 py-[clamp(4rem,6vw,8rem)]">
          <p className="eyebrow">— How It Works</p>
          <h2 className="mt-5 text-[clamp(1.75rem,1.25rem+2vw,2.75rem)] font-semibold tracking-[-0.012em] text-[color:var(--color-navy)]">
            Evaluate. Score. Fix.
          </h2>

          <div className="mt-14 grid gap-12 md:grid-cols-3 md:gap-10">
            <Step n="01" title="Scope your site" body="Enter your organization details and the specific site being evaluated. Every assessment is scoped to one physical location." />
            <Step n="02" title="Evaluate each requirement" body="Rate your program's compliance across every SB 553 statutory requirement — an honest evaluation of whether each area is actually working." />
            <Step n="03" title="Get your report" body="Receive a Kestralis-branded PDF report with your compliance score, gap analysis sorted by severity, and concrete remediation guidance." />
          </div>
        </div>
      </section>

      {/* ═══ Bottom CTA ═══════════════════════════════════════════════════ */}
      <section className="bg-[color:var(--color-navy)] text-white">
        <div className="mx-auto max-w-[960px] px-6 py-20 md:py-28 text-center">
          <h2 className="text-[clamp(2rem,1.5rem+2vw,3rem)] font-bold text-white">
            Start your assessment.
          </h2>
          <p className="mt-4 text-[color:var(--color-blue-light)] max-w-lg mx-auto">
            Free. No account required. Report delivered to inbox.
          </p>
          <div className="mt-10">
            <Link href="/assessment/new" className="btn btn-ghost-light text-base px-10 py-4">
              Start Assessment →
            </Link>
          </div>
          <p className="mt-6 text-[0.75rem] text-white/40">
            Free. No account required. Report delivered to inbox.
          </p>
        </div>
      </section>

      {/* ═══ Footer ═══════════════════════════════════════════════════════ */}
      <footer className="bg-[color:var(--color-ink)] text-white/60">
        <div className="mx-auto max-w-[960px] px-6 py-8">
          <div className="flex flex-col items-center gap-4 md:flex-row md:justify-between">
            <BrandLogo variant="onDark" height={20} asLink={false} />
            <span className="text-[0.75rem]">readystate.now</span>
          </div>
          <p className="mt-6 text-center text-[0.75rem] text-white/40">
            A product of <a href="https://kestralisgroup.com" target="_blank" rel="noopener noreferrer" className="hover:text-white/60 transition-colors underline underline-offset-2">Kestralis Group, LLC</a> · California, 2026. Not legal advice.
          </p>
        </div>
      </footer>
    </div>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────

function BulletItem({ children, muted }: { children: React.ReactNode; muted?: boolean }) {
  return (
    <li className="flex items-start gap-3">
      <span className={`mt-[0.55rem] h-[2px] w-4 shrink-0 ${muted ? "bg-[color:var(--color-muted)]" : "bg-[color:var(--color-navy)]"}`} />
      <span className="leading-[1.55]">{children}</span>
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
    <li className="group border-b border-[color:var(--color-navy)]/15 py-7 md:py-9 transition-all hover:translate-x-1 relative">
      <span
        aria-hidden
        className="absolute left-[-1rem] top-0 bottom-0 w-[3px] bg-[color:var(--color-blue)] scale-y-0 origin-top group-hover:scale-y-100 transition-transform duration-300"
      />
      <div className="grid grid-cols-1 md:grid-cols-12 gap-y-2 md:gap-x-8 md:items-baseline">
        <span className="md:col-span-1 text-[2rem] font-bold text-[color:var(--color-blue-light)] tabular-figures leading-none">
          {number}
        </span>
        <h3 className="md:col-span-4 text-[1.0625rem] font-semibold text-[color:var(--color-navy)]">
          {title}
        </h3>
        <p className="md:col-span-7 text-[0.875rem] leading-[1.65] text-[color:var(--color-body)]">
          {description}
        </p>
      </div>
    </li>
  );
}

function Step({
  n,
  title,
  body,
}: {
  n: string;
  title: string;
  body: string;
}) {
  return (
    <div>
      <span className="block text-[5rem] font-bold leading-none text-[color:var(--color-blue-light)]">
        {n}
      </span>
      <h3 className="mt-4 text-[1.125rem] font-semibold text-[color:var(--color-navy)]">
        {title}
      </h3>
      <p className="mt-2 text-[0.875rem] leading-[1.65] text-[color:var(--color-body)]">
        {body}
      </p>
    </div>
  );
}
