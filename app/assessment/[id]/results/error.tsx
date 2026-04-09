"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function ResultsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[assessment/results] error", error);
  }, [error]);

  return (
    <main className="mx-auto max-w-3xl px-6 py-24">
      <Card>
        <CardContent className="space-y-4 p-10 text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-destructive">
            Report failed to load
          </p>
          <h1 className="text-2xl font-semibold">Something went wrong</h1>
          <p className="text-sm text-muted-foreground">
            We couldn&apos;t load this assessment report. Your data is
            safe — this is usually a transient error on our side.
          </p>
          {error.digest && (
            <p className="text-[11px] text-muted-foreground/70">
              Error ID: <span className="font-mono">{error.digest}</span>
            </p>
          )}
          <div className="flex justify-center gap-2 pt-2">
            <Button onClick={reset}>Try again</Button>
            <Link href="/history">
              <Button variant="outline">Back to history</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
