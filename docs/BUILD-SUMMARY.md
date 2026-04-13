# ReadyState — Session Revision Log

This document explains every major change made to ReadyState during the April 9–13, 2026 build session, in chronological order. Each entry describes what changed, why, and what it replaced.

---

## 1. Initial Scaffold

**Commit:** `95d547d`

Created the Next.js 14 app in `/projects/readystate` with TypeScript, Tailwind, Clerk v5 for auth, Supabase (`@supabase/ssr`) for the database, shadcn/ui (new-york / slate), Sonner for toasts, and Vitest for testing. Set up `.env.local` with Clerk + Supabase credentials. Configured middleware to protect `/dashboard` and `/assessment` routes.

## 2. Database Schema

**Commits:** `95d547d` → `f034832`

Created three Supabase migrations:
- **001:** Core tables (`organizations`, `assessments`, `assessment_responses`, `assessment_scores`) with RLS policies gating access by the Clerk user ID via `auth.jwt() ->> 'sub'`. Helper functions `clerk_user_id()` and `user_belongs_to_org()`.
- **002:** Explicit `organization_members` table with owner/admin/member roles, replacing the original derived-membership model. Auto-add-creator trigger on org insert.
- **003:** Unique constraint on `(assessment_id, question_id)` for idempotent auto-save upserts.

Clerk was registered as a third-party auth provider in Supabase via the Management API so Supabase could verify Clerk JWTs directly.

## 3. Question Bank (v1)

**Commit:** `f034832`

Created 40 individual yes/no/partial/na questions across three standards:
- **SB 553 Statutory Compliance** (18 questions) — California Labor Code §6401.9
- **ASIS WVPI AA-2020** (12 questions) — professional standard
- **Site Hazard Profile** (10 questions) — physical/operational risk

Each question had a weight (1–3), guidance text, and an ID stability contract preventing renumbering.

## 4. Assessment Wizard

**Commit:** `f034832`

Built a 17-screen linear wizard at `/assessment/new`:
- Step 0: Org info form (creates `organizations` + `assessments` rows)
- Steps 1–15: Questions grouped by category, one category per screen
- Step 16: Review + submit

Each response was auto-saved on click via server action → Supabase upsert. Progress persisted via `?id=<uuid>` in the URL. Critical (weight-3) questions gated the Next button.

## 5. Scoring Engine

**Commit:** `44c67f7`

Split into pure function (`computeScores`) + orchestrator (`calculateScores`). Per-question scoring: yes = weight×2, partial = weight×1, no = 0, na = excluded. Three section scores weighted 50/30/20 into an overall score. Risk bands: ≥85 low, ≥70 moderate, ≥50 high, <50 critical. 10 Vitest unit tests covering all edge cases.

Wired into the wizard's `finalizeAssessment` action so submitting automatically scored.

## 6. Results Page + PDF Export

**Commits:** `f15cd99`, `b750439`

Built `/assessment/[id]/results` with score summary cards (SVG progress rings), gap analysis table, and remediation recommendations. Created `lib/pdf/AssessmentReport.tsx` using `@react-pdf/renderer` with a 4-page Kestralis-branded PDF (cover, exec summary, gap table, recommendations). API route at `/api/assessment/[id]/report` renders the PDF server-side and returns it as `application/pdf`.

## 7. Dashboard + History Pages

**Commit:** `8a68a3d`

Built `/dashboard` (stats, recent assessments, quick reference) and `/history` (filterable, sortable table with URL-driven filters). Both were server components using Clerk auth + RLS-gated Supabase queries.

## 8. Next 14 → 16 Upgrade

**Commit:** `1bfde52`

Upgraded all major dependencies:
- Next.js 14.2.35 → **16.2.3**
- React 18 → **19.2.5**
- @clerk/nextjs 5.7.5 → **7.0.12**
- ESLint 8 → 9

**Breaking changes fixed:**
- `middleware.ts` renamed to `proxy.ts` (Next 16 convention)
- `auth()` became async — awaited everywhere
- `cookies()` became async — `createClient()` became async
- `params` and `searchParams` became `Promise<T>` — awaited in all dynamic routes
- `<SignedIn>` / `<SignedOut>` replaced with `<Show when="signed-in">` / `<Show when="signed-out">` (Clerk v7)
- `UserButton.afterSignOutUrl` prop removed

## 9. Clerk Production Environment

**Commits:** `f7528ec`, `a3e0b94`

Swapped from Clerk test keys (`pk_test_`) to production keys (`pk_live_`). Updated Supabase third-party auth provider from the dev Clerk instance to the production one (`clerk.readystate.now`). Fixed `proxy.ts` to redirect unauthenticated users to `/` instead of returning 404 (Clerk v7 behavior change).

## 10. Removal of All Authentication

**Commit:** `731353c`

**Major pivot.** Removed Clerk entirely. ReadyState became a free, anonymous lead-gen tool — no sign-up, no sign-in, no user accounts.

**Why:** The product strategy shifted from "authenticated SaaS" to "anonymous assessment → lead capture → email report." Users take the assessment without friction, provide contact info at the end, and receive the PDF.

**What was deleted:**
- `@clerk/nextjs` and `svix` packages
- `proxy.ts` (middleware no longer needed)
- Dashboard, history, sign-in, sign-up pages
- App header, clickable table row, queries helper
- Browser Supabase client (no more Clerk token forwarding)
- Clerk webhook endpoint

**What was added:**
- Thank-you page (`/assessment/[id]/thank-you`) with contact form
- Resend email delivery (`lib/email/send-report.tsx`) with PDF attachment
- Service-role-only Supabase client
- Migration 005: `clerk_user_id` made nullable, `contact_name`/`contact_email`/`contact_role`/`email_sent_at` columns added

## 11. Save & Continue Later

**Commit:** `ec5d905`

Added a "Save & continue later" button to the wizard footer. User enters their email → server action saves it against the assessment and sends a Resend email with the resume URL. Assessment stays for 30 days before auto-deletion by the daily cron. Extended `/api/cron/flag-stale` to delete abandoned in-progress assessments older than 30 days.

## 12. Editorial / Swiss Redesign

**Commit:** `896209e`

Complete aesthetic overhaul from generic shadcn slate to an editorial compliance-publication look.

- **Typography:** Fraunces (Google Fonts variable serif) for display, Geist Sans for body, Geist Mono for metadata
- **Palette:** warm cream paper `#f5f4ed`, deep ink `#0c0c0a`, forest (later navy) accent, sand rule lines
- **Layout language:** rule lines instead of card borders, asymmetric 12-column grids, folio pagination, Roman numerals, eyebrow labels, italic display type for emphasis
- **Applied to:** landing page, wizard chrome, org-info form, question cards, review step, thank-you page

## 13. Results Page + PDF Editorial Redesign

**Commit:** `071fbd9`

Rewrote the results page and PDF report to match the editorial aesthetic:
- Oversized org-name masthead (112px Fraunces)
- Typographic score entries with 96px score numerals (no rings/charts)
- 320px overall score display
- Rule-lined gap analysis table with italic severity indicators
- Numbered remediation entries with forest left-border quotes
- PDF registers Fraunces from jsDelivr CDN for real serif rendering

## 14. Brand Integration

**Commits:** `3b2bf10`, `bf5e53d`, `84eb5fc`

Adopted the ReadyState brand assets from `/public`:
- Shifted the editorial green accent to brand navy `#0D1B2E`
- Created inline SVG logo component with transparent background (navy badge + amber shield/checkmark + Geist wordmark)
- Thickened shield/checkmark strokes for visibility at header scale (40–44px)
- Wired favicon (SVG + ICO), apple-touch icon, OpenGraph metadata

## 15. Prevention-Focused Landing Page

**Commit:** `a37699c`

Complete content rewrite aligned with the core statutory mandate: *"An employer shall establish, implement and maintain an effective workplace violence prevention plan."*

- Headline: "Not just a plan. An effective *prevention* program."
- New "Prevention vs. Reaction" section distinguishing proactive prevention from reactive response
- 10 statutory requirement areas listed with descriptions
- Removed "three standards" framing
- SB 553 branded throughout (not "Labor Code §6401.9")
- Start Assessment as a prominent filled navy button (3 click opportunities)

## 16. v2 Assessment Model

**Commit:** `67b820a`

**Fundamental restructure** from 40 individual yes/no questions to 10 SB 553 statutory categories with compliance-level selectors.

**Why:** The statute organizes requirements by area, not by individual checkbox. The v1 model was too granular — users spent 45 minutes on yes/no clicks without reflecting on whether their program was *actually effective*. The v2 model forces a holistic evaluation per area.

**New response model:** Effective / Implemented / Partial / Not Compliant / N/A

**Scoring change:** Single SB 553 dimension. Tighter risk bands (≥80/≥60/≥40/<40). Per-category max = weight × 4.

**The 10 categories** map directly to the statute text:
1. Written Plan & Accessibility (5 sub-requirements)
2. Responsible Persons & Administration (4)
3. Employee Involvement (10)
4. Hazard ID, Evaluation & Correction (6)
5. Training Program (10)
6. Reporting, Response & Anti-Retaliation (7)
7. Emergency Response Procedures (4)
8. Violent Incident Log (12)
9. Recordkeeping (6)
10. Plan Review & Continuous Improvement (4)

**What was removed:** ASIS WVPI AA-2020 section, Site Hazard Profile section, three-section scoring weights, `question-card.tsx`, `Question` type, `sectionMeta`.

**What was updated:** Every downstream consumer — wizard, review step, results page, thank-you actions, PDF report, API route, scoring engine (13 tests passing), recommendations map, DB constraint (migration 006).

---

## Current State

- **26 commits** on `main`
- **13 unit tests** passing (scoring engine)
- **6 Supabase migrations** applied
- **7 routes** (landing, wizard, thank-you, results, PDF API, cron, debug)
- **No authentication** — anonymous lead-gen model
- **Vercel deployment** at `readystate.now`
- **Resend email delivery** with `readystate.now` verified domain

---

*ReadyState is a product of Kestralis Group, LLC · Powered by Asymmetric Marketing*
