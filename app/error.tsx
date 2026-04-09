"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

/**
 * Global error boundary. Catches uncaught errors from any page in the app
 * except in the root layout. Must be a client component and accept
 * `error` + `reset` props per the Next.js contract.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Server logs capture this via the next/error boundary flow.
    // Adding a client-side log surfaces it in the browser console too.
    console.error("[ReadyState] unhandled error", error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="max-w-md space-y-5 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-destructive">
          Something went wrong
        </p>
        <h1 className="text-3xl font-bold tracking-tight">Unexpected error</h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          We logged the error. You can try again, or head back to the
          dashboard and pick up where you left off.
        </p>
        {error.digest && (
          <p className="text-[11px] text-muted-foreground/70">
            Error ID: <span className="font-mono">{error.digest}</span>
          </p>
        )}
        <div className="flex justify-center gap-2 pt-2">
          <Button onClick={reset}>Try again</Button>
          <Link href="/">
            <Button variant="outline">Go home</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
