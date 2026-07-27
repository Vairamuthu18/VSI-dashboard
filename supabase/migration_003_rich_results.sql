-- ============================================================
-- VSI Migration 003 — Rich result storage
-- Run in Supabase SQL Editor
-- ============================================================

-- Full AIO text (structured blocks)
alter table public.search_results
  add column if not exists aio_full_text text;

-- Full citation list with title, url, sourceName, position, platform
-- [{position, sourceName, title, domain, url, isClient, platform}]
alter table public.search_results
  add column if not exists citations_json jsonb default '[]'::jsonb;

-- Top 10 SERP results
-- [{position, title, url, domain, snippet, isClient, platform}]
alter table public.search_results
  add column if not exists serp_results_json jsonb default '[]'::jsonb;

-- Index for fast retrieval
create index if not exists idx_sr_client_keyword_date
  on public.search_results (client_id, keyword, created_at desc);
