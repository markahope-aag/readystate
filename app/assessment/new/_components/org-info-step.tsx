"use client";

import { useState, type FormEvent } from "react";
import { cn } from "@/lib/utils";
import type { OrgInfoInput } from "../actions";
import type { WizardInitialAssessment } from "./wizard";

const INDUSTRIES = [
  "Agriculture",
  "Construction",
  "Education",
  "Financial Services",
  "Government",
  "Healthcare",
  "Hospitality / Food Service",
  "Information Technology",
  "Manufacturing",
  "Nonprofit",
  "Professional Services",
  "Real Estate",
  "Retail",
  "Social Services",
  "Transportation",
  "Utilities",
  "Warehousing",
  "Other",
] as const;

interface Props {
  initial: WizardInitialAssessment | null;
  onSubmit: (data: OrgInfoInput) => Promise<void>;
}

export function OrgInfoStep({ initial, onSubmit }: Props) {
  const [orgName, setOrgName] = useState(initial?.organizations?.name ?? "");
  const [industry, setIndustry] = useState(
    initial?.organizations?.industry ?? "",
  );
  const [employeeCount, setEmployeeCount] = useState(
    initial?.organizations?.employee_count?.toString() ?? "",
  );
  const [californiaLocations, setCaliforniaLocations] = useState(
    initial?.organizations?.california_locations?.toString() ?? "",
  );
  const [siteName, setSiteName] = useState(initial?.site_name ?? "");
  const [siteAddress, setSiteAddress] = useState(initial?.site_address ?? "");
  const [submitting, setSubmitting] = useState(false);

  const readOnly = Boolean(initial);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (readOnly) return;
    setSubmitting(true);
    try {
      await onSubmit({
        orgName: orgName.trim(),
        industry,
        employeeCount: Number(employeeCount) || 0,
        californiaLocations: Number(californiaLocations) || 0,
        siteName: siteName.trim(),
        siteAddress: siteAddress.trim(),
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="grid gap-12 md:grid-cols-12 md:gap-16">
      {/* ─── Left column — intro ─────────────────────────────── */}
      <aside className="md:col-span-4">
        <p className="eyebrow mb-3">Preamble</p>
        <h2 className="font-display text-[32px] font-light leading-[1] tracking-[-0.015em] text-ink">
          A single{" "}
          <span className="italic text-forest">site</span>.
        </h2>
        <p className="mt-5 text-[14px] leading-[1.65] text-warm-muted md:text-[15px]">
          Every ReadyState assessment is scoped to one physical
          location. If you operate multiple California sites, run an
          assessment for each — averaging hides the gaps that put
          specific teams at risk.
        </p>
        <p className="mt-6 font-display text-[14px] italic text-warm-muted">
          Takes about 45 minutes. Save &amp; continue later at any
          point.
        </p>
      </aside>

      {/* ─── Right column — form ─────────────────────────────── */}
      <form
        onSubmit={handleSubmit}
        className="space-y-10 md:col-span-8 md:col-start-5"
      >
        <EditorialField
          label="Organization"
          hint="The legal entity responsible for the site"
          id="orgName"
        >
          <input
            id="orgName"
            value={orgName}
            onChange={(e) => setOrgName(e.target.value)}
            required
            disabled={readOnly}
            placeholder="Acme Logistics, Inc."
            className="w-full border-0 border-b border-ink/50 bg-transparent pb-2 pt-1 font-display text-[24px] font-light leading-tight text-ink placeholder:italic placeholder:text-warm-muted-soft focus:border-ink focus:outline-none focus:ring-0 disabled:cursor-not-allowed md:text-[28px]"
          />
        </EditorialField>

        <EditorialField
          label="Industry"
          hint="Determines site-specific risk weighting"
          id="industry"
        >
          <select
            id="industry"
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            required
            disabled={readOnly}
            className={cn(
              "w-full appearance-none border-0 border-b border-ink/50 bg-transparent bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2012%2012%22%3E%3Cpath%20fill%3D%22%230c0c0a%22%20d%3D%22M6%208.5L1.5%204h9z%22/%3E%3C/svg%3E')] bg-[length:12px] bg-[right_4px_center] bg-no-repeat pb-2 pt-1 pr-6 font-display text-[20px] font-light text-ink focus:border-ink focus:outline-none focus:ring-0 disabled:cursor-not-allowed md:text-[22px]",
            )}
          >
            <option value="" disabled>
              Select industry…
            </option>
            {INDUSTRIES.map((ind) => (
              <option key={ind} value={ind}>
                {ind}
              </option>
            ))}
          </select>
        </EditorialField>

        <div className="grid gap-10 md:grid-cols-2 md:gap-12">
          <EditorialField
            label="California employees"
            hint="Across all CA sites"
            id="employeeCount"
          >
            <input
              id="employeeCount"
              type="number"
              min={0}
              value={employeeCount}
              onChange={(e) => setEmployeeCount(e.target.value)}
              required
              disabled={readOnly}
              placeholder="0"
              className="w-full border-0 border-b border-ink/50 bg-transparent pb-2 pt-1 font-mono tabular-figures text-[22px] text-ink placeholder:text-warm-muted-soft focus:border-ink focus:outline-none focus:ring-0"
            />
          </EditorialField>
          <EditorialField
            label="California locations"
            hint="Number of separate physical sites"
            id="californiaLocations"
          >
            <input
              id="californiaLocations"
              type="number"
              min={1}
              value={californiaLocations}
              onChange={(e) => setCaliforniaLocations(e.target.value)}
              required
              disabled={readOnly}
              placeholder="1"
              className="w-full border-0 border-b border-ink/50 bg-transparent pb-2 pt-1 font-mono tabular-figures text-[22px] text-ink placeholder:text-warm-muted-soft focus:border-ink focus:outline-none focus:ring-0"
            />
          </EditorialField>
        </div>

        <div className="border-t border-ink/20 pt-10">
          <p className="eyebrow mb-6">The site being assessed</p>

          <div className="space-y-10">
            <EditorialField
              label="Site name"
              hint="An internal label — e.g. Main Office, Warehouse A"
              id="siteName"
            >
              <input
                id="siteName"
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                placeholder="Main Office"
                required
                disabled={readOnly}
                className="w-full border-0 border-b border-ink/50 bg-transparent pb-2 pt-1 font-display text-[22px] font-light text-ink placeholder:italic placeholder:text-warm-muted-soft focus:border-ink focus:outline-none focus:ring-0 md:text-[24px]"
              />
            </EditorialField>

            <EditorialField
              label="Site address"
              hint="Street, city, state, ZIP"
              id="siteAddress"
            >
              <input
                id="siteAddress"
                value={siteAddress}
                onChange={(e) => setSiteAddress(e.target.value)}
                placeholder="1234 Market St, San Francisco, CA 94103"
                required
                disabled={readOnly}
                className="w-full border-0 border-b border-ink/50 bg-transparent pb-2 pt-1 font-sans text-[16px] text-ink placeholder:italic placeholder:text-warm-muted-soft focus:border-ink focus:outline-none focus:ring-0"
              />
            </EditorialField>
          </div>
        </div>

        {!readOnly && (
          <div className="flex items-baseline justify-end gap-6 border-t border-ink pt-8">
            <p className="hidden font-display text-[13px] italic text-warm-muted md:block">
              Ready when you are.
            </p>
            <button
              type="submit"
              disabled={submitting}
              className="group flex items-baseline gap-3 text-[18px] text-ink disabled:cursor-not-allowed disabled:text-warm-muted-soft"
            >
              <span className="link-editorial font-display italic">
                {submitting ? "Creating…" : "Begin the assessment"}
              </span>
              <span className="transition-transform duration-300 group-hover:translate-x-1">
                →
              </span>
            </button>
          </div>
        )}
      </form>
    </section>
  );
}

// ─── Editorial form field ────────────────────────────────────────────────

function EditorialField({
  label,
  hint,
  id,
  children,
}: {
  label: string;
  hint?: string;
  id: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label
        htmlFor={id}
        className="flex items-baseline justify-between gap-4"
      >
        <span className="font-display text-[15px] italic text-forest">
          {label}
        </span>
        {hint && (
          <span className="text-[11px] text-warm-muted-soft">{hint}</span>
        )}
      </label>
      {children}
    </div>
  );
}
