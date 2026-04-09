import Link from "next/link";
import { SignUp } from "@clerk/nextjs";

export const metadata = {
  title: "Sign up · ReadyState",
};

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-md bg-primary" aria-hidden />
            <div className="leading-tight">
              <p className="text-sm font-semibold">ReadyState</p>
              <p className="text-[10px] text-muted-foreground">
                by Kestralis
              </p>
            </div>
          </Link>
          <Link
            href="/sign-in"
            className="text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            Already have an account? Sign in →
          </Link>
        </div>
      </header>
      <main className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="flex w-full max-w-md flex-col items-center gap-6">
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              ReadyState
            </p>
            <h1 className="mt-2 text-2xl font-bold tracking-tight">
              Start your first assessment
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Free to use. SB 553 compliance scoring in under an hour per
              site.
            </p>
          </div>
          <SignUp />
        </div>
      </main>
    </div>
  );
}
