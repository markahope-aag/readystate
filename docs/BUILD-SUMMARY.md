# ReadyState — Build Summary

**Product:** ReadyState by Kestralis Group, LLC
**Domain:** https://readystate.now
**Repo:** https://github.com/markahope-aag/readystate
**Vercel:** https://vercel.com/asymmetric1/readystate

---

## What it is

ReadyState is a free, anonymous SB 553 compliance assessment tool. California employers answer 10 statutory-category evaluations and receive a Kestralis-branded PDF report with a compliance score, gap analysis, and remediation guidance — delivered to their inbox via email. No account required.

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack, React 19) |
| Language | TypeScript (strict mode) |
| Database | Supabase Postgres (service role, no end-user auth) |
| Styling | Tailwind CSS + custom editorial design system |
| Typography | Fraunces (display serif) + Geist Sans/Mono (body) |
| PDF | @react-pdf/renderer (server-side) |
| Email | Resend (PDF attachment delivery) |
| Toasts | Sonner |
| Tests | Vitest (13 unit tests on scoring engine) |
| CI | GitHub Actions (tsc + vitest on every push) |
| Hosting | Vercel (Node runtime) |

## Routes

```
/                                 Landing page (static)
/assessment/new                   12-step wizard (org info + 10 categories + review)
/assessment/[id]/thank-you        Contact capture → email PDF delivery
/assessment/[id]/results          HTML report (public, UUID-gated)
/api/assessment/[id]/report       PDF download (GET → application/pdf)
/api/cron/flag-stale              Daily cron: delete abandoned + flag stale
/api/debug/env                    Diagnostic: env var presence check (temporary)
```

## Assessment Model (v2)

**10 SB 553 statutory categories**, each evaluated with a compliance selector:

| # | Category | Sub-reqs | Weight |
|---|---|:---:|---|
| 01 | Written Plan & Accessibility | 5 | Critical |
| 02 | Responsible Persons & Administration | 4 | Critical |
| 03 | Employee Involvement | 10 | Critical |
| 04 | Hazard ID, Evaluation & Correction | 6 | Critical |
| 05 | Training Program | 10 | Critical |
| 06 | Reporting, Response & Anti-Retaliation | 7 | Critical |
| 07 | Emergency Response Procedures | 4 | Important |
| 08 | Violent Incident Log | 12 | Critical |
| 09 | Recordkeeping | 6 | Important |
| 10 | Plan Review & Continuous Improvement | 4 | Important |

**Response options per category:**

| Level | Meaning | Score |
|---|---|---|
| Effective | All sub-requirements implemented and working | weight × 4 |
| Implemented | In place but not verified effective | weight × 3 |
| Partial | Some gaps exist | weight × 2 |
| Not Compliant | Missing or seriously deficient | 0 |
| N/A | Doesn't apply | excluded |

**Risk bands:** ≥80 Low, ≥60 Moderate, ≥40 High, <40 Critical

## User Flow

```
Landing page → Start Assessment → Org info form → 10 category screens
→ Review & submit → Thank-you page → Enter name/email/role
→ PDF report emailed via Resend → Done
```

- **Save & continue later** — email a resume link from any wizard screen
- **Resume** — `/assessment/new?id=<uuid>` restores all progress
- **PDF download** — also available from the HTML results page
- **30-day retention** — abandoned in-progress assessments auto-deleted by daily cron

## Design System

**Aesthetic:** Editorial / Swiss — warm cream paper, deep navy accent, Fraunces italic display type, rule-line layouts, asymmetric 12-column grids.

- **Palette:** paper `#f5f4ed`, ink `#0c0c0a`, navy (forest token) `#0D1B2E`, sand `#c9bd9c`, amber `#F5A623`, risk-red `#a02020`
- **Typography:** Fraunces (display), Geist Sans (body), Geist Mono (metadata)
- **Logo:** Inline SVG component with navy badge + amber shield/checkmark + Geist wordmark
- **Patterns:** Eyebrow labels, folio pagination, roman numerals, italic editorial links, rule-line progress bars

## Database (Supabase)

**6 migrations applied:**

| # | Migration | Purpose |
|---|---|---|
| 001 | initial_schema | organizations, assessments, responses, scores + RLS |
| 002 | organization_members | Explicit membership table (legacy, unused) |
| 003 | response_uniqueness | Unique constraint for idempotent upserts |
| 004 | profiles | Clerk user mirror (legacy, unused) |
| 005 | public_assessments | Nullable clerk_user_id + contact columns |
| 006 | v2_response_values | Updated CHECK constraint for compliance selectors |

**Auth model:** No end-user authentication. All reads/writes use the Supabase service role. UUID is the effective bearer token.

## Email (Resend)

- **Report delivery:** PDF as base64 attachment, HTML + text bodies with inline score box and consultation CTA
- **Resume link:** Simple HTML email with "Continue assessment →" CTA button
- **Sending domain:** `readystate.now` (verified with Resend)
- **From address:** configurable via `RESEND_FROM_EMAIL` env var

## PDF Report

4-page Kestralis-branded document:

1. **Cover** — org name, site, date, risk badge
2. **Scorecard** — 160pt overall score numeral + risk label
3. **Gap Analysis** — editorial table of categories below Effective
4. **Remediation** — numbered recommendations for each gap

Rendered server-side via `@react-pdf/renderer` with registered Fraunces fonts from jsDelivr CDN.

## Environment Variables

| Variable | Required | Purpose |
|---|:---:|---|
| `NEXT_PUBLIC_APP_URL` | ✅ | `https://readystate.now` |
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Supabase anon JWT |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Service role JWT |
| `RESEND_API_KEY` | ✅ | Email delivery |
| `RESEND_FROM_EMAIL` | ⚠️ | Override sender (defaults to reports@readystate.now) |
| `CRON_SECRET` | ✅ | Vercel cron auth |

Note: `NEXT_PUBLIC_*` vars are inlined at build time. Changing them requires a rebuild.

## Commit History (26 commits)

```
95d547d  scaffold Next.js 14 app
f034832  multi-step assessment wizard
44c67f7  scoring engine + wire into finalize
9584963  landing page
f15cd99  results page
8a68a3d  dashboard + history pages
1bfde52  upgrade to Next 16 + React 19 + Clerk 7
f7528ec  trigger rebuild for prod Clerk keys
a3e0b94  proxy redirects fix
b750439  PDF report export
45352be  polish pass (error boundaries, cron, README)
fca4713  address 6 gap items (layout, sign-in, webhook, CI, proxy docs)
3a92180  fix vercel.json env section
731353c  anonymous lead-gen flow, remove all auth
c550355  surface assessment creation errors
0e15bc2  diagnostic env endpoint
dbccfd2  rebuild for env vars
3666753  resend report fix
ec5d905  save & continue later + cron cleanup
896209e  editorial/Swiss redesign
071fbd9  results + PDF editorial aesthetic
3b2bf10  brand logo + favicon integration
bf5e53d  inline SVG logo
84eb5fc  thicken logo strokes for header scale
a37699c  prevention-focused landing page
67b820a  v2 assessment model (10 categories, compliance selectors)
```

## What's Not Built (Known Trade-offs)

- **No user accounts** — anonymous lead-gen only. Users can't list past assessments.
- **No multi-site roll-up** — each assessment is standalone per site.
- **No corrective action tracking** — the report identifies gaps but doesn't track remediation.
- **No anonymous incident reporting portal** — would complement the prevention focus.
- **No training log integration** — training compliance is evaluated but not tracked.
- **Legacy migrations 002 + 004** are applied but unused (from the auth era).
- **`/api/debug/env` still live** — safe but should be removed before launch.

---

*Built for Kestralis Group, LLC · Powered by Asymmetric Marketing*
