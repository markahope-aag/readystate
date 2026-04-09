"use client";

import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

/**
 * Minimal client-side table row that navigates on click. Used in the
 * dashboard Recent Assessments list and the History page table so whole
 * rows are clickable without giving up server rendering for the rest of
 * the page.
 */
export function ClickableTableRow({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  const router = useRouter();
  return (
    <tr
      role="link"
      tabIndex={0}
      onClick={() => router.push(href)}
      onKeyDown={(e) => {
        if (e.key === "Enter") router.push(href);
      }}
      className={cn(
        "cursor-pointer border-b transition-colors hover:bg-muted/40 focus:bg-muted/40 focus:outline-none",
        className,
      )}
    >
      {children}
    </tr>
  );
}
