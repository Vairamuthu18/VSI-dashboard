-- ============================================================
-- VSI Migration 006 — Production Auth, Roles, Invites
-- ============================================================
-- Run this in Supabase SQL Editor.
-- After running, mark yourself as super_admin (see end of file).

-- ─────────────────────────────────────────
-- 1. Drop the dev permissive policies
-- ─────────────────────────────────────────
drop policy if exists "dev_clients_all"   on public.clients;
drop policy if exists "dev_keywords_all"  on public.tracked_keywords;
drop policy if exists "dev_results_all"   on public.search_results;
drop policy if exists "admin_all_agencies"  on public.agencies;
drop policy if exists "admin_all_profiles"  on public.profiles;
drop policy if exists "admin_all_clients"   on public.clients;
drop policy if exists "admin_all_keywords"  on public.tracked_keywords;
drop policy if exists "admin_all_results"   on public.search_results;

-- ─────────────────────────────────────────
-- 2. Add role column (replaces is_admin)
-- ─────────────────────────────────────────
alter table public.profiles
  add column if not exists role text not null default 'pilot'
    check (role in ('super_admin', 'pilot'));

-- Migrate any old is_admin = true rows to super_admin
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'profiles' and column_name = 'is_admin'
  ) then
    execute 'update public.profiles set role = ''super_admin'' where is_admin = true';
    execute 'alter table public.profiles drop column is_admin';
  end if;
end $$;

-- ─────────────────────────────────────────
-- 3. Agencies: pilot limits
-- ─────────────────────────────────────────
alter table public.agencies
  add column if not exists max_keywords int not null default 10,
  add column if not exists is_pilot boolean not null default true;

-- ─────────────────────────────────────────
-- 4. Invites table
-- ─────────────────────────────────────────
create table if not exists public.invites (
  id            uuid primary key default gen_random_uuid(),
  code          text unique not null,
  email         text,
  role          text not null default 'pilot' check (role in ('super_admin', 'pilot')),
  max_keywords  int not null default 10,
  note          text,                       -- optional: who/why
  is_active     boolean not null default true,  -- super admin can disable anytime
  created_by    uuid references public.profiles(id) on delete set null,
  used_by       uuid references public.profiles(id) on delete set null,
  used_at       timestamptz,
  created_at    timestamptz not null default now()
);

alter table public.invites enable row level security;

-- Public can validate an invite code (read-only, only if unused and active)
create policy "public_invite_validation"
  on public.invites for select
  using (used_by is null and is_active = true);

-- Grant table-level access so RLS policies actually apply for anon/authenticated
grant select on public.invites to anon;
grant select, update on public.invites to authenticated;
grant all on public.invites to service_role;

-- Super admin can manage all invites
create policy "super_admin_invites_all"
  on public.invites for all
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'super_admin'))
  with check (exists (select 1 from public.profiles where id = auth.uid() and role = 'super_admin'));

-- ─────────────────────────────────────────
-- 5. Super admin cross-tenant policies
-- ─────────────────────────────────────────
create policy "super_admin_all_agencies"
  on public.agencies for all
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'super_admin'))
  with check (exists (select 1 from public.profiles where id = auth.uid() and role = 'super_admin'));

create policy "super_admin_all_profiles"
  on public.profiles for select
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'super_admin'));

create policy "super_admin_all_clients"
  on public.clients for all
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'super_admin'))
  with check (exists (select 1 from public.profiles where id = auth.uid() and role = 'super_admin'));

create policy "super_admin_all_keywords"
  on public.tracked_keywords for all
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'super_admin'))
  with check (exists (select 1 from public.profiles where id = auth.uid() and role = 'super_admin'));

create policy "super_admin_all_results"
  on public.search_results for all
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'super_admin'))
  with check (exists (select 1 from public.profiles where id = auth.uid() and role = 'super_admin'));

-- ─────────────────────────────────────────
-- 6. Allow authenticated users to create their own agency during onboarding
-- ─────────────────────────────────────────
create policy "auth_users_create_own_agency"
  on public.agencies for insert
  to authenticated
  with check (true);

-- Allow users to update their own profile
create policy "users_update_own_profile"
  on public.profiles for update
  using (id = auth.uid());

-- ─────────────────────────────────────────
-- 7. Enforce 10-keyword limit for pilot agencies (trigger)
-- ─────────────────────────────────────────
create or replace function public.enforce_keyword_limit()
returns trigger as $$
declare
  agency_max int;
  current_count int;
begin
  select max_keywords into agency_max from public.agencies where id = NEW.agency_id;
  select count(*) into current_count from public.tracked_keywords where agency_id = NEW.agency_id;
  if current_count >= agency_max then
    raise exception 'Keyword limit reached for this agency (% of %)', current_count, agency_max;
  end if;
  return NEW;
end;
$$ language plpgsql;

drop trigger if exists keyword_limit_trigger on public.tracked_keywords;
create trigger keyword_limit_trigger
  before insert on public.tracked_keywords
  for each row execute function public.enforce_keyword_limit();

-- ─────────────────────────────────────────
-- 8. AFTER RUNNING — make yourself super_admin
-- ─────────────────────────────────────────
-- Step A: register a normal account on the live site using your email
-- Step B: come back here and run (with your email):
--
-- update public.profiles set role = 'super_admin'
-- where id = (select id from auth.users where email = 'your-email@example.com');
--
-- Step C: also update your agency to remove the keyword cap:
--
-- update public.agencies set max_keywords = 999999, is_pilot = false
-- where id = (select agency_id from public.profiles where id = (
--   select id from auth.users where email = 'your-email@example.com'
-- ));
