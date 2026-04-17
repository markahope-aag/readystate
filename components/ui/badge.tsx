import * as React from "react";
import { cn } from "@/lib/utils";

const variantClasses = {
  default:
    "border-transparent bg-[color:var(--color-navy)] text-white",
  secondary:
    "border-transparent bg-[color:var(--color-gray-light)] text-[color:var(--color-body)]",
  destructive:
    "border-transparent bg-[#DC2626] text-white",
  outline: "text-[color:var(--color-navy)] border-[color:var(--color-navy)]",
} as const;

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement> {
  variant?: keyof typeof variantClasses;
}

export function Badge({
  className,
  variant = "default",
  ...props
}: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-sm border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-[0.06em] transition-colors",
        variantClasses[variant],
        className,
      )}
      {...props}
    />
  );
}
