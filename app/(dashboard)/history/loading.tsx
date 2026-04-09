import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function HistoryLoading() {
  return (
    <main className="mx-auto max-w-6xl space-y-8 px-6 py-10">
      <div className="space-y-2">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>

      {/* Filter bar */}
      <Card>
        <CardContent className="flex flex-wrap gap-3 p-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-1">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-10 w-40" />
            </div>
          ))}
          <div className="flex gap-2 self-end">
            <Skeleton className="h-9 w-16" />
            <Skeleton className="h-9 w-16" />
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="border-b p-4">
            <Skeleton className="h-4 w-full" />
          </div>
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-4 border-b p-4 last:border-0"
            >
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-5 w-20 rounded-full" />
              <div className="flex-1" />
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    </main>
  );
}
