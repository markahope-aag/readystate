import Link from "next/link";
import { auth, currentUser } from "@clerk/nextjs/server";
import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function Home() {
  const { userId } = await auth();
  const user = userId ? await currentUser() : null;
  const displayName = user?.firstName ?? user?.emailAddresses[0]?.emailAddress ?? null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-md bg-primary" aria-hidden />
            <div className="leading-tight">
              <p className="text-sm font-semibold">ReadyState</p>
              <p className="text-xs text-muted-foreground">by Kestralis</p>
            </div>
          </div>
          <nav className="flex items-center gap-3">
            <Show when="signed-out">
              <SignInButton mode="modal">
                <button className="text-sm font-medium text-muted-foreground hover:text-foreground">
                  Sign in
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <Button size="sm">Get started</Button>
              </SignUpButton>
            </Show>
            <Show when="signed-in">
              <UserButton />
            </Show>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <main className="mx-auto max-w-3xl px-6 py-20 md:py-28">
        <div className="space-y-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            California SB 553 · ASIS WVPI AA-2020
          </p>
          <h1 className="text-4xl font-semibold leading-tight tracking-tight md:text-5xl">
            Workplace violence prevention,{" "}
            <span className="text-muted-foreground">assessed in an hour.</span>
          </h1>
          <p className="max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
            ReadyState scores your workplace violence prevention program
            against the California statutory minimum and the ASIS professional
            standard. Get a site-specific risk rating, a prioritized gap list,
            and a clear remediation path.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Show when="signed-in">
              <Link href="/assessment/new">
                <Button size="lg">
                  {displayName ? `Start assessment, ${displayName}` : "Start an assessment"}
                </Button>
              </Link>
            </Show>
            <Show when="signed-out">
              <SignUpButton mode="modal">
                <Button size="lg">Create an account to begin</Button>
              </SignUpButton>
              <SignInButton mode="modal">
                <Button size="lg" variant="outline">
                  Sign in
                </Button>
              </SignInButton>
            </Show>
          </div>
        </div>

        {/* What you get */}
        <section className="mt-20 grid gap-6 border-t pt-12 md:grid-cols-3">
          <FeatureCard
            title="40-question assessment"
            body="18 SB 553 statutory items, 12 ASIS professional-standard items, 10 site hazard profile items. Answer in any order, resume any time."
          />
          <FeatureCard
            title="Site-specific scoring"
            body="Weighted per-section scores and an overall risk rating from low to critical. Critical gaps must be answered before you can submit."
          />
          <FeatureCard
            title="Gap list + remediation"
            body="Every 'No' or 'Partial' is surfaced with the relevant statute reference and a plain-English description of what needs to change."
          />
        </section>
      </main>

      <footer className="border-t">
        <div className="mx-auto max-w-5xl px-6 py-6 text-xs text-muted-foreground">
          ReadyState is a Kestralis product. This tool provides structured
          self-assessment against California Labor Code §6401.9 and ASIS
          WVPI AA-2020 — not legal advice.
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold">{title}</h3>
      <p className="text-sm leading-relaxed text-muted-foreground">{body}</p>
    </div>
  );
}
