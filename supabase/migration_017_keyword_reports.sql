-- ============================================================
-- VSI Migration 017 — Per-keyword reports
-- ============================================================
-- Extends the existing reports table to support three new report
-- types scoped to a single tracked keyword:
--   keyword_summary  — one-page exec summary
--   keyword_detailed — full intelligence report
--   keyword_tasks    — execution checklist for writer/dev/SEO
--
-- The existing `weekly` type continues to work unchanged; new types
-- additionally reference the tracked_keyword row they describe.

alter table public.reports
  add column if not exists tracked_keyword_id uuid
  references public.tracked_keywords(id) on delete cascade;

create index if not exists idx_reports_tracked_keyword_id
  on public.reports(tracked_keyword_id);

-- Add a CHECK constraint that documents the allowed types. Use DO block
-- because Postgres lacks `alter constraint if not exists`.
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'reports_type_check'
  ) then
    alter table public.reports
      add constraint reports_type_check
      check (type in ('weekly', 'keyword_summary', 'keyword_detailed', 'keyword_tasks'));
  end if;
end$$;
