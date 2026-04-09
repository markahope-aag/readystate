import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/assessment(.*)",
  "/history(.*)",
]);

/**
 * Clerk v7 note: `auth.protect()` rewrites to a 404 for unauthenticated
 * requests by default instead of redirecting to sign-in. Since ReadyState
 * uses modal sign-in from the landing page, we explicitly redirect
 * unauthenticated users to `/` where the modal lives.
 */
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
