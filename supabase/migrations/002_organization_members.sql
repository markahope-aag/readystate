-- ReadyState: Explicit organization membership
--
-- Replaces the derived-from-assessments membership model (migration 001)
-- with a real organization_members table. This enables multi-user orgs,
-- roles, and invite flows without breaking existing RLS policies — the
-- `public.user_belongs_to_org()` helper is rewritten to query the new
-- table, so every existing policy keeps working.
--
-- Rollout safety:
--   1. Create table + indexes
--   2. Backfill from existing assessments so current users keep access
--   3. Add trigger that auto-promotes org creator to owner on insert
--   4. Rewrite helper functions
--   5. Enable RLS on the new table

-- ---------------------------------------------------------------------------
-- Table
-- ---------------------------------------------------------------------------
create table public.organization_members (
  org_id         uuid not null references public.organizations(id) on delete cascade,
  clerk_user_id  text not null,
  role           text not null default 'member'
                   check (role in ('owner', 'admin', 'member')),
  created_at     timestamptz not null default now(),
  primary key (org_id, clerk_user_id)
);

create index organization_members_clerk_user_id_idx
  on public.organization_members (clerk_user_id);

-- ---------------------------------------------------------------------------
-- Backfill: everyone who currently has an assessment in an org becomes an
-- owner of that org. Idempotent via ON CONFLICT.
-- ---------------------------------------------------------------------------
insert into public.organization_members (org_id, clerk_user_id, role)
select distinct a.org_id, a.clerk_user_id, 'owner'
from public.assessments a
on conflict (org_id, clerk_user_id) do nothing;

-- ---------------------------------------------------------------------------
-- Trigger: when a new organization is inserted by an authenticated user,
-- auto-add them as the first owner. Runs SECURITY DEFINER so it bypasses
-- org_members RLS (which would otherwise reject the insert because the user
-- isn't an admin of an org that doesn't exist yet).
-- ---------------------------------------------------------------------------
create or replace function public.add_creator_as_org_owner()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.clerk_user_id() is not null then
    insert into public.organization_members (org_id, clerk_user_id, role)
    values (new.id, public.clerk_user_id(), 'owner')
    on conflict (org_id, clerk_user_id) do nothing;
  end if;
  return new;
end;
$$;

create trigger organizations_add_creator_as_owner
  after insert on public.organizations
  for each row execute function public.add_creator_as_org_owner();

-- ---------------------------------------------------------------------------
-- Rewrite org membership helper to query the new table.
-- SECURITY DEFINER so policies that call this don't hit RLS recursion.
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
    from public.organization_members
    where org_id = target_org_id
      and clerk_user_id = public.clerk_user_id()
  );
$$;

-- ---------------------------------------------------------------------------
-- Admin check helper (owners + admins can manage members).
-- SECURITY DEFINER to avoid recursive RLS on organization_members.
-- ---------------------------------------------------------------------------
create or replace function public.user_is_org_admin(target_org_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.organization_members
    where org_id = target_org_id
      and clerk_user_id = public.clerk_user_id()
      and role in ('owner', 'admin')
  );
$$;

-- ---------------------------------------------------------------------------
-- RLS on organization_members
-- ---------------------------------------------------------------------------
alter table public.organization_members enable row level security;

-- SELECT: your own memberships, plus other members of orgs you belong to
create policy "organization_members_select"
  on public.organization_members for select
  using (
    clerk_user_id = public.clerk_user_id()
    or public.user_belongs_to_org(org_id)
  );

-- INSERT: only owners/admins of the target org can add new members.
-- The initial owner is added by the SECURITY DEFINER trigger above,
-- which bypasses this policy.
create policy "organization_members_insert"
  on public.organization_members for insert
  with check (public.user_is_org_admin(org_id));

-- UPDATE (changing roles): owners/admins only
create policy "organization_members_update"
  on public.organization_members for update
  using (public.user_is_org_admin(org_id))
  with check (public.user_is_org_admin(org_id));

-- DELETE: owners/admins can remove anyone; users can remove themselves
create policy "organization_members_delete"
  on public.organization_members for delete
  using (
    clerk_user_id = public.clerk_user_id()
    or public.user_is_org_admin(org_id)
  );
