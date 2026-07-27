-- ============================================================
-- VSI Migration 008 — ChatGPT visibility tracking
-- ============================================================
-- Adds a third visibility dimension alongside SERP rank + Google AIO:
-- track whether ChatGPT mentions or cites the client when asked the
-- same keyword query. Uses OpenAI Responses API (gpt-4o-mini + web
-- search) and runs in parallel with the existing pipeline.

alter table public.search_results
  add column if not exists chatgpt_checked       boolean not null default false,
  add column if not exists chatgpt_response      text,
  add column if not exists chatgpt_brand_cited   boolean,
  add column if not exists chatgpt_brand_mentioned boolean,
  add column if not exists chatgpt_mention_count int,
  add column if not exists chatgpt_competitors   text[],
  add column if not exists chatgpt_cited_urls    text[];

-- Extend the gap_label expression so ChatGPT signals can influence the
-- summary label. We use a *separate* set of labels because ChatGPT
-- visibility is independent of SEO rank and AIO citation status.
-- (For now we keep gap_label driven by SEO+AIO only and surface the
-- ChatGPT signal via its own UI column. A future migration can fold
-- them together once the team has lived with the data for a while.)
