import * as React from "react";
import { cn } from "@/lib/utils";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "flex min-h-[100px] w-full resize-y rounded-sm border-[1.5px] border-[color:var(--color-border)] bg-white px-4 py-3 text-[0.9375rem] text-[color:var(--color-ink)] placeholder:text-[color:var(--color-muted)] placeholder:italic transition-[border-color,box-shadow] focus:border-[color:var(--color-navy)] focus:outline-none focus:shadow-[0_0_0_3px_rgba(23,45,153,0.12)] disabled:cursor-not-allowed disabled:opacity-50",
      className,
    )}
    {...props}
  />
));
Textarea.displayName = "Textarea";
