import { cn } from "@/lib/utils";
import {
  getRiskColor,
  getRiskLabel,
  type RiskLevel,
} from "@/lib/assessment/scoring";

/**
 * Shared risk-level pill. Used on the dashboard, history, and results
 * pages so the colors and labels stay in sync with the scoring engine.
 */
export function RiskBadge({
  level,
  size = "default",
}: {
  level: RiskLevel;
  size?: "sm" | "default";
}) {
  const colors = getRiskColor(level);
  const { label } = getRiskLabel(level);
  return (
    <span
      className={cn(
        "inline-flex items-center whitespace-nowrap rounded-full border font-semibold uppercase tracking-wide",
        size === "sm"
          ? "px-2 py-0.5 text-[10px]"
          : "px-3 py-1 text-xs",
        colors.bg,
        colors.text,
        colors.border,
      )}
    >
      {label}
    </span>
  );
}
