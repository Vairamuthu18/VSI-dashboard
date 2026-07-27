-- ============================================================
-- VSI Migration 024 — Citation Strategy async status
-- ============================================================
-- Citation Strategy was hitting the upstream proxy timeout because
-- the Firecrawl batch + LLM call regularly take 60-90s. We now run
-- it in a background after() callback and let the client poll.

alter table public.search_results
  add column if not exists citation_strategy_status text
  check (citation_strategy_status is null
         or citation_strategy_status in ('pending', 'ready', 'failed'));

alter table public.search_results
  add column if not exists citation_strategy_error text;

create index if not exists idx_sr_citation_status
  on public.search_results(citation_strategy_status)
  where citation_strategy_status is not null;
