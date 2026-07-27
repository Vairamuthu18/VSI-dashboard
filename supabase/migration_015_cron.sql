-- ============================================================
-- VSI Migration 015 — Cron auto-runs for clients
-- ============================================================
-- Tracks when each client was last automatically picked up by the
-- cron runner, plus a small log table of cron tick activity.

alter table public.clients
  add column if not exists last_auto_run_at timestamptz;

create index if not exists idx_clients_last_auto_run_at
  on public.clients (last_auto_run_at nulls first);

create table if not exists public.cron_runs (
  id                  uuid primary key default gen_random_uuid(),
  started_at          timestamptz not null default now(),
  finished_at         timestamptz,
  clients_processed   int default 0,
  keywords_processed  int default 0,
  errors              text[]
);

create index if not exists idx_cron_runs_started_at on public.cron_runs(started_at desc);

-- Cron history is super-admin only (operational data, not per-tenant)
alter table public.cron_runs enable row level security;
drop policy if exists "cron_runs_super_admin_all" on public.cron_runs;
create policy "cron_runs_super_admin_all"
  on public.cron_runs for all
  to authenticated
  using (public.is_super_admin())
  with check (public.is_super_admin());

grant all on public.cron_runs to service_role;
