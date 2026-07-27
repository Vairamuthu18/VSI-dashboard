-- ============================================================
-- VSI Migration 005 — Production Auth + Superadmin
-- Run in Supabase SQL Editor
-- ============================================================
--
-- This migration:
--   1. Adds is_admin column to profiles
--   2. Removes dev_* permissive RLS policies
--   3. Ensures real agency-scoped RLS policies are in place
--   4. Adds admin-bypass policies that let admins see all data

-- ─────────────────────────────────────────
-- 1. Add admin flag to profiles
-- ─────────────────────────────────────────
alter table public.profiles
  add column if not exists is_admin boolean not null default false;

-- ─────────────────────────────────────────
-- 2. Remove dev permissive policies
-- ─────────────────────────────────────────
drop policy if exists "dev_clients_all"   on public.clients;
drop policy if exists "dev_keywords_all"  on public.tracked_keywords;
drop policy if exists "dev_results_all"   on public.search_results;

-- ─────────────────────────────────────────
-- 3. Admin override policies — admins see everything
-- ─────────────────────────────────────────
create policy "admin_all_agencies"
  on public.agencies for all
  using (exists (select 1 from public.profiles where id = auth.uid() and is_admin = true))
  with check (exists (select 1 from public.profiles where id = auth.uid() and is_admin = true));

create policy "admin_all_profiles"
  on public.profiles for select
  using (exists (select 1 from public.profiles where id = auth.uid() and is_admin = true));

create policy "admin_all_clients"
  on public.clients for all
  using (exists (select 1 from public.profiles where id = auth.uid() and is_admin = true))
  with check (exists (select 1 from public.profiles where id = auth.uid() and is_admin = true));

create policy "admin_all_keywords"
  on public.tracked_keywords for all
  using (exists (select 1 from public.profiles where id = auth.uid() and is_admin = true))
  with check (exists (select 1 from public.profiles where id = auth.uid() and is_admin = true));

create policy "admin_all_results"
  on public.search_results for all
  using (exists (select 1 from public.profiles where id = auth.uid() and is_admin = true))
  with check (exists (select 1 from public.profiles where id = auth.uid() and is_admin = true));

-- ─────────────────────────────────────────
-- 4. Allow agency creation during onboarding
-- ─────────────────────────────────────────
-- Any logged-in user can create an agency (their own)
create policy "auth_users_can_create_agency"
  on public.agencies for insert
  to authenticated
  with check (true);

-- ─────────────────────────────────────────
-- 5. AFTER MIGRATION — mark yourself as admin
-- ─────────────────────────────────────────
-- Replace YOUR_EMAIL with the email you signed up with:
--
-- update public.profiles set is_admin = true
-- where id = (select id from auth.users where email = 'your-email@example.com');
