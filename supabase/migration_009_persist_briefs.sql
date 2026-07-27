-- ============================================================
-- VSI Migration 009 — Persist AI Opportunity Briefs
-- ============================================================
-- Previously briefs were generated on-demand and held in React state,
-- so they vanished when the user navigated away. Persist them on the
-- tracked_keywords row so the same brief surfaces wherever the keyword
-- appears (overview, keyword detail, results table).

alter table public.tracked_keywords
  add column if not exists ai_brief        jsonb,
  add column if not exists ai_brief_at     timestamptz,
  add column if not exists ai_brief_gap    text;   -- gap_label the brief was generated against

create index if not exists idx_tracked_keywords_brief_at
  on public.tracked_keywords (ai_brief_at desc nulls last);
