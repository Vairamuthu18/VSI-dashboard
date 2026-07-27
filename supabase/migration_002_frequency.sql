-- ============================================================
-- VSI Migration 002 — Check Frequency
-- Run in Supabase SQL Editor
-- ============================================================

alter table public.clients
  add column if not exists check_frequency text not null default 'manual'
    check (check_frequency in ('manual', 'daily', 'every_3_days', 'weekly'));

alter table public.clients
  add column if not exists last_run_at timestamptz;

alter table public.tracked_keywords
  add column if not exists last_run_at timestamptz;

-- Index for scheduling: find clients due for a run
create index if not exists idx_clients_frequency_run
  on public.clients (check_frequency, last_run_at);
