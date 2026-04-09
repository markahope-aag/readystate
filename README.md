# ReadyState

Free, anonymous Workplace Violence Prevention Assessment tool for California **SB 553** compliance, by Kestralis. Scores programs against three dimensions:

1. **SB 553 Statutory Compliance** — California Labor Code §6401.9 minimums
2. **ASIS WVPI AA-2020** — professional standard benchmarks
3. **Site Hazard Profile** — physical and operational risk factors

Users take the assessment anonymously, provide their name/email/role at the end, and receive a Kestralis-branded PDF report via email.

---

## Stack

| Layer | Tool |
|---|---|
| Framework | **Next.js 16** (App Router, Turbopack, React 19) |
| Language | TypeScript (strict) |
| Database | **Supabase Postgres** (service role only — no RLS on the app path) |
| Styling | **Tailwind CSS** + shadcn-style primitives under `components/ui/` |
| PDF | `@react-pdf/renderer` (server-side via `renderToBuffer`) |
| Email | **Resend** (PDF as attachment) |
| Toasts | `sonner` |
| Tests | **Vitest** (pure-function unit tests for the scoring engine) |
| CI | GitHub Actions — tsc + vitest on every push |
| Hosting | **Vercel** (Node runtime) |

> **No authentication.** ReadyState is a lead-gen tool. Users don't create
> accounts. The assessment UUID in the URL is the effective bearer token —
> anyone with it can view or continue that assessment. Supabase service role
> is used for all reads and writes; RLS policies remain in place as
> defense-in-depth but are effectively inert for the app code path.

## Routes

```
/                                 public landing page (static)
/assessment/new                   17-step wizard (new or resume via ?id=)
/assessment/[id]/thank-you        contact capture → email delivery
/assessment/[id]/results          HTML report (optional, UUID-gated)
/api/assessment/[id]/report       GET → PDF download
/api/cron/flag-stale              Vercel cron (daily, flags 365+ day old assessments)
```

## Project structure

```
app/
├── page.tsx                      public landing
├── layout.tsx                    root layout (Toaster only, no auth provider)
├── error.tsx / not-found.tsx     global boundaries
└── assessment/
    ├── new/                      wizard + server actions
    │   ├── page.tsx              entry point (loads ?id= for resume)
    │   ├── loading.tsx / error.tsx
    │   ├── actions.ts            createOrgAndAssessment, saveResponse, finalizeAssessment
    │   └── _components/
    │       ├── wizard.tsx        client state machine (17 screens)
    │       ├── org-info-step.tsx
    │       ├── category-step.tsx
    │       ├── question-card.tsx
    │       └── review-step.tsx
    └── [id]/
        ├── thank-you/            contact capture + email send
        │   ├── page.tsx
        │   ├── actions.ts        submitContactAndSendReport
        │   └── _components/
        │       └── contact-form.tsx
        └── results/              optional HTML report view
            ├── page.tsx
            ├── loading.tsx / error.tsx

app/api/
├── assessment/[id]/report/       PDF generation (Node runtime)
└── cron/flag-stale/              scheduled observation (cron secret auth)

lib/
├── assessment/
│   ├── questions.ts              40-question bank with ID stability contract
│   ├── scoring.ts                computeScores (pure) + calculateScores (orchestrator)
│   ├── scoring.test.ts           Vitest unit tests
│   └── recommendations.ts        remediation blurbs keyed by question id
├── pdf/
│   └── AssessmentReport.tsx      react-pdf document
├── email/
│   └── send-report.tsx           Resend + PDF email delivery
└── supabase/
    └── server.ts                 service-role Supabase client

components/
├── ui/                           Button, Card, Input, Textarea, Label, Table, Badge, Skeleton, Progress
├── risk-badge.tsx                shared risk-level pill
└── download-report-button.tsx    PDF trigger with Sonner toasts

supabase/
├── config.toml                   CLI project ref
└── migrations/
    ├── 001_initial_schema.sql    tables, RLS, helpers
    ├── 002_organization_members.sql explicit membership (legacy)
    ├── 003_response_uniqueness.sql upsert constraint + NOT NULL
    ├── 004_profiles.sql          Clerk user mirror (legacy, unused)
    └── 005_public_assessments.sql nullable clerk_user_id + contact columns

.github/
└── workflows/
    └── ci.yml                    tsc + vitest on every push / PR
```

## UI primitives note

`components/ui/` holds hand-written shadcn-style primitives. The wizard's industry dropdown uses a **native HTML `<select>`** styled with Tailwind classes — deliberate choice to avoid the `@radix-ui/react-select` dep footprint for a static list.

## Required environment variables

Copy `.env.local.example` to `.env.local` and fill in.

| Variable | Source | Required | Notes |
|---|---|:---:|---|
| `NEXT_PUBLIC_APP_URL` | you | ✅ | `https://readystate.now` in prod |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → API | ✅ | `https://<ref>.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Settings → API | ✅ | Anon JWT (unused by app code but present for `@supabase/supabase-js` init) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API | ✅ | Trusted-server only; never expose to the browser |
| `RESEND_API_KEY` | https://resend.com → API Keys | ✅ | Required for email delivery from the thank-you page |
| `RESEND_FROM_EMAIL` | you | ⚠️ | Optional override. Defaults to `ReadyState <reports@readystate.now>`. Requires domain verification in Resend to actually deliver from `@readystate.now`. |
| `CRON_SECRET` | any random string | ✅ | Verifies `/api/cron/*` calls; Vercel injects this automatically |

`NEXT_PUBLIC_*` variables are **inlined at build time**. Changing them in Vercel project settings does not update the live site — you must trigger a fresh build (push a commit or click Redeploy without cache).

## Supabase setup

1. **Create a Supabase project** at https://supabase.com → note the project ref and the URL.
2. **Apply the migrations** in `supabase/migrations/` in order. Either via Supabase CLI (`supabase db push` after linking), via the Management API with a PAT, or by pasting each file into the SQL Editor.
3. **Grab the anon key + service role key** from Settings → API and populate `.env.local`.

No third-party auth or RLS configuration is needed — the app uses the service role client throughout and bypasses RLS.

## Resend setup

1. **Create a Resend account** at https://resend.com.
2. **Create an API key** at https://resend.com/api-keys. Starts with `re_`. Set as `RESEND_API_KEY` in `.env.local` and in Vercel Production env vars.
3. **Verify the sending domain:**
   - Go to Resend dashboard → Domains → Add Domain → `readystate.now`
   - Resend gives you DNS records (SPF, DKIM, DMARC) to add at your DNS host
   - Once verified, emails can send from `@readystate.now` addresses
   - Until then, you can test with `RESEND_FROM_EMAIL=onboarding@resend.dev` but only to email addresses you own
4. **Test the send path** by completing an assessment on `localhost:3000` and submitting the thank-you form. Resend logs show the delivery status at https://resend.com/emails.

## Local development

```bash
# Install dependencies
npm install

# Copy env template and fill in credentials
cp .env.local.example .env.local
# edit .env.local with your own keys

# Start the dev server
npm run dev

# Run type checks
npx tsc --noEmit

# Run unit tests (scoring engine)
npm run test

# Production build locally
npm run build
```

Dev server runs on http://localhost:3000.

## Deployment

The canonical deploy target is **Vercel**. The repo is connected to the Vercel project and every push to `main` triggers a build.

1. **Set env vars in Vercel** → Project Settings → Environment Variables. Mark them for the Production environment (and Preview if you want branch deploys to work).
2. **Connect the domain** in Vercel → Project Settings → Domains. Point `readystate.now` at Vercel.
3. **Push to main** — Vercel builds and deploys automatically.

A fresh rebuild is required any time a `NEXT_PUBLIC_*` var is changed. Easiest trigger: empty commit + push.

## Cron

`vercel.json` schedules `/api/cron/flag-stale` for midnight UTC daily. Vercel automatically injects `CRON_SECRET` into cron invocations — the handler verifies the `Authorization: Bearer` header and returns 401 on anything else. Current behavior is observe-only (returns a list of completed assessments older than 365 days).

## Tests + CI

Unit tests cover the pure scoring function (no DB, no mocks). Run with `npm run test`. Located at `lib/assessment/scoring.test.ts`.

**CI:** `.github/workflows/ci.yml` runs `tsc --noEmit` + `vitest` on every push and pull request to `main`. The workflow intentionally does not run `next build` — Vercel runs the build on every push and will show failures in the commit status.

## Known trade-offs

- **UUID as bearer:** Anyone with the assessment UUID can view, continue, or email the report for that assessment. UUIDs are cryptographically random so guessing is infeasible, but the URL should still be treated as sensitive.
- **No user accounts:** There's no way to list "my past assessments" in the app. If a user loses their URL, they lose access. The email delivery addresses this — once the report is sent, the PDF is the record of truth.
- **Legacy migrations 002 and 004** (organization_members, profiles) are orphaned — applied to the database but unused by app code. Not dropped to avoid data-loss risk.
- **Scoring recommendations** only cover weight-3 (critical) questions. Non-critical remediation is a future addition.
- **PDF rendering** is server-side via `@react-pdf/renderer`. Large reports may approach the Vercel function memory limit on the Hobby tier.
- **No anti-spam** on the wizard endpoint. Anyone can POST assessment data. Consider rate limiting or a turnstile challenge before public launch if abuse materializes.

---

Built for Kestralis · Powered by Sentinel Ridge Security
