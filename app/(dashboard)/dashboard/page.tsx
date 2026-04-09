import Link from "next/link";
import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { AppHeader } from "@/components/app-header";
import { RiskBadge } from "@/components/risk-badge";
import { ClickableTableRow } from "@/components/clickable-table-row";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import {
  getUserAssessments,
  type UserAssessmentRow,
} from "@/lib/assessment/queries";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect("/");

  const [user, assessments] = await Promise.all([
    currentUser(),
    getUserAssessments(userId),
  ]);

  const firstName = user?.firstName ?? null;
  const stats = computeStats(assessments);
  const recent = assessments.slice(0, 5);

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="mx-auto max-w-6xl space-y-10 px-6 py-10">
        {/* ── Welcome ─────────────────────────────────────────────────── */}
        <div>
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
            Welcome
            {firstName ? (
              <>
                ,{" "}
                <span className="text-muted-foreground">{firstName}</span>
              </>
            ) : (
              " back"
            )}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Workplace violence prevention assessments for your organization.
          </p>
        </div>

        {/* ── Stats row ───────────────────────────────────────────────── */}
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total Assessments" value={stats.total} />
          <StatCard
            label="Average Score"
            value={stats.avgScore !== null ? `${stats.avgScore}%` : "—"}
          />
          <StatCard
            label="Critical Risk"
            value={stats.criticalCount}
            tone={stats.criticalCount > 0 ? "alert" : "default"}
          />
          <StatCard
            label="Completed This Month"
            value={stats.thisMonthCompleted}
          />
        </section>

        {/* ── Recent assessments ──────────────────────────────────────── */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Recent Assessments</h2>
            {assessments.length > 5 && (
              <Link
                href="/history"
                className="text-sm text-primary underline-offset-4 hover:underline"
              >
                View all →
              </Link>
            )}
          </div>
          {recent.length === 0 ? (
            <EmptyRecentState />
          ) : (
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Organization / Site</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">SB 553</TableHead>
                    <TableHead className="text-right">Overall</TableHead>
                    <TableHead>Risk</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recent.map((a) => (
                    <AssessmentRow key={a.id} assessment={a} />
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}
        </section>

        {/* ── CTA + quick reference ───────────────────────────────────── */}
        <section className="grid gap-4 md:grid-cols-2">
          <StartNewAssessmentCTA />
          <QuickReferenceCard />
        </section>
      </main>
    </div>
  );
}

// ─── Stats ────────────────────────────────────────────────────────────────────

interface Stats {
  total: number;
  avgScore: number | null;
  criticalCount: number;
  thisMonthCompleted: number;
}

function computeStats(assessments: UserAssessmentRow[]): Stats {
  const total = assessments.length;
  const completed = assessments.filter((a) => a.status === "complete");
  const scored = completed.filter((a) => a.overall_score != null);

  const avgScore =
    scored.length > 0
      ? Math.round(
          scored.reduce((sum, a) => sum + (a.overall_score ?? 0), 0) /
            scored.length,
        )
      : null;

  const criticalCount = scored.filter(
    (a) => a.risk_level === "critical",
  ).length;

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);
  const thisMonthCompleted = completed.filter(
    (a) => new Date(a.updated_at) >= startOfMonth,
  ).length;

  return { total, avgScore, criticalCount, thisMonthCompleted };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string | number;
  tone?: "default" | "alert";
}) {
  const isAlert = tone === "alert" && value !== 0 && value !== "0";
  return (
    <Card>
      <CardContent className="space-y-1 p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <p
          className={cn(
            "text-3xl font-bold leading-none tracking-tight",
            isAlert && "text-destructive",
          )}
        >
          {value}
        </p>
      </CardContent>
    </Card>
  );
}

function AssessmentRow({ assessment }: { assessment: UserAssessmentRow }) {
  const href =
    assessment.status === "complete" && assessment.overall_score != null
      ? `/assessment/${assessment.id}/results`
      : `/assessment/new?id=${assessment.id}`;
  const actionLabel =
    assessment.status === "complete" ? "View report" : "Resume";

  return (
    <ClickableTableRow href={href}>
      <TableCell>
        <div className="font-medium">{assessment.org_name ?? "—"}</div>
        <div className="text-xs text-muted-foreground">
          {assessment.site_name ?? "—"}
        </div>
      </TableCell>
      <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
        {formatDate(assessment.updated_at)}
      </TableCell>
      <TableCell className="text-right font-mono text-sm">
        {assessment.sb553_score != null ? `${assessment.sb553_score}%` : "—"}
      </TableCell>
      <TableCell className="text-right font-mono text-sm font-semibold">
        {assessment.overall_score != null
          ? `${assessment.overall_score}%`
          : "—"}
      </TableCell>
      <TableCell>
        {assessment.risk_level ? (
          <RiskBadge level={assessment.risk_level} size="sm" />
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        )}
      </TableCell>
      <TableCell className="text-right">
        <span className="whitespace-nowrap text-xs font-medium text-primary">
          {actionLabel} →
        </span>
      </TableCell>
    </ClickableTableRow>
  );
}

function EmptyRecentState() {
  return (
    <Card>
      <CardContent className="space-y-3 p-10 text-center">
        <p className="text-sm text-muted-foreground">
          You haven&apos;t started any assessments yet.
        </p>
        <Link href="/assessment/new">
          <Button>Start your first assessment</Button>
        </Link>
      </CardContent>
    </Card>
  );
}

function StartNewAssessmentCTA() {
  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardContent className="space-y-3 p-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">
          Ready to assess another site?
        </p>
        <h3 className="text-lg font-semibold">Start a new assessment</h3>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Each assessment is scoped to a single site. 40 questions across
          three sections, typically 30–60 minutes to complete.
        </p>
        <Link href="/assessment/new" className="inline-block">
          <Button>Start New Assessment</Button>
        </Link>
      </CardContent>
    </Card>
  );
}

function QuickReferenceCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">SB 553 Quick Reference</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Fact label="Effective date" value="July 1, 2024" />
        <Fact
          label="Covered employers"
          value="All California employers (with limited exceptions)"
        />
        <Fact
          label="Core requirements"
          value="Written plan, annual review, initial + annual training, violent incident log"
        />
        <Fact
          label="Records retention"
          value="Minimum 5 years for training, logs, and hazard records"
        />
        <Fact
          label="Enforcement"
          value="Cal/OSHA citations under standard enforcement process"
        />
      </CardContent>
    </Card>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>
      <dd className="text-sm leading-snug">{value}</dd>
    </div>
  );
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
