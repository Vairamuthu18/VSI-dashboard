-- ============================================================
-- VSI Migration 007 — Fix recursive RLS policies
-- ============================================================
-- Migration 006's super_admin policies caused infinite recursion:
-- a policy on profiles queried profiles, which re-evaluated the
-- same policy, causing Postgres to abort with 500. The fix is a
-- SECURITY DEFINER helper function that bypasses RLS internally,
-- combined with `to authenticated` so anon never evaluates these
-- policies (which is what blew up the public invite validation).

-- 1. Helper function
create or replace function public.is_super_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'super_admin'
  );
$$;

grant execute on function public.is_super_admin() to anon, authenticated;

-- 2. Drop recursive policies
drop policy if exists "super_admin_invites_all"   on public.invites;
drop policy if exists "super_admin_all_agencies"  on public.agencies;
drop policy if exists "super_admin_all_profiles"  on public.profiles;
drop policy if exists "super_admin_all_clients"   on public.clients;
drop policy if exists "super_admin_all_keywords"  on public.tracked_keywords;
drop policy if exists "super_admin_all_results"   on public.search_results;

-- 3. Re-create using the helper, restricted to authenticated
create policy "super_admin_invites_all"
  on public.invites for all
  to authenticated
  using (public.is_super_admin())
  with check (public.is_super_admin());

create policy "super_admin_all_agencies"
  on public.agencies for all
  to authenticated
  using (public.is_super_admin())
  with check (public.is_super_admin());

create policy "super_admin_all_profiles"
  on public.profiles for select
  to authenticated
  using (public.is_super_admin());

create policy "super_admin_all_clients"
  on public.clients for all
  to authenticated
  using (public.is_super_admin())
  with check (public.is_super_admin());

create policy "super_admin_all_keywords"
  on public.tracked_keywords for all
  to authenticated
  using (public.is_super_admin())
  with check (public.is_super_admin());

create policy "super_admin_all_results"
  on public.search_results for all
  to authenticated
  using (public.is_super_admin())
  with check (public.is_super_admin());
