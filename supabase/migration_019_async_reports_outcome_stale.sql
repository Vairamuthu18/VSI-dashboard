-- ============================================================
-- VSI Migration 019 — Async reports + outcome verification + task staleness
-- ============================================================

-- ─── reports: status column ──────────────────────────────────
-- Reports become async: a "pending" row is inserted immediately and
-- the heavy LLM generation runs in a background after() callback.
-- The client polls for completion.

alter table public.reports
  add column if not exists status text not null default 'ready';

alter table public.reports
  add column if not exists error_message text;

-- Ensure existing rows are flagged ready (default already does this for
-- new rows; explicit for any null-shaped legacy values).
update public.reports set status = 'ready' where status is null;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'reports_status_check') then
    alter table public.reports
      add constraint reports_status_check
      check (status in ('pending', 'ready', 'failed'));
  end if;
end$$;

create index if not exists idx_reports_status on public.reports(status);

-- ─── tasks: stale detection + outcome verification ───────────

alter table public.tasks
  add column if not exists context_snapshot jsonb;

alter table public.tasks
  add column if not exists outcome_status text;

alter table public.tasks
  add column if not exists outcome_checked_at timestamptz;

alter table public.tasks
  add column if not exists outcome_note text;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'tasks_outcome_status_check') then
    alter table public.tasks
      add constraint tasks_outcome_status_check
      check (outcome_status is null or outcome_status in ('verified', 'regressed', 'neutral'));
  end if;
end$$;

create index if not exists idx_tasks_outcome_status
  on public.tasks(outcome_status)
  where outcome_status is not null;
