import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { RiskBadge } from "@/components/risk-badge";
import { ClickableTableRow } from "@/components/clickable-table-row";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import type { RiskLevel } from "@/lib/assessment/scoring";

export const dynamic = "force-dynamic";

interface SearchParams {
  risk?: string;
  status?: string;
  from?: string;
  to?: string;
  sort?: string;
  dir?: string;
}

export default async function HistoryPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/");

  const params = await searchParams;
  const rows = await getUserAssessments(userId);
  const filtered = applyFilters(rows, params);
  const sorted = applySort(filtered, params);

  const hasFilters = Boolean(
    params.risk || params.status || params.from || params.to,
  );

  return (
    <main className="mx-auto max-w-6xl space-y-8 px-6 py-10">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
            Assessment History
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Every assessment you&apos;ve created. Click any row to open the report.
          </p>
        </div>

        <FilterBar searchParams={params} />

        {rows.length === 0 ? (
          <FirstTimeEmptyState />
        ) : sorted.length === 0 ? (
          <NoResultsEmptyState />
        ) : (
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <SortableHeader
                    column="org"
                    label="Organization"
                    searchParams={params}
                  />
                  <SortableHeader
                    column="site"
                    label="Site"
                    searchParams={params}
                  />
                  <SortableHeader
                    column="updated_at"
                    label="Date"
                    searchParams={params}
                  />
                  <SortableHeader
                    column="status"
                    label="Status"
                    searchParams={params}
                  />
                  <SortableHeader
                    column="sb553"
                    label="SB 553"
                    searchParams={params}
                    align="right"
                  />
                  <SortableHeader
                    column="overall"
                    label="Overall"
                    searchParams={params}
                    align="right"
                  />
                  <SortableHeader
                    column="risk"
                    label="Risk"
                    searchParams={params}
                  />
                </TableRow>
              </TableHeader>
              <TableBody>
                {sorted.map((row) => (
                  <HistoryRow key={row.id} row={row} />
                ))}
              </TableBody>
            </Table>
          </Card>
        )}

        {sorted.length > 0 && (
          <p className="text-xs text-muted-foreground">
            {sorted.length} of {rows.length} assessment
            {rows.length === 1 ? "" : "s"}
            {hasFilters ? " shown (filters active)" : ""}
          </p>
        )}
    </main>
  );
}

// ─── Filtering / sorting (pure) ──────────────────────────────────────────────

function applyFilters(
  rows: UserAssessmentRow[],
  params: SearchParams,
): UserAssessmentRow[] {
  let result = rows;

  if (params.risk) {
    result = result.filter((r) => r.risk_level === params.risk);
  }
  if (params.status) {
    result = result.filter((r) => r.status === params.status);
  }
  if (params.from) {
    const fromDate = new Date(params.from);
    result = result.filter((r) => new Date(r.updated_at) >= fromDate);
  }
  if (params.to) {
    const toDate = new Date(params.to);
    toDate.setHours(23, 59, 59, 999);
    result = result.filter((r) => new Date(r.updated_at) <= toDate);
  }

  return result;
}

function applySort(
  rows: UserAssessmentRow[],
  params: SearchParams,
): UserAssessmentRow[] {
  const sort = params.sort ?? "updated_at";
  const dir = params.dir === "asc" ? 1 : -1;

  return [...rows].sort((a, b) => {
    const av = getSortValue(a, sort);
    const bv = getSortValue(b, sort);
    if (av == null && bv == null) return 0;
    if (av == null) return 1; // nulls always sort last
    if (bv == null) return -1;
    if (av < bv) return -1 * dir;
    if (av > bv) return 1 * dir;
    return 0;
  });
}

function getSortValue(
  row: UserAssessmentRow,
  col: string,
): string | number | null {
  switch (col) {
    case "org":
      return row.org_name?.toLowerCase() ?? null;
    case "site":
      return row.site_name?.toLowerCase() ?? null;
    case "updated_at":
      return row.updated_at;
    case "status":
      return row.status;
    case "sb553":
      return row.sb553_score;
    case "overall":
      return row.overall_score;
    case "risk":
      return riskOrder(row.risk_level);
    default:
      return row.updated_at;
  }
}

// Map risk level to a numeric severity for sortability
function riskOrder(level: RiskLevel | null): number | null {
  if (!level) return null;
  switch (level) {
    case "critical":
      return 4;
    case "high":
      return 3;
    case "moderate":
      return 2;
    case "low":
      return 1;
  }
}

function buildSortHref(column: string, params: SearchParams): string {
  const next = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v) next.set(k, String(v));
  }
  const dir =
    params.sort === column && params.dir === "asc" ? "desc" : "asc";
  next.set("sort", column);
  next.set("dir", dir);
  return `/history?${next.toString()}`;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function FilterBar({ searchParams }: { searchParams: SearchParams }) {
  return (
    <Card>
      <CardContent className="p-4">
        <form className="flex flex-wrap items-end gap-3">
          <FilterSelect
            label="Risk level"
            name="risk"
            defaultValue={searchParams.risk}
            options={[
              { value: "", label: "All" },
              { value: "critical", label: "Critical" },
              { value: "high", label: "High" },
              { value: "moderate", label: "Moderate" },
              { value: "low", label: "Low" },
            ]}
          />
          <FilterSelect
            label="Status"
            name="status"
            defaultValue={searchParams.status}
            options={[
              { value: "", label: "All" },
              { value: "complete", label: "Complete" },
              { value: "in_progress", label: "In Progress" },
            ]}
          />
          <div className="space-y-1">
            <label
              htmlFor="from"
              className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground"
            >
              From
            </label>
            <Input
              id="from"
              type="date"
              name="from"
              defaultValue={searchParams.from ?? ""}
              className="h-10 w-[160px]"
            />
          </div>
          <div className="space-y-1">
            <label
              htmlFor="to"
              className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground"
            >
              To
            </label>
            <Input
              id="to"
              type="date"
              name="to"
              defaultValue={searchParams.to ?? ""}
              className="h-10 w-[160px]"
            />
          </div>
          {searchParams.sort && (
            <input type="hidden" name="sort" value={searchParams.sort} />
          )}
          {searchParams.dir && (
            <input type="hidden" name="dir" value={searchParams.dir} />
          )}
          <div className="flex gap-2 pt-5">
            <Button type="submit" size="sm">
              Apply
            </Button>
            <Link href="/history">
              <Button type="button" variant="ghost" size="sm">
                Clear
              </Button>
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function FilterSelect({
  label,
  name,
  defaultValue,
  options,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <div className="space-y-1">
      <label
        htmlFor={name}
        className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground"
      >
        {label}
      </label>
      <select
        id={name}
        name={name}
        defaultValue={defaultValue ?? ""}
        className="flex h-10 min-w-[140px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function SortableHeader({
  column,
  label,
  searchParams,
  align = "left",
}: {
  column: string;
  label: string;
  searchParams: SearchParams;
  align?: "left" | "right";
}) {
  const isActive = searchParams.sort === column;
  const arrow = !isActive ? "" : searchParams.dir === "asc" ? " ↑" : " ↓";
  return (
    <TableHead className={cn(align === "right" && "text-right")}>
      <Link
        href={buildSortHref(column, searchParams)}
        className={cn(
          "inline-flex items-center gap-0.5 hover:text-foreground",
          isActive && "text-foreground",
        )}
      >
        {label}
        {arrow}
      </Link>
    </TableHead>
  );
}

function HistoryRow({ row }: { row: UserAssessmentRow }) {
  const href =
    row.status === "complete" && row.overall_score != null
      ? `/assessment/${row.id}/results`
      : `/assessment/new?id=${row.id}`;

  return (
    <ClickableTableRow href={href}>
      <TableCell className="font-medium">{row.org_name ?? "—"}</TableCell>
      <TableCell className="text-sm text-muted-foreground">
        {row.site_name ?? "—"}
      </TableCell>
      <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
        {formatDate(row.updated_at)}
      </TableCell>
      <TableCell>
        <StatusPill status={row.status} />
      </TableCell>
      <TableCell className="text-right font-mono text-sm">
        {row.sb553_score != null ? `${row.sb553_score}%` : "—"}
      </TableCell>
      <TableCell className="text-right font-mono text-sm font-semibold">
        {row.overall_score != null ? `${row.overall_score}%` : "—"}
      </TableCell>
      <TableCell>
        {row.risk_level ? (
          <RiskBadge level={row.risk_level} size="sm" />
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        )}
      </TableCell>
    </ClickableTableRow>
  );
}

function StatusPill({ status }: { status: "in_progress" | "complete" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
        status === "complete"
          ? "border-emerald-200 bg-emerald-50 text-emerald-900"
          : "border-sky-200 bg-sky-50 text-sky-900",
      )}
    >
      {status === "complete" ? "Complete" : "In progress"}
    </span>
  );
}

function FirstTimeEmptyState() {
  return (
    <Card>
      <CardContent className="space-y-4 p-12 text-center">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold">No assessments yet</h3>
          <p className="text-sm text-muted-foreground">
            Start your first SB 553 assessment to see it here.
          </p>
        </div>
        <Link href="/assessment/new">
          <Button size="lg">Start your first assessment</Button>
        </Link>
      </CardContent>
    </Card>
  );
}

function NoResultsEmptyState() {
  return (
    <Card>
      <CardContent className="space-y-3 p-10 text-center">
        <p className="text-sm font-medium">
          No assessments match your filters.
        </p>
        <Link href="/history">
          <Button variant="outline" size="sm">
            Clear filters
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
