import * as React from "react";
import { cn } from "@/lib/utils";

const variantClasses = {
  default:
    "bg-[color:var(--color-navy)] text-white border-[color:var(--color-navy)] hover:bg-[color:var(--color-navy-900)] hover:border-[color:var(--color-navy-900)] hover:shadow-[0_8px_28px_-8px_rgba(23,45,153,0.45)] hover:-translate-y-px",
  outline:
    "bg-transparent text-[color:var(--color-navy)] border-[color:var(--color-navy)] hover:bg-[color:var(--color-navy)] hover:text-white",
  ghost:
    "bg-transparent text-[color:var(--color-navy)] border-transparent hover:bg-[color:var(--color-gray-light)]",
  destructive:
    "bg-[#DC2626] text-white border-[#DC2626] hover:bg-[#B91C1C]",
  "ghost-light":
    "bg-transparent text-white border-white/40 hover:bg-white hover:text-[color:var(--color-navy)] hover:border-white",
} as const;

const sizeClasses = {
  default: "px-7 py-[0.85rem]",
  sm: "px-4 py-2 text-xs",
  lg: "px-8 py-4 text-sm",
} as const;

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variantClasses;
  size?: keyof typeof sizeClasses;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-sm text-[0.8125rem] font-medium uppercase tracking-[0.06em] border-[1.5px] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-navy)] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...props}
    />
  ),
);
Button.displayName = "Button";
