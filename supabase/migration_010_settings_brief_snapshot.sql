-- ============================================================
-- VSI Migration 010 — System Settings + Brief Staleness
-- ============================================================

-- Generic key/value store for super-admin toggles.
create table if not exists public.system_settings (
  key         text primary key,
  value       jsonb not null,
  updated_at  timestamptz not null default now(),
  updated_by  uuid references public.profiles(id) on delete set null
);

alter table public.system_settings enable row level security;

-- Super admin reads & writes
drop policy if exists "super_admin_settings_all" on public.system_settings;
create policy "super_admin_settings_all"
  on public.system_settings for all
  to authenticated
  using (public.is_super_admin())
  with check (public.is_super_admin());

-- Pipeline code (server-side) reads via service_role anyway, but we also let
-- authenticated users read so client components can render the toggle state.
drop policy if exists "auth_users_read_settings" on public.system_settings;
create policy "auth_users_read_settings"
  on public.system_settings for select
  to authenticated
  using (true);

grant select on public.system_settings to anon, authenticated;
grant all on public.system_settings to service_role;

-- Seed defaults (no-ops if already present)
insert into public.system_settings (key, value)
values
  ('chatgpt_api_enabled',       'true'::jsonb),
  ('chatgpt_extension_enabled', 'false'::jsonb)
on conflict (key) do nothing;

-- ── Brief staleness: snapshot the signals at brief generation time ──
alter table public.tracked_keywords
  add column if not exists ai_brief_snapshot jsonb;
