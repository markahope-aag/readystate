-- ReadyState: Profiles table for Clerk user sync
--
-- Mirror of user metadata pushed from Clerk via webhook. Existing features
-- don't need this — Clerk JWTs carry the user id via `sub` and RLS uses
-- `public.clerk_user_id()` to gate rows. The profiles table enables
-- server-side user lookup without a Clerk API round-trip, JOINs from
-- assessments to user metadata, and future analytics / email campaigns.
--
-- The Clerk webhook handler writes via the service role, bypassing RLS.
-- End users can only SELECT their own profile row.

create table public.profiles (
  clerk_user_id text primary key,
  email         text,
  first_name    text,
  last_name     text,
  image_url     text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index profiles_email_lower_idx
  on public.profiles (lower(email));

alter table public.profiles enable row level security;

create policy "profiles_select_own"
  on public.profiles for select
  using (clerk_user_id = public.clerk_user_id());

-- No insert/update/delete policies — writes happen via service role only.

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();
