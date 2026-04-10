"use client";

import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { saveForLater } from "../actions";

interface Props {
  assessmentId: string;
}

/**
 * Save-for-later button + modal.
 *
 * Opens a centered modal with an email input. On submit, calls the
 * saveForLater server action, which persists the email against the
 * assessment and sends a resume link via Resend. The assessment stays
 * in the database for 30 days before the daily cron deletes it.
 */
export function SaveForLaterButton({ assessmentId }: Props) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus the email field when the modal opens + handle ESC
  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    const handleKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    const toastId = toast.loading("Sending your resume link…");

    try {
      const result = await saveForLater({ assessmentId, email });
      if (!result.ok) {
        toast.error(result.error, { id: toastId });
        return;
      }
      toast.success(
        `Resume link sent to ${email}. You can safely close this tab.`,
        { id: toastId, duration: 6000 },
      );
      setOpen(false);
      setEmail("");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Something went wrong",
        { id: toastId },
      );
    } finally {
      setSubmitting(false);
    }
  }

  const handleBackdropKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") setOpen(false);
  };

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => setOpen(true)}
        className="text-muted-foreground hover:text-foreground"
      >
        Save &amp; continue later
      </Button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="save-for-later-title"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm"
            role="button"
            tabIndex={0}
            aria-label="Close dialog"
            onClick={() => setOpen(false)}
            onKeyDown={handleBackdropKey}
          />

          {/* Dialog */}
          <div
            className={cn(
              "relative z-10 w-full max-w-md rounded-xl border bg-card p-6 shadow-2xl",
              "animate-in fade-in zoom-in-95 duration-150",
            )}
          >
            <div className="space-y-2">
              <h2
                id="save-for-later-title"
                className="text-lg font-semibold tracking-tight"
              >
                Save &amp; continue later
              </h2>
              <p className="text-sm text-muted-foreground">
                Enter your email and we&apos;ll send you a link to pick up
                where you left off. Works across devices — open the link
                on your phone, laptop, or a colleague&apos;s browser.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="save-email">Email</Label>
                <Input
                  id="save-email"
                  ref={inputRef}
                  type="email"
                  autoComplete="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={submitting}
                />
              </div>

              <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] leading-relaxed text-amber-900">
                Your saved progress stays for <strong>30 days</strong>.
                After that, the assessment is automatically deleted. Only
                the person with the link can continue — treat it as
                confidential.
              </p>

              <div className="flex items-center justify-end gap-2 pt-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setOpen(false)}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={submitting}>
                  {submitting ? "Sending…" : "Email me the link"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
