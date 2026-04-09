"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function NewAssessmentError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[assessment/new] error", error);
  }, [error]);

  return (
    <main className="mx-auto max-w-3xl px-6 py-24">
      <Card>
        <CardContent className="space-y-4 p-10 text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-destructive">
            Assessment wizard failed
          </p>
          <h1 className="text-2xl font-semibold">Something went wrong</h1>
          <p className="text-sm text-muted-foreground">
            We couldn&apos;t load the assessment wizard. Any responses
            already saved are safe — your progress is stored on each
            click, not on submit.
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
