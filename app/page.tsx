import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* ═══ Top nav ═══════════════════════════════════════════════════ */}
      <header className="absolute inset-x-0 top-0 z-10 border-b border-white/10">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-md bg-white" aria-hidden />
            <div className="leading-tight text-white">
              <p className="text-sm font-semibold tracking-tight">
                ReadyState
              </p>
              <p className="text-[10px] text-slate-400">by Kestralis</p>
            </div>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/assessment/new">
              <Button
                size="sm"
                className="bg-white text-slate-900 hover:bg-slate-200"
              >
                Start assessment
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* ═══ Hero ══════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-slate-950 pt-24 text-white">
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
          aria-hidden
        />
        <div
          className="absolute inset-x-0 top-0 h-[500px] opacity-40"
          style={{
            background:
              "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(56,189,248,0.25), transparent)",
          }}
          aria-hidden
        />

        <div className="relative mx-auto max-w-5xl px-6 py-28 md:py-36">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-300">
            California SB 553 · Compliance Assessment
          </p>
          <h1 className="mt-5 max-w-4xl text-4xl font-bold leading-[1.05] tracking-tight md:text-6xl">
            SB 553 Compliance{" "}
            <span className="text-slate-400">Assessment.</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-300 md:text-xl">
            California Labor Code §6401.9 requires every employer in the
            state to have a written Workplace Violence Prevention Plan,
            documented training, and a Violent Incident Log. ReadyState
            scores your program, surfaces the gaps, and emails a prioritized
            remediation report.
          </p>

          <div className="mt-12 flex flex-wrap items-center gap-3">
            <Link href="/assessment/new">
              <Button
                size="lg"
                className="bg-white text-slate-900 hover:bg-slate-200"
              >
                Start My Assessment
              </Button>
            </Link>
            <p className="text-sm text-slate-400">
              Free · No sign-up · ~45 minutes
            </p>
          </div>

          {/* Trust strip */}
          <dl className="mt-20 grid grid-cols-1 gap-8 border-t border-white/10 pt-10 sm:grid-cols-3">
            <TrustStat
              value="40"
              label="Weighted questions"
              detail="SB 553 · ASIS · Site hazard"
            />
            <TrustStat
              value="3"
              label="Scoring dimensions"
              detail="Statutory · Standard · Site"
            />
            <TrustStat
              value="< 60 min"
              label="Typical completion"
              detail="Per site, PDF delivered by email"
            />
          </dl>
        </div>
      </section>

      {/* ═══ What it assesses ════════════════════════════════════════ */}
      <section className="bg-background">
        <div className="mx-auto max-w-6xl px-6 py-24 md:py-32">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              What ReadyState assesses
            </p>
            <h2 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl">
              Three dimensions of workplace violence risk.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              Each assessment scores your program against the statutory
              minimum, the professional standard, and the physical conditions
              of a specific site. A gap in any dimension is surfaced with
              concrete remediation guidance in the report we email you.
            </p>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-3">
            <FeatureCard
              tag="Statutory"
              tagClass="text-red-600"
              title="SB 553 Compliance"
              questionCount={18}
              description="California Labor Code §6401.9 minimums — written plan, site-specific hazards, named responsible person, incident reporting, Violent Incident Log, training, and 5-year records retention. Failures here carry direct Cal/OSHA citation risk."
            />
            <FeatureCard
              tag="Professional standard"
              tagClass="text-sky-600"
              title="ASIS WVPI AA-2020"
              questionCount={12}
              description="ANSI/ASIS Workplace Violence Prevention and Intervention standard. Threat management team, behavioral threat assessment protocol, post-incident response, and active-assailant procedures. Program maturity beyond statutory minimums."
            />
            <FeatureCard
              tag="Site profile"
              tagClass="text-amber-600"
              title="Site Hazard Profile"
              questionCount={10}
              description="Physical security controls, access control, lone-worker monitoring, and industry-specific risk factors (Type 2 public-facing, Type 3 worker-on-worker, Type 4 domestic spillover). Environment-level vulnerabilities that amplify risk."
            />
          </div>
        </div>
      </section>

      {/* ═══ How it works ════════════════════════════════════════════ */}
      <section className="bg-slate-50">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <div className="grid gap-12 md:grid-cols-2 md:gap-20">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                How it works
              </p>
              <h2 className="mt-4 text-3xl font-bold tracking-tight">
                Assess once. Get the report. Remediate with intent.
              </h2>
            </div>
            <div className="space-y-8">
              <Step
                n={1}
                title="Scope the assessment"
                body="Tell us about the organization and the specific site. Each assessment is site-scoped — no averaging across facilities."
              />
              <Step
                n={2}
                title="Answer 40 questions"
                body="Yes / Partial / No / N/A per question with optional evidence notes. Critical items are flagged and must be answered before submission."
              />
              <Step
                n={3}
                title="Get your report by email"
                body="Enter your name, email, and role on the final page. We generate a Kestralis-branded PDF report with scores, gap analysis, and remediation guidance — delivered to your inbox in minutes."
              />
              <Step
                n={4}
                title="Fix and re-assess"
                body="Close the gaps, re-run the assessment whenever you want, and track your score over time."
              />
            </div>
          </div>
        </div>
      </section>

      {/* ═══ CTA ═════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-slate-950 text-white">
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
          aria-hidden
        />
        <div className="relative mx-auto max-w-4xl px-6 py-24 text-center md:py-32">
          <h2 className="text-3xl font-bold tracking-tight md:text-5xl">
            Start your assessment now.
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-300">
            Free. No account required. The report lands in your inbox
            within minutes of finishing the questions.
          </p>
          <div className="mt-10 flex justify-center">
            <Link href="/assessment/new">
              <Button
                size="lg"
                className="bg-white text-slate-900 hover:bg-slate-200"
              >
                Start My Assessment
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ Footer ═══════════════════════════════════════════════════ */}
      <footer className="border-t border-slate-200 bg-background">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-6 py-10 text-xs text-muted-foreground md:flex-row md:items-center md:justify-between">
          <p>
            ReadyState is a Kestralis product. Structured self-assessment
            against California Labor Code §6401.9 and ASIS WVPI AA-2020 —
            not legal advice.
          </p>
          <p className="text-muted-foreground/70">
            Powered by Sentinel Ridge Security
          </p>
        </div>
      </footer>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function TrustStat({
  value,
  label,
  detail,
}: {
  value: string;
  label: string;
  detail: string;
}) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wider text-slate-400">
        {label}
      </dt>
      <dd className="mt-2 text-3xl font-bold text-white">{value}</dd>
      <dd className="mt-1 text-xs text-slate-500">{detail}</dd>
    </div>
  );
}

function FeatureCard({
  tag,
  tagClass,
  title,
  questionCount,
  description,
}: {
  tag: string;
  tagClass: string;
  title: string;
  questionCount: number;
  description: string;
}) {
  return (
    <div className="group relative flex flex-col rounded-xl border bg-card p-7 transition-shadow hover:shadow-lg">
      <div className="mb-5 flex items-center justify-between">
        <span
          className={cn(
            "text-[11px] font-semibold uppercase tracking-[0.15em]",
            tagClass,
          )}
        >
          {tag}
        </span>
        <span className="text-xs font-semibold text-muted-foreground">
          {questionCount} questions
        </span>
      </div>
      <h3 className="text-xl font-bold tracking-tight">{title}</h3>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
    </div>
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
    <div className="flex gap-4">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-slate-900 text-sm font-bold">
        {n}
      </div>
      <div>
        <h3 className="text-base font-semibold">{title}</h3>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
          {body}
        </p>
      </div>
    </div>
  );
}
