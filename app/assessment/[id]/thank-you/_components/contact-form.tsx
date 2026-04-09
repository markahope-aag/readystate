"use client";

import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
      <Card className="border-emerald-200 bg-emerald-50/40">
        <CardContent className="space-y-3 p-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-800">
            Report delivered
          </p>
          <h2 className="text-xl font-semibold text-emerald-950">
            Your report is on its way.
          </h2>
          <p className="text-sm text-emerald-900/80">
            We&apos;ve emailed your ReadyState SB 553 assessment report
            {orgName ? ` for ${orgName}` : ""}. It should land in your
            inbox within a minute or two. Check your spam folder if you
            don&apos;t see it.
          </p>
          <p className="pt-2 text-xs text-emerald-900/60">
            Didn&apos;t get it? Refresh this page and try submitting again.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Where should we send it?</CardTitle>
        <CardDescription>
          We&apos;ll email your PDF assessment report to the address below.
          One-time only — we won&apos;t add you to any marketing lists
          without your permission.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="contact-name">Full name</Label>
            <Input
              id="contact-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoComplete="name"
              placeholder="Jane Doe"
              disabled={submitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact-email">Work email</Label>
            <Input
              id="contact-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder="jane@company.com"
              disabled={submitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact-role">Your role</Label>
            <Input
              id="contact-role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
              placeholder="Safety Manager, Head of People, etc."
              disabled={submitting}
            />
          </div>

          <Button
            type="submit"
            disabled={submitting}
            className="w-full"
            size="lg"
          >
            {submitting ? "Sending report…" : "Email My Report"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
