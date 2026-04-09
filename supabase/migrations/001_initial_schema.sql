-- ReadyState: Workplace Violence Prevention Assessment (California SB 553)
-- Initial schema + RLS policies
--
-- Auth model: Clerk issues JWTs that Supabase verifies (Clerk "Supabase" JWT
-- template). The Clerk user ID lives in the JWT `sub` claim and is accessed
-- via `auth.jwt() ->> 'sub'` — NOT `auth.uid()`, which returns a Supabase
-- auth.users UUID that won't exist in this setup.
--
-- Org membership is derived from the `assessments` table: a user belongs to
-- an org if they have at least one assessment row for it. This is a
-- deliberate simplification because the spec does not include an explicit
-- org_members table. When multi-user orgs are needed, replace
-- `public.user_belongs_to_org()` with a lookup against a real membership
-- table.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Helper: current Clerk user ID (from JWT)
-- ---------------------------------------------------------------------------
create or replace function public.clerk_user_id()
returns text
language sql
stable
as $$
  select nullif(auth.jwt() ->> 'sub', '');
$$;

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------
create table public.organizations (
  id                    uuid primary key default gen_random_uuid(),
  name                  text not null,
  industry              text,
  employee_count        integer,
  california_locations  integer,
  created_at            timestamptz not null default now()
);

create table public.assessments (
  id              uuid primary key default gen_random_uuid(),
  org_id          uuid not null references public.organizations(id) on delete cascade,
  clerk_user_id   text not null,
  status          text not null default 'in_progress'
                    check (status in ('in_progress', 'complete')),
  site_name       text,
  site_address    text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create table public.assessment_responses (
  id             uuid primary key default gen_random_uuid(),
  assessment_id  uuid not null references public.assessments(id) on delete cascade,
  question_id    text not null,
  response       text check (response in ('yes', 'no', 'partial', 'na')),
  notes          text,
  created_at     timestamptz not null default now()
);

create table public.assessment_scores (
  id             uuid primary key default gen_random_uuid(),
  assessment_id  uuid not null unique references public.assessments(id) on delete cascade,
  sb553_score    integer,
  asis_score     integer,
  hazard_score   integer,
  overall_score  integer,
  risk_level     text check (risk_level in ('critical', 'high', 'moderate', 'low')),
  created_at     timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------
create index assessments_clerk_user_id_idx
  on public.assessments (clerk_user_id);

create index assessments_org_id_idx
  on public.assessments (org_id);

create index assessment_responses_assessment_id_idx
  on public.assessment_responses (assessment_id);

create index assessment_scores_assessment_id_idx
  on public.assessment_scores (assessment_id);

-- ---------------------------------------------------------------------------
-- updated_at trigger for assessments
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger assessments_set_updated_at
  before update on public.assessments
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Org membership helper
--
-- SECURITY DEFINER so the inner SELECT on `assessments` bypasses that table's
-- RLS; otherwise the policy check would recurse on itself. search_path is
-- pinned to prevent search_path hijacking.
-- ---------------------------------------------------------------------------
create or replace function public.user_belongs_to_org(target_org_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.assessments
    where org_id = target_org_id
      and clerk_user_id = public.clerk_user_id()
  );
$$;

-- ---------------------------------------------------------------------------
-- Enable RLS
-- ---------------------------------------------------------------------------
alter table public.organizations        enable row level security;
alter table public.assessments          enable row level security;
alter table public.assessment_responses enable row level security;
alter table public.assessment_scores    enable row level security;

-- ---------------------------------------------------------------------------
-- RLS: organizations
-- ---------------------------------------------------------------------------
create policy "organizations_select_if_member"
  on public.organizations for select
  using (public.user_belongs_to_org(id));

create policy "organizations_insert_authenticated"
  on public.organizations for insert
  with check (public.clerk_user_id() is not null);

create policy "organizations_update_if_member"
  on public.organizations for update
  using (public.user_belongs_to_org(id))
  with check (public.user_belongs_to_org(id));

create policy "organizations_delete_if_member"
  on public.organizations for delete
  using (public.user_belongs_to_org(id));

-- ---------------------------------------------------------------------------
-- RLS: assessments (own rows OR same-org rows)
-- ---------------------------------------------------------------------------
create policy "assessments_select_own_or_org"
  on public.assessments for select
  using (
    clerk_user_id = public.clerk_user_id()
    or public.user_belongs_to_org(org_id)
  );

create policy "assessments_insert_own"
  on public.assessments for insert
  with check (clerk_user_id = public.clerk_user_id());

create policy "assessments_update_own_or_org"
  on public.assessments for update
  using (
    clerk_user_id = public.clerk_user_id()
    or public.user_belongs_to_org(org_id)
  )
  with check (
    clerk_user_id = public.clerk_user_id()
    or public.user_belongs_to_org(org_id)
  );

create policy "assessments_delete_own_or_org"
  on public.assessments for delete
  using (
    clerk_user_id = public.clerk_user_id()
    or public.user_belongs_to_org(org_id)
  );

-- ---------------------------------------------------------------------------
-- RLS: assessment_responses (gated through parent assessment)
-- ---------------------------------------------------------------------------
create policy "assessment_responses_select_via_assessment"
  on public.assessment_responses for select
  using (
    exists (
      select 1 from public.assessments a
      where a.id = assessment_id
        and (
          a.clerk_user_id = public.clerk_user_id()
          or public.user_belongs_to_org(a.org_id)
        )
    )
  );

create policy "assessment_responses_insert_via_assessment"
  on public.assessment_responses for insert
  with check (
    exists (
      select 1 from public.assessments a
      where a.id = assessment_id
        and (
          a.clerk_user_id = public.clerk_user_id()
          or public.user_belongs_to_org(a.org_id)
        )
    )
  );

create policy "assessment_responses_update_via_assessment"
  on public.assessment_responses for update
  using (
    exists (
      select 1 from public.assessments a
      where a.id = assessment_id
        and (
          a.clerk_user_id = public.clerk_user_id()
          or public.user_belongs_to_org(a.org_id)
        )
    )
  )
  with check (
    exists (
      select 1 from public.assessments a
      where a.id = assessment_id
        and (
          a.clerk_user_id = public.clerk_user_id()
          or public.user_belongs_to_org(a.org_id)
        )
    )
  );

create policy "assessment_responses_delete_via_assessment"
  on public.assessment_responses for delete
  using (
    exists (
      select 1 from public.assessments a
      where a.id = assessment_id
        and (
          a.clerk_user_id = public.clerk_user_id()
          or public.user_belongs_to_org(a.org_id)
        )
    )
  );

-- ---------------------------------------------------------------------------
-- RLS: assessment_scores (gated through parent assessment)
-- ---------------------------------------------------------------------------
create policy "assessment_scores_select_via_assessment"
  on public.assessment_scores for select
  using (
    exists (
      select 1 from public.assessments a
      where a.id = assessment_id
        and (
          a.clerk_user_id = public.clerk_user_id()
          or public.user_belongs_to_org(a.org_id)
        )
    )
  );

create policy "assessment_scores_insert_via_assessment"
  on public.assessment_scores for insert
  with check (
    exists (
      select 1 from public.assessments a
      where a.id = assessment_id
        and (
          a.clerk_user_id = public.clerk_user_id()
          or public.user_belongs_to_org(a.org_id)
        )
    )
  );

create policy "assessment_scores_update_via_assessment"
  on public.assessment_scores for update
  using (
    exists (
      select 1 from public.assessments a
      where a.id = assessment_id
        and (
          a.clerk_user_id = public.clerk_user_id()
          or public.user_belongs_to_org(a.org_id)
        )
    )
  )
  with check (
    exists (
      select 1 from public.assessments a
      where a.id = assessment_id
        and (
          a.clerk_user_id = public.clerk_user_id()
          or public.user_belongs_to_org(a.org_id)
        )
    )
  );

create policy "assessment_scores_delete_via_assessment"
  on public.assessment_scores for delete
  using (
    exists (
      select 1 from public.assessments a
      where a.id = assessment_id
        and (
          a.clerk_user_id = public.clerk_user_id()
          or public.user_belongs_to_org(a.org_id)
        )
    )
  );
