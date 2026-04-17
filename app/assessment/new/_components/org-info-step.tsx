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
        <h2 className="text-[1.75rem] font-semibold leading-[1.1] tracking-[-0.012em] text-[color:var(--color-navy)]">
          A single site.
        </h2>
        <p className="mt-5 text-[0.875rem] leading-[1.65] text-[color:var(--color-muted)]">
          Every ReadyState assessment is scoped to one physical
          location. If you operate multiple California sites, run an
          assessment for each — averaging hides the gaps that put
          specific teams at risk.
        </p>
        <p className="mt-6 text-[0.875rem] text-[color:var(--color-muted)]">
          Takes about 45 minutes. Save &amp; continue later at any point.
        </p>
      </aside>

      {/* ─── Right column — form ─────────────────────────────── */}
      <form
        onSubmit={handleSubmit}
        className="space-y-8 md:col-span-8 md:col-start-5"
      >
        <FormField label="Organization" hint="The legal entity responsible for the site" id="orgName">
          <input
            id="orgName"
            value={orgName}
            onChange={(e) => setOrgName(e.target.value)}
            required
            disabled={readOnly}
            placeholder="Acme Logistics, Inc."
            className="form-input text-lg font-medium"
          />
        </FormField>

        <FormField label="Industry" hint="Determines site-specific risk weighting" id="industry">
          <select
            id="industry"
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            required
            disabled={readOnly}
            className={cn(
              "form-input appearance-none pr-10",
              "bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2012%2012%22%3E%3Cpath%20fill%3D%22%23172D99%22%20d%3D%22M6%208.5L1.5%204h9z%22/%3E%3C/svg%3E')] bg-[length:12px] bg-[right_12px_center] bg-no-repeat",
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
        </FormField>

        <div className="grid gap-8 md:grid-cols-2">
          <FormField label="California employees" hint="Across all CA sites" id="employeeCount">
            <input
              id="employeeCount"
              type="number"
              min={0}
              value={employeeCount}
              onChange={(e) => setEmployeeCount(e.target.value)}
              required
              disabled={readOnly}
              placeholder="0"
              className="form-input tabular-figures"
            />
          </FormField>
          <FormField label="California locations" hint="Number of separate physical sites" id="californiaLocations">
            <input
              id="californiaLocations"
              type="number"
              min={1}
              value={californiaLocations}
              onChange={(e) => setCaliforniaLocations(e.target.value)}
              required
              disabled={readOnly}
              placeholder="1"
              className="form-input tabular-figures"
            />
          </FormField>
        </div>

        <div className="border-t border-[color:var(--color-border)] pt-8">
          <p className="eyebrow mb-6">The site being assessed</p>

          <div className="space-y-8">
            <FormField label="Site name" hint="An internal label — e.g. Main Office, Warehouse A" id="siteName">
              <input
                id="siteName"
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                placeholder="Main Office"
                required
                disabled={readOnly}
                className="form-input"
              />
            </FormField>

            <FormField label="Site address" hint="Street, city, state, ZIP" id="siteAddress">
              <input
                id="siteAddress"
                value={siteAddress}
                onChange={(e) => setSiteAddress(e.target.value)}
                placeholder="1234 Market St, San Francisco, CA 94103"
                required
                disabled={readOnly}
                className="form-input"
              />
            </FormField>
          </div>
        </div>

        {!readOnly && (
          <div className="pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary w-full py-4"
            >
              {submitting ? "Creating…" : "Begin the assessment →"}
            </button>
          </div>
        )}
      </form>
    </section>
  );
}

function FormField({
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
    <div className="space-y-1">
      <label htmlFor={id} className="form-label">
        {label}
      </label>
      {hint && <p className="form-helper">{hint}</p>}
      {children}
    </div>
  );
}
