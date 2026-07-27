-- ============================================================
-- VSI Migration 022 — Anonymous analytics + AI Overview columns
-- ============================================================

-- ─── Analytics event stream ─────────────────────────────────
-- Captures every meaningful interaction (chat queries, brief
-- regenerations, task lifecycle, keyword run outcomes, etc.) so we
-- can analyse usage patterns and build a private training corpus
-- without touching personally-identifiable data.

create table if not exists public.analytics_events (
  id            uuid primary key default gen_random_uuid(),
  agency_id     uuid references public.agencies(id) on delete set null,
  user_hash     text,                -- sha256(user_id || agency_salt) — never the raw uuid
  event_type    text not null,
  payload       jsonb not null default '{}'::jsonb,
  page_path     text,
  session_id    text,                -- client-generated session token (opaque)
  created_at    timestamptz not null default now()
);

create index if not exists idx_ae_event_type   on public.analytics_events(event_type);
create index if not exists idx_ae_agency_id    on public.analytics_events(agency_id);
create index if not exists idx_ae_created_at   on public.analytics_events(created_at desc);

-- 13-month retention helper. Run via a cron once in a while.
create or replace function public.prune_old_analytics()
returns void language plpgsql as $$
begin
  delete from public.analytics_events
   where created_at < now() - interval '13 months';
end $$;

alter table public.analytics_events enable row level security;

-- Authenticated agency users can write events for themselves; nobody but
-- super admin can read.
drop policy if exists "analytics_insert_any_auth" on public.analytics_events;
create policy "analytics_insert_any_auth"
  on public.analytics_events for insert
  to authenticated
  with check (
    agency_id is null
    or agency_id = (select agency_id from public.profiles where id = auth.uid())
  );

drop policy if exists "analytics_super_admin_all" on public.analytics_events;
create policy "analytics_super_admin_all"
  on public.analytics_events for all
  to authenticated
  using (public.is_super_admin())
  with check (public.is_super_admin());

grant insert, select on public.analytics_events to authenticated;
grant all on public.analytics_events to service_role;

-- ─── AI Overview tracking columns ───────────────────────────
-- AI Overview is back from SerpAPI (engine=google_ai_overview). When a
-- client has ai_overview_enabled=true, the pipeline stores its data
-- here alongside the existing AI Mode columns. Two surfaces side by side.

alter table public.search_results
  add column if not exists ai_overview_present     boolean,
  add column if not exists ai_overview_full_text   text,
  add column if not exists ai_overview_snippet     text,
  add column if not exists ai_overview_citations_json jsonb,
  add column if not exists ai_overview_client_cited  boolean,
  add column if not exists ai_overview_cited_domains text[];
