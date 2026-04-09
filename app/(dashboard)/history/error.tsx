"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function HistoryError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[history] error", error);
  }, [error]);

  return (
    <main className="mx-auto max-w-3xl px-6 py-24">
      <Card>
        <CardContent className="space-y-4 p-10 text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-destructive">
            History failed to load
          </p>
          <h1 className="text-2xl font-semibold">Something went wrong</h1>
          <p className="text-sm text-muted-foreground">
            We couldn&apos;t load your assessment history. Try again, or
            clear your filters and reload.
          </p>
          {error.digest && (
            <p className="text-[11px] text-muted-foreground/70">
              Error ID: <span className="font-mono">{error.digest}</span>
            </p>
          )}
          <div className="flex justify-center gap-2 pt-2">
            <Button onClick={reset}>Try again</Button>
            <Link href="/dashboard">
              <Button variant="outline">Dashboard</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
