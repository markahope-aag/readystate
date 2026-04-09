/**
 * proxy.ts — Next.js 16 middleware file convention.
 *
 * Despite the filename, this is NOT a reverse proxy or Vercel Edge shim.
 * Next.js 15+ renamed the `middleware.ts` file convention to `proxy.ts`.
 * The runtime behavior is identical; the name change was motivated by
 * "middleware" being overloaded with Express-style connotations that
 * Next's model doesn't match. Same `clerkMiddleware` wrapper from
 * `@clerk/nextjs/server` as before.
 *
 * What this file does: on every request, Clerk reads the session JWT
 * from cookies. For matched "protected" routes, unauthenticated
 * requests are redirected to the landing page (where the sign-in modal
 * lives). For everything else, it's a no-op.
 *
 * Clerk v7 note: `auth.protect()` rewrites to a 404 for unauthenticated
 * requests by default instead of redirecting. We redirect explicitly
 * because the landing page is our branded sign-in surface.
 */
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/assessment(.*)",
  "/history(.*)",
]);
export default clerkMiddleware(async (auth, req) => {
  if (!isProtectedRoute(req)) return;

  const { userId } = await auth();
  if (!userId) {
    const signInUrl = new URL("/", req.url);
    signInUrl.searchParams.set("redirect_url", req.nextUrl.pathname);
    return NextResponse.redirect(signInUrl);
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
