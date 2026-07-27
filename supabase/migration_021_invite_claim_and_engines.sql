-- ============================================================
-- VSI Migration 021 — Atomic invite claim + per-client engines
-- ============================================================

-- ─── Security: atomic invite claim ──────────────────────────
-- Previously the register flow read invite.used_by, then onboarding
-- updated it separately. Two users using the same code at the same
-- time could both pass the read check, and the first to finish
-- onboarding would mark it consumed — leaving the second user with
-- an orphan auth account.
--
-- This SECURITY DEFINER function locks the invite row, checks it's
-- unclaimed, and atomically marks it. Returns the role/max_keywords
-- when successful; returns null otherwise.

create or replace function public.claim_invite(
  p_code text,
  p_user uuid
) returns table (
  invite_id      uuid,
  role           text,
  max_keywords   integer
) language plpgsql security definer set search_path = public as $$
declare
  v_row public.invites%rowtype;
begin
  -- Take a row-level lock so concurrent claims serialise.
  select * into v_row
  from public.invites
  where code = upper(p_code)
  for update;

  if not found then
    return;
  end if;

  if v_row.is_active is false or v_row.used_by is not null then
    return;
  end if;

  update public.invites
     set used_by = p_user,
         used_at = now(),
         is_active = false
   where id = v_row.id;

  return query select v_row.id, v_row.role, v_row.max_keywords;
end $$;

grant execute on function public.claim_invite(text, uuid) to authenticated;

-- ─── Per-client engines: add AI Overview ────────────────────
-- Migration 011 added ai_mode_enabled, rank_tracking_enabled,
-- chatgpt_enabled. Re-add the original AI Overview engine now that
-- SerpAPI's google_ai_overview is producing data again.

alter table public.clients
  add column if not exists ai_overview_enabled boolean,
  add column if not exists llm_mentions_enabled boolean;

comment on column public.clients.ai_mode_enabled       is 'Track Google AI Mode (SerpAPI engine=google_ai_mode)';
comment on column public.clients.ai_overview_enabled   is 'Track Google AI Overview (SerpAPI engine=google_ai_overview). Null = off by default for new pilots.';
comment on column public.clients.rank_tracking_enabled is 'Track organic Google rank via Serper.';
comment on column public.clients.chatgpt_enabled       is 'Run ChatGPT brand-mention check on each pipeline run.';
comment on column public.clients.llm_mentions_enabled  is 'Track LLM Mentions across multiple LLMs (DataForSEO). Null = off until provider is wired.';
