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
      <div className="border border-[color:var(--color-navy)] bg-white rounded-sm p-8 md:p-10">
        <p className="eyebrow mb-3">Delivered</p>
        <h3 className="text-[1.75rem] font-bold text-[color:var(--color-navy)]">
          On its way.
        </h3>
        <p className="mt-5 text-[0.9375rem] leading-[1.65] text-[color:var(--color-body)]">
          We&rsquo;ve emailed your ReadyState SB 553 assessment report
          {orgName ? (
            <>
              {" "}for{" "}
              <span className="font-semibold text-[color:var(--color-navy)]">
                {orgName}
              </span>
            </>
          ) : null}
          . It should land in your inbox within a minute or two.
        </p>
        <p className="mt-4 border-l-2 border-[color:var(--color-blue)] bg-[color:var(--color-gray-light)] rounded-r-sm py-3 pl-4 pr-4 text-[0.8125rem] leading-[1.6] text-[color:var(--color-body)]">
          <strong className="font-semibold">
            If you don&rsquo;t see it,
          </strong>{" "}
          check your spam or promotions folder first. New sender domains
          often get filtered on first contact.
        </p>
        <div className="mt-8 border-t border-[color:var(--color-border)] pt-6">
          <button
            type="button"
            onClick={() => setSent(false)}
            className="text-[0.8125rem] font-medium text-[color:var(--color-blue)] hover:text-[color:var(--color-navy)] underline underline-offset-2 transition-colors"
          >
            Send to a different email address →
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-1">
        <label htmlFor="contact-name" className="form-label">Full name</label>
        <input
          id="contact-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          autoComplete="name"
          placeholder="Jane Doe"
          disabled={submitting}
          className="form-input"
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="contact-email" className="form-label">Work email</label>
        <input
          id="contact-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          placeholder="jane@company.com"
          disabled={submitting}
          className="form-input"
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="contact-role" className="form-label">Your role</label>
        <input
          id="contact-role"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          required
          placeholder="Safety Manager, Head of People, etc."
          disabled={submitting}
          className="form-input"
        />
      </div>

      <div className="pt-4">
        <button
          type="submit"
          disabled={submitting}
          className="btn btn-primary w-full py-4"
        >
          {submitting ? "Sending…" : "Send Me the Report →"}
        </button>
      </div>
    </form>
  );
}
