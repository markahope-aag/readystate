"use client";

import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { submitContactAndSendReport } from "../actions";

interface Props {
  assessmentId: string;
  alreadySent: boolean;
  orgName: string | null;
}

export function ContactForm({ assessmentId, alreadySent, orgName }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(alreadySent);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    const toastId = toast.loading("Generating your report and sending…");

    try {
      const result = await submitContactAndSendReport({
        assessmentId,
        name,
        email,
        role,
      });

      if (!result.ok) {
        toast.error(result.error, { id: toastId });
        return;
      }

      toast.success("Report sent — check your inbox", { id: toastId });
      setSent(true);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Something went wrong",
        { id: toastId },
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (sent) {
    return (
      <div className="border border-forest bg-paper p-10">
        <p className="eyebrow mb-3 text-forest">Delivered</p>
        <h3 className="font-display text-[36px] font-light italic leading-[1] text-forest md:text-[44px]">
          On its way.
        </h3>
        <p className="mt-6 text-[15px] leading-[1.65] text-ink">
          We&rsquo;ve emailed your ReadyState SB 553 assessment report
          {orgName ? (
            <>
              {" "}
              for{" "}
              <span className="font-display italic text-forest">
                {orgName}
              </span>
            </>
          ) : null}
          . It should land in your inbox within a minute or two.
        </p>
        <p className="mt-4 rounded-sm border-l-2 border-forest bg-sand-soft/60 py-2 pl-4 text-[13px] leading-[1.6] text-ink">
          <strong className="font-semibold">
            If you don&rsquo;t see it,
          </strong>{" "}
          check your spam or promotions folder first. New sender
          domains often get filtered on first contact — mark it as
          &ldquo;not spam&rdquo; to ensure future deliveries land in
          the inbox.
        </p>
        <div className="mt-8 border-t border-ink/20 pt-6">
          <button
            type="button"
            onClick={() => setSent(false)}
            className="group inline-flex items-baseline gap-2 font-display text-[14px] italic text-warm-muted hover:text-ink"
          >
            <span className="link-editorial">
              Send to a different email address
            </span>
            <span className="transition-transform duration-300 group-hover:translate-x-1">
              →
            </span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <ThankYouField label="Full name" htmlFor="contact-name">
        <input
          id="contact-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          autoComplete="name"
          placeholder="Jane Doe"
          disabled={submitting}
          className="w-full border-0 border-b border-ink/50 bg-transparent pb-2 pt-1 font-display text-[22px] font-light text-ink placeholder:italic placeholder:text-warm-muted-soft focus:border-ink focus:outline-none focus:ring-0 disabled:cursor-not-allowed md:text-[26px]"
        />
      </ThankYouField>

      <ThankYouField label="Work email" htmlFor="contact-email">
        <input
          id="contact-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          placeholder="jane@company.com"
          disabled={submitting}
          className="w-full border-0 border-b border-ink/50 bg-transparent pb-2 pt-1 font-sans text-[18px] text-ink placeholder:italic placeholder:text-warm-muted-soft focus:border-ink focus:outline-none focus:ring-0 disabled:cursor-not-allowed md:text-[20px]"
        />
      </ThankYouField>

      <ThankYouField label="Your role" htmlFor="contact-role">
        <input
          id="contact-role"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          required
          placeholder="Safety Manager, Head of People, etc."
          disabled={submitting}
          className="w-full border-0 border-b border-ink/50 bg-transparent pb-2 pt-1 font-display text-[20px] font-light text-ink placeholder:italic placeholder:text-warm-muted-soft focus:border-ink focus:outline-none focus:ring-0 disabled:cursor-not-allowed md:text-[22px]"
        />
      </ThankYouField>

      <div className="flex items-baseline justify-end border-t border-ink pt-8">
        <button
          type="submit"
          disabled={submitting}
          className="group inline-flex items-baseline gap-3 font-display text-[22px] font-light italic text-ink disabled:cursor-not-allowed disabled:text-warm-muted-soft md:text-[28px]"
        >
          <span className="link-editorial">
            {submitting ? "Sending…" : "Send me the report"}
          </span>
          <span className="transition-transform duration-300 group-hover:translate-x-2">
            →
          </span>
        </button>
      </div>
    </form>
  );
}

function ThankYouField({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label
        htmlFor={htmlFor}
        className="font-display text-[15px] italic text-forest"
      >
        {label}
      </label>
      {children}
    </div>
  );
}
