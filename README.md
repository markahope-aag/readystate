# ReadyState

Workplace Violence Prevention Assessment tool for California **SB 553** compliance, by Kestralis. Scores programs against three dimensions:

1. **SB 553 Statutory Compliance** — California Labor Code §6401.9 minimums
2. **ASIS WVPI AA-2020** — professional standard benchmarks
3. **Site Hazard Profile** — physical and operational risk factors

Each submitted assessment produces a weighted score, an overall risk rating (critical → low), a prioritized gap list, and remediation guidance for every critical failure — rendered in-app and exportable as a Kestralis-branded PDF.

---

## Stack

| Layer | Tool |
|---|---|
| Framework | **Next.js 16** (App Router, Turbopack, React 19) |
| Language | TypeScript (strict) |
| Auth | **Clerk v7** — third-party-auth integration with Supabase |
| Database + RLS | **Supabase Postgres** (managed) |
| Data access | `@supabase/ssr` with Clerk JWT forwarding |
| Styling | **Tailwind CSS** + shadcn-style primitives under `components/ui/` |
| PDF | `@react-pdf/renderer` (server-side via `renderToBuffer`) |
| Toasts | `sonner` |
| Tests | **Vitest** (pure-function unit tests for the scoring engine) |
| Hosting | **Vercel** (Node runtime) |

## Routes

```
/                                 public landing page
/sign-in                          Clerk-hosted sign-in (branded wrapper)
/sign-up                          Clerk-hosted sign-up (branded wrapper)
/dashboard                        stats + recent assessments
/history                          filterable + sortable history
/assessment/new                   17-step wizard (new or resume via ?id=)
/assessment/[id]/results          full HTML report
/api/assessment/[id]/report       GET → PDF download (Clerk-gated)
/api/webhooks/clerk               POST → Clerk → profiles table sync (svix-verified)
/api/cron/flag-stale              Vercel cron (daily, flags 365+ day old assessments)
```

All `/dashboard`, `/history`, and `/assessment/*` routes are gated by Clerk via `proxy.ts`. Unauthenticated requests are redirected to `/`.

> **About `proxy.ts`:** Next.js 15+ renamed the `middleware.ts` file
> convention to `proxy.ts`. Despite the name it's not a reverse proxy
> or Vercel Edge shim — same runtime behavior as Next 14's `middleware.ts`,
> same `clerkMiddleware` wrapper. The rename was motivated by
> "middleware" being overloaded with Express-style expectations Next's
> model doesn't match. Don't let the filename confuse you.

## Project structure

```
app/
├── page.tsx                      public landing
├── layout.tsx                    ClerkProvider + Sonner
├── error.tsx / not-found.tsx     global boundaries
├── sign-in/[[...sign-in]]/       branded Clerk <SignIn /> wrapper
├── sign-up/[[...sign-up]]/       branded Clerk <SignUp /> wrapper
├── (dashboard)/                  auth-gated routes (route group, no URL prefix)
│   ├── layout.tsx                shared AppHeader for all dashboard surfaces
│   ├── dashboard/
│   ├── history/
│   └── assessment/
│       ├── new/                  wizard + server actions
│       └── [id]/results/         report page
└── api/
    ├── assessment/[id]/report/   PDF generation (Node runtime)
    ├── webhooks/clerk/           Clerk → profiles sync (svix signature)
    └── cron/flag-stale/          scheduled observation

lib/
├── assessment/
│   ├── questions.ts              40-question bank with ID stability contract
│   ├── scoring.ts                computeScores (pure) + calculateScores (orchestrator)
│   ├── scoring.test.ts           Vitest unit tests
│   ├── recommendations.ts        remediation blurbs keyed by question id
│   └── queries.ts                shared read-side query helper
├── pdf/
│   └── AssessmentReport.tsx      react-pdf document
└── supabase/
    ├── client.ts                 browser client + Clerk token forwarding
    └── server.ts                 server client + service-role client

components/
├── ui/                           Button, Card, Input, Table, Badge, Skeleton, etc.
├── app-header.tsx                shared authenticated nav
├── risk-badge.tsx                shared risk-level pill
├── clickable-table-row.tsx       client-side row navigation
└── download-report-button.tsx    PDF trigger with Sonner toasts

supabase/
├── config.toml                   CLI project ref
└── migrations/
    ├── 001_initial_schema.sql    tables, RLS, helpers
    ├── 002_organization_members.sql explicit membership
    ├── 003_response_uniqueness.sql upsert constraint + NOT NULL
    └── 004_profiles.sql          Clerk user mirror table

.github/
└── workflows/
    └── ci.yml                    tsc + vitest on every push / PR
```

## UI primitives note

`components/ui/` holds hand-written shadcn-style primitives (Button, Card, Input, Textarea, Label, Table, Badge, Skeleton, Progress). No `select.tsx` exists — the wizard's industry dropdown uses a **native HTML `<select>`** styled with Tailwind classes matching the input aesthetic. This is deliberate: shadcn Select requires `@radix-ui/react-select` plus popper/portal machinery for a modest UX gain on a short, static list. Native `<select>` is accessible by default and renders the OS dropdown. If we ever need a search-filterable / long-list select, we'll add the shadcn Select component then.

## Required environment variables

Copy `.env.local.example` to `.env.local` and fill in.

| Variable | Source | Required | Notes |
|---|---|:---:|---|
| `NEXT_PUBLIC_APP_URL` | you | ✅ | `https://readystate.now` in prod |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk dashboard → API Keys | ✅ | `pk_live_*` in prod, `pk_test_*` in dev |
| `CLERK_SECRET_KEY` | Clerk dashboard → API Keys | ✅ | `sk_live_*` in prod |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | `/sign-in` | ✅ | Points Clerk at our branded sign-in route |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | `/sign-up` | ✅ | Points Clerk at our branded sign-up route |
| `CLERK_WEBHOOK_SECRET` | Clerk dashboard → Webhooks → Signing Secret | ✅ | Verifies POSTs to `/api/webhooks/clerk` |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → API | ✅ | `https://<ref>.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Settings → API | ✅ | Anon JWT |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API | ✅ | Trusted-server only; never expose to the browser |
| `CRON_SECRET` | any random string | ✅ | Verifies `/api/cron/*` calls; Vercel injects this automatically |

`NEXT_PUBLIC_*` variables are **inlined at build time**. Changing them in Vercel project settings does not update the live site — you must trigger a fresh build (push a commit or click Redeploy without cache).

## Supabase setup

1. **Create a Supabase project** at https://supabase.com → note the project ref and the URL.
2. **Apply the migrations** in `supabase/migrations/` in order. Either:
   - Supabase CLI:
     ```bash
     npx supabase link --project-ref <your-ref>
     npx supabase db push
     ```
   - Or via the Management API with a Personal Access Token:
     ```bash
     node -e "
       const fs=require('fs');
       const sql=fs.readFileSync('supabase/migrations/001_initial_schema.sql','utf8');
       fetch('https://api.supabase.com/v1/projects/<your-ref>/database/query',{
         method:'POST',
         headers:{Authorization:'Bearer '+process.env.SUPABASE_ACCESS_TOKEN,'Content-Type':'application/json'},
         body:JSON.stringify({query:sql})
       }).then(r=>r.text()).then(console.log);
     "
     ```
   - Or paste each file into the SQL Editor in the Supabase dashboard.
3. **Register Clerk as a third-party auth provider** so Supabase verifies Clerk JWTs against Clerk's JWKS:
   ```bash
   curl -X POST "https://api.supabase.com/v1/projects/<ref>/config/auth/third-party-auth" \
     -H "Authorization: Bearer $SUPABASE_ACCESS_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"type":"clerk","oidc_issuer_url":"https://clerk.<your-domain>"}'
   ```
   The OIDC issuer URL is your Clerk Frontend API URL — base64-decode the part after `pk_live_` in your publishable key to find it.

RLS policies in migration 001 gate every table by `auth.jwt() ->> 'sub'` (the Clerk user ID), so no additional configuration is needed on the Supabase side.

## Clerk setup

1. **Create a Clerk application** at https://dashboard.clerk.com. For production use, provision a production instance (test instances have a 500-user cap and shared OAuth credentials that won't work on custom domains).
2. **Verify your domain** in Clerk dashboard → Domains. Production instances reject sign-in from unverified domains.
3. **Configure sign-in methods** in User & Authentication → Email, Phone, Username and Social Connections. If using Google OAuth on a production instance, you must provide your own Google Cloud OAuth client ID + secret (Clerk does not share dev OAuth credentials with production instances).
4. **Copy your keys** from API Keys and set them in your env.
5. **Configure the user-sync webhook:**
   - Clerk dashboard → **Webhooks** → **Add Endpoint**
   - Endpoint URL: `https://<your-domain>/api/webhooks/clerk`
   - Subscribe to events: `user.created`, `user.updated`, `user.deleted`
   - Copy the **Signing Secret** and set it as `CLERK_WEBHOOK_SECRET` in your env (both local and Vercel).
   - The handler at `app/api/webhooks/clerk/route.ts` verifies the svix signature and upserts/deletes rows in the `public.profiles` table (created by migration 004). RLS lets users SELECT only their own profile; writes happen via the service role.

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
2. **Connect the domain** in Vercel → Project Settings → Domains. Point `readystate.now` at Vercel per the instructions shown there.
3. **Push to main** — Vercel builds and deploys automatically.

A fresh rebuild is required any time a `NEXT_PUBLIC_*` var is changed. Easiest trigger:

```bash
git commit --allow-empty -m "chore: trigger rebuild for env var update"
git push origin main
```

## Cron

`vercel.json` schedules `/api/cron/flag-stale` for midnight UTC daily. Vercel automatically injects `CRON_SECRET` into cron invocations — the handler verifies the `Authorization: Bearer` header and returns 401 on anything else. Current behavior is observe-only (returns a list of completed assessments older than 365 days). To enforce annual re-assessment, extend the handler to write an `expired_at` column via a follow-up migration.

## Tests + CI

Unit tests cover the pure scoring function (no DB, no mocks). Run with:

```bash
npm run test
```

Located at `lib/assessment/scoring.test.ts`. The orchestrator `calculateScores` is covered indirectly by manual verification against the live results page.

**CI:** `.github/workflows/ci.yml` runs `tsc --noEmit` + `vitest` on every push and pull request to `main`. Lint runs in soft-fail mode until the ESLint config is finalized. The workflow intentionally does **not** run `next build` because the build requires real env vars (Clerk keys, Supabase URL) that shouldn't be in CI — Vercel runs the build on every push anyway and will show failures in the PR / commit status.

## Known trade-offs

- **Organization membership** is explicit but thin. The `organization_members` table exists with owner/admin/member roles, but invite flows, transfer-of-ownership, and cross-org dashboards are not built.
- **Question ID stability** is a contract documented in `lib/assessment/questions.ts`. Renumbering an existing question orphans response rows. Mark questions `deprecated: true` instead.
- **Scoring recommendations** only cover weight-3 (critical) questions. Non-critical remediation is a future addition.
- **Clerk Google OAuth** on production requires user-provided OAuth credentials — Clerk does not ship defaults for prod instances.
- **PDF rendering** is server-side via `@react-pdf/renderer`. Large reports may approach the Vercel function memory limit on the Hobby tier. Upgrade to Pro if you see timeouts.
- **No competitive features yet:** corrective-action task tracking, anonymous incident reporting portal, training log, and multi-site roll-up reporting are on the roadmap but not implemented.

---

Built for Kestralis · Powered by Sentinel Ridge Security
