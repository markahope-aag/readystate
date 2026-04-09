import Link from "next/link";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
} from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

/**
 * Shared top navigation bar for authenticated app surfaces.
 * Server component — Clerk's <SignedIn>/<SignedOut>/<UserButton> handle
 * their own client boundaries.
 */
export function AppHeader() {
  return (
    <header className="border-b bg-card">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="flex items-center gap-2 focus:outline-none"
          >
            <div className="h-7 w-7 rounded-md bg-primary" aria-hidden />
            <div className="leading-tight">
              <p className="text-sm font-semibold">ReadyState</p>
              <p className="text-[10px] text-muted-foreground">by Kestralis</p>
            </div>
          </Link>
          <nav className="hidden items-center gap-5 text-sm font-medium text-muted-foreground md:flex">
            <Link href="/dashboard" className="hover:text-foreground">
              Dashboard
            </Link>
            <Link href="/history" className="hover:text-foreground">
              History
            </Link>
            <Link href="/assessment/new" className="hover:text-foreground">
              New Assessment
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
          <SignedOut>
            <SignInButton mode="modal">
              <Button size="sm">Sign in</Button>
            </SignInButton>
          </SignedOut>
        </div>
      </div>
    </header>
  );
}
