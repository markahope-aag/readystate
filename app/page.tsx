import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-paper text-ink">
      {/* ═══ Masthead / Nav ══════════════════════════════════════════════ */}
      <header className="relative z-20 border-b border-ink">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-6 px-6 py-5 md:px-12">
          <BrandLogo variant="onLight" height={38} />
          <nav className="flex items-baseline gap-6 text-[13px]">
            <span className="eyebrow hidden md:inline">
              Vol. I · SB 553
            </span>
            <Link
              href="/assessment/new"
              className="link-editorial font-medium text-ink"
            >
              Start assessment →
            </Link>
          </nav>
        </div>
      </header>

      {/* ═══ Hero — editorial masthead ══════════════════════════════════ */}
      <section className="relative">
        <div className="mx-auto max-w-[1400px] px-6 pt-16 pb-24 md:px-12 md:pt-24 md:pb-32">
          {/* Grid-breaking issue meta */}
          <div className="mb-16 flex flex-wrap items-baseline justify-between gap-4 md:mb-24">
            <div className="flex items-baseline gap-6">
              <span className="eyebrow">California · 2026</span>
              <span className="eyebrow hidden md:inline">
                Labor Code §6401.9
              </span>
            </div>
            <span className="eyebrow">An instrument by Kestralis</span>
          </div>

          {/* The headline */}
          <div className="grid gap-12 md:grid-cols-12 md:gap-8">
            <div className="md:col-span-9">
              <h1 className="font-display text-[56px] font-light leading-[0.94] tracking-[-0.028em] text-ink md:text-[112px] lg:text-[140px]">
                Know your{" "}
                <span
                  className="italic"
                  style={{ fontFeatureSettings: '"ss01"' }}
                >
                  gaps
                </span>
                <span className="text-warm-muted">.</span>
              </h1>
            </div>
            <div className="mt-4 flex flex-col justify-end md:col-span-3 md:mt-0">
              <p className="eyebrow mb-2">The assessment</p>
              <p className="font-display text-2xl font-light italic leading-tight text-warm-muted md:text-[28px]">
                Forty questions.{"\u00A0"}Three standards.
                {"\u00A0"}One clear report.
              </p>
            </div>
          </div>

          {/* Thick rule under headline */}
          <div className="mt-16 h-px w-full bg-ink md:mt-20" />

          {/* Dek / body — two columns */}
          <div className="mt-16 grid gap-12 md:grid-cols-12 md:gap-16">
            <div className="md:col-span-5">
              <p className="eyebrow mb-4">The statute</p>
              <p className="font-display text-[22px] font-light leading-snug text-ink md:text-[26px]">
                California Labor Code{" "}
                <span className="italic">§6401.9</span> requires every
                employer in the state to have a written Workplace
                Violence Prevention Plan, documented training, and a
                Violent Incident Log.
              </p>
            </div>
            <div className="md:col-span-6 md:col-start-7">
              <p className="eyebrow mb-4">The instrument</p>
              <p className="text-[17px] leading-[1.65] text-ink md:text-[18px]">
                ReadyState is a 40-question compliance instrument that
                scores your workplace violence prevention program
                against the California statutory minimum, the ASIS
                professional standard, and the physical hazards of a
                specific site. Each submission produces a weighted
                score, a gap list sorted by severity, and remediation
                guidance for every critical failure — delivered as a
                PDF to your inbox.
              </p>
              <div className="mt-10 flex items-center gap-8">
                <Link
                  href="/assessment/new"
                  className="group relative inline-flex items-center gap-3 border-b border-ink pb-1 font-display text-[20px] font-medium italic text-ink"
                >
                  <span>Begin the assessment</span>
                  <span className="transition-transform duration-300 group-hover:translate-x-1">
                    →
                  </span>
                </Link>
                <span className="text-xs text-warm-muted">
                  Free · no sign-up · ~45 minutes
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Side-running ornament — only on large screens */}
        <div
          className="pointer-events-none absolute bottom-32 left-4 hidden select-none font-display text-[10px] uppercase tracking-[0.3em] text-warm-muted [writing-mode:vertical-rl] lg:block"
          aria-hidden
        >
          Vol. I · §6401.9 · Assessment instrument
        </div>
      </section>

      {/* ═══ The three standards — editorial feature section ═══════════ */}
      <section className="relative border-t border-ink bg-paper">
        <div className="mx-auto max-w-[1400px] px-6 py-24 md:px-12 md:py-32">
          {/* Section label */}
          <div className="mb-16 grid gap-12 md:mb-24 md:grid-cols-12">
            <div className="md:col-span-4">
              <p className="eyebrow mb-4">Section I</p>
              <h2 className="font-display text-5xl font-light leading-[0.95] tracking-[-0.02em] text-ink md:text-[72px]">
                The three
                <br />
                <span className="italic text-forest">standards</span>
                <span className="text-warm-muted">.</span>
              </h2>
            </div>
            <div className="md:col-span-6 md:col-start-7">
              <p className="first-letter-drop text-[17px] leading-[1.7] text-ink md:text-[18px]">
                Every ReadyState assessment scores your program across
                three dimensions. A gap in any one of them compounds
                risk in the others. The report surfaces each, ranked
                by severity, with concrete remediation guidance for
                every critical failure.
              </p>
            </div>
          </div>

          {/* Three standards — numbered editorial list */}
          <div className="space-y-0">
            <StandardEntry
              number="01"
              accent="Statutory"
              title="SB 553 Compliance"
              subtitle="California Labor Code §6401.9"
              count={18}
              description="Written plan, site-specific hazards, named responsible person, incident reporting procedure, Violent Incident Log, initial and annual training, five-year records retention. Failures here carry direct Cal/OSHA citation risk."
            />
            <StandardEntry
              number="02"
              accent="Professional standard"
              title="ASIS WVPI AA-2020"
              subtitle="ANSI/ASIS Workplace Violence Prevention and Intervention"
              count={12}
              description="Threat management team, documented behavioral threat assessment protocol, post-incident response plan, active-assailant procedures specific to the site. Program maturity beyond the statutory minimum."
            />
            <StandardEntry
              number="03"
              accent="Site profile"
              title="Hazard & Environment"
              subtitle="Physical controls and industry-specific risk"
              count={10}
              description="Physical security, access control, lone-worker monitoring, and the site's exposure to Type 2 (public-facing), Type 3 (worker-on-worker), and Type 4 (domestic spillover) violence. Environment-level vulnerabilities that amplify every other risk."
            />
          </div>
        </div>
      </section>

      {/* ═══ How it works — four-movement editorial ═════════════════════ */}
      <section className="relative border-t border-ink bg-paper-deep">
        <div className="mx-auto max-w-[1400px] px-6 py-24 md:px-12 md:py-32">
          <div className="mb-16 grid gap-12 md:mb-20 md:grid-cols-12">
            <div className="md:col-span-5">
              <p className="eyebrow mb-4">Section II</p>
              <h2 className="font-display text-5xl font-light leading-[0.95] tracking-[-0.02em] text-ink md:text-[72px]">
                The{" "}
                <span className="italic text-forest">instrument</span>,
                in four movements.
              </h2>
            </div>
          </div>

          <div className="grid gap-0 md:grid-cols-4">
            <Movement
              n="I"
              title="Scope"
              body="Tell us about the organization and the specific site. Every assessment is site-scoped — no averaging across facilities."
            />
            <Movement
              n="II"
              title="Answer"
              body="Forty weighted questions — Yes, Partial, No, or N/A — with optional evidence notes. Critical items must be answered before submission."
              divider
            />
            <Movement
              n="III"
              title="Score"
              body="Weighted scoring across three sections produces an overall rating from low to critical. Gaps are sorted by severity."
              divider
            />
            <Movement
              n="IV"
              title="Report"
              body="Enter your name and email. A Kestralis-branded PDF report with scores, gap list, and remediation guidance is delivered in minutes."
              divider
            />
          </div>
        </div>
      </section>

      {/* ═══ CTA — sober, final ═════════════════════════════════════════ */}
      <section className="relative border-t border-ink bg-ink text-paper">
        <div className="mx-auto max-w-[1400px] px-6 py-24 md:px-12 md:py-32">
          <div className="grid gap-12 md:grid-cols-12 md:items-end">
            <div className="md:col-span-8">
              <p className="eyebrow mb-6 text-sand">Colophon</p>
              <h2 className="font-display text-[56px] font-light leading-[0.95] tracking-[-0.025em] text-paper md:text-[96px]">
                Begin when{" "}
                <span className="italic text-sand">you&apos;re ready</span>
                <span className="text-warm-muted-soft">.</span>
              </h2>
            </div>
            <div className="md:col-span-4">
              <p className="mb-8 text-[16px] leading-[1.7] text-sand-soft">
                Free to use. No account required. The complete report
                lands in your inbox within minutes of finishing the
                questions.
              </p>
              <Link
                href="/assessment/new"
                className="group inline-flex items-center gap-3 border-b border-sand pb-1 font-display text-[22px] italic text-paper"
              >
                <span>Start the assessment</span>
                <span className="transition-transform duration-300 group-hover:translate-x-1">
                  →
                </span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ Colophon / Footer ═════════════════════════════════════════ */}
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
    </div>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────

function StandardEntry({
  number,
  accent,
  title,
  subtitle,
  count,
  description,
}: {
  number: string;
  accent: string;
  title: string;
  subtitle: string;
  count: number;
  description: string;
}) {
  return (
    <article className="group border-t border-ink/40 py-10 transition-colors hover:border-ink md:py-14">
      <div className="grid gap-6 md:grid-cols-12 md:gap-8">
        <div className="md:col-span-2">
          <span className="font-display text-5xl font-light italic leading-none text-forest md:text-[64px]">
            {number}
          </span>
        </div>
        <div className="md:col-span-6">
          <p className="eyebrow mb-3">{accent}</p>
          <h3 className="font-display text-[34px] font-light leading-[1] tracking-[-0.015em] text-ink md:text-[44px]">
            {title}
          </h3>
          <p className="mt-2 font-display text-[15px] italic text-warm-muted">
            {subtitle}
          </p>
        </div>
        <div className="md:col-span-4">
          <div className="mb-3 flex items-baseline justify-between border-b border-ink/20 pb-2">
            <span className="eyebrow">Questions</span>
            <span className="font-mono tabular-figures text-[20px] text-ink">
              {count.toString().padStart(2, "0")}
            </span>
          </div>
          <p className="text-[14px] leading-[1.6] text-warm-muted">
            {description}
          </p>
        </div>
      </div>
    </article>
  );
}

function Movement({
  n,
  title,
  body,
  divider = false,
}: {
  n: string;
  title: string;
  body: string;
  divider?: boolean;
}) {
  return (
    <div
      className={`relative py-8 pr-6 md:pr-10 ${
        divider ? "md:border-l md:border-ink/25 md:pl-10" : ""
      }`}
    >
      <p className="font-display text-[14px] italic text-forest">
        Movement {n}
      </p>
      <h3 className="mt-3 font-display text-[28px] font-medium leading-[1] tracking-[-0.015em] text-ink md:text-[32px]">
        {title}
      </h3>
      <p className="mt-5 text-[14px] leading-[1.65] text-warm-muted md:text-[15px]">
        {body}
      </p>
    </div>
  );
}
