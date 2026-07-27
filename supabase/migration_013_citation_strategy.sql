-- ============================================================
-- VSI Migration 013 — Citation Strategy (Firecrawl + LLM analysis)
-- ============================================================
-- For each search_results snapshot, store a strategy analysis derived
-- from scraping the top AI Mode citations and asking an LLM what
-- content patterns earn citations for this query.

alter table public.search_results
  add column if not exists citation_strategy     jsonb,
  add column if not exists citation_strategy_at  timestamptz;
