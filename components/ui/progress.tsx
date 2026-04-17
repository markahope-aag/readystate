import * as React from "react";
import { cn } from "@/lib/utils";

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 0–100 */
  value?: number;
}

export const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value = 0, ...props }, ref) => {
    const clamped = Math.min(100, Math.max(0, value));
    return (
      <div
        ref={ref}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={clamped}
        className={cn(
          "relative h-[3px] w-full overflow-hidden bg-[color:var(--color-gray-light)]",
          className,
        )}
        {...props}
      >
        <div
          className="h-full bg-[color:var(--color-blue)] transition-all duration-[350ms]"
          style={{ width: `${clamped}%`, transition: "width 350ms var(--ease-out)" }}
        />
      </div>
    );
  },
);
Progress.displayName = "Progress";
