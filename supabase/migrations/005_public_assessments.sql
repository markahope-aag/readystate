-- ReadyState: Public anonymous assessment flow + lead capture
--
-- The primary user flow is now: land → take assessment anonymously →
-- submit → enter contact info on a thank-you page → receive PDF report
-- via email. Clerk auth is no longer required to start or complete an
-- assessment. Dashboard/history/results remain Clerk-gated for
-- internal use.
--
-- Changes:
--   1. `assessments.clerk_user_id` is nullable — anonymous assessments
--      have no Clerk user attached
--   2. New `contact_name`, `contact_email`, `contact_role` columns to
--      capture lead information on the thank-you page
--   3. New `email_sent_at` timestamp, set when the PDF report has
--      been successfully delivered to contact_email

alter table public.assessments
  alter column clerk_user_id drop not null;

alter table public.assessments
  add column contact_name  text,
  add column contact_email text,
  add column contact_role  text,
  add column email_sent_at timestamptz;

comment on column public.assessments.contact_name is
  'Name captured on the thank-you page after submission. Nullable for signed-in users who did not go through lead capture.';
comment on column public.assessments.contact_email is
  'Email captured on the thank-you page. Used to deliver the PDF report.';
comment on column public.assessments.contact_role is
  'Job title / role captured on the thank-you page. Used for lead qualification.';
comment on column public.assessments.email_sent_at is
  'Timestamp the PDF report was successfully emailed. Null until Resend confirms delivery.';

-- Lead lookup
create index assessments_contact_email_lower_idx
  on public.assessments (lower(contact_email));

-- ─────────────────────────────────────────────────────────────────────
-- RLS adjustment: anonymous reads via service role
--
-- Anonymous wizard writes and reads use the Supabase service role,
-- which bypasses RLS entirely. The existing RLS policies on
-- assessments / responses / scores / organizations / members still
-- apply to the authenticated (dashboard/history) surfaces. No change
-- needed here.
-- ─────────────────────────────────────────────────────────────────────
