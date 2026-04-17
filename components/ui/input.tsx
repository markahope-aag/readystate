import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, type, ...props }, ref) => (
  <input
    type={type}
    ref={ref}
    className={cn(
      "flex w-full rounded-sm border-[1.5px] border-[color:var(--color-border)] bg-white px-4 py-3 text-[0.9375rem] text-[color:var(--color-ink)] placeholder:text-[color:var(--color-muted)] transition-[border-color,box-shadow] focus:border-[color:var(--color-navy)] focus:outline-none focus:shadow-[0_0_0_3px_rgba(23,45,153,0.12)] disabled:cursor-not-allowed disabled:opacity-50",
      className,
    )}
    {...props}
  />
));
Input.displayName = "Input";
