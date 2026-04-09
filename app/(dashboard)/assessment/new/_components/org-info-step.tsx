"use client";

import { useState, type FormEvent } from "react";
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
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">
          {readOnly ? "Assessment details" : "New assessment"}
        </CardTitle>
        <CardDescription>
          {readOnly
            ? "Review the organization and site information for this assessment."
            : "Tell us about the organization and the specific worksite being assessed. Each assessment is scoped to a single site."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="orgName">Organization name</Label>
            <Input
              id="orgName"
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              required
              disabled={readOnly}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="industry">Industry</Label>
            <select
              id="industry"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              required
              disabled={readOnly}
              className={cn(
                "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
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
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="employeeCount">CA employees</Label>
              <Input
                id="employeeCount"
                type="number"
                min={0}
                value={employeeCount}
                onChange={(e) => setEmployeeCount(e.target.value)}
                required
                disabled={readOnly}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="californiaLocations">CA locations</Label>
              <Input
                id="californiaLocations"
                type="number"
                min={1}
                value={californiaLocations}
                onChange={(e) => setCaliforniaLocations(e.target.value)}
                required
                disabled={readOnly}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="siteName">Site being assessed</Label>
            <Input
              id="siteName"
              value={siteName}
              onChange={(e) => setSiteName(e.target.value)}
              placeholder="e.g., Main Office, Warehouse A"
              required
              disabled={readOnly}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="siteAddress">Site address</Label>
            <Input
              id="siteAddress"
              value={siteAddress}
              onChange={(e) => setSiteAddress(e.target.value)}
              placeholder="Street, city, state, ZIP"
              required
              disabled={readOnly}
            />
          </div>

          {!readOnly && (
            <Button type="submit" disabled={submitting} className="w-full">
              {submitting ? "Creating…" : "Create assessment & continue"}
            </Button>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
