import { AppHeader } from "@/components/app-header";

/**
 * Shared layout for authenticated app surfaces (dashboard, history, the
 * assessment wizard, and the results report). Renders the top nav once
 * and wraps all pages in `(dashboard)` — the URL-invisible route group.
 *
 * Individual pages render their own content inside this shell. The
 * wizard and results pages previously rendered their own full-height
 * wrappers; the layout now owns the min-h-screen background so pages
 * can focus on content.
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      {children}
    </div>
  );
}
