-- ============================================================
-- VSI Migration 020 — Pilot client cap + product feedback
-- ============================================================

-- ─── Pilot client cap ────────────────────────────────────────
-- Pilots get one client only. Paid agencies are uncapped (null).

alter table public.agencies
  add column if not exists max_clients integer;

-- Default pilots to one client
update public.agencies
   set max_clients = 1
 where is_pilot = true
   and max_clients is null;

-- Enforce server-side regardless of where the insert comes from.
-- A row is rejected when the inserter's agency already has max_clients
-- non-deleted clients.
create or replace function public.enforce_agency_client_cap()
returns trigger language plpgsql as $$
declare
  cap integer;
  current_count integer;
begin
  select max_clients into cap from public.agencies where id = NEW.agency_id;
  if cap is null then
    return NEW;
  end if;
  select count(*) into current_count from public.clients where agency_id = NEW.agency_id;
  if current_count >= cap then
    raise exception 'AGENCY_CLIENT_CAP_REACHED: this agency''s plan allows up to % client%, please contact your account manager to add more.', cap, case when cap = 1 then '' else 's' end
      using errcode = '23514';
  end if;
  return NEW;
end $$;

drop trigger if exists trg_clients_enforce_cap on public.clients;
create trigger trg_clients_enforce_cap
  before insert on public.clients
  for each row execute function public.enforce_agency_client_cap();

-- ─── Product feedback ───────────────────────────────────────
-- A simple per-user, per-agency feedback inbox so pilot testers can
-- send observations, bugs, and ideas right from the app. Super admins
-- see everything; agency users see their own submissions.

create table if not exists public.feedback (
  id            uuid primary key default gen_random_uuid(),
  agency_id     uuid references public.agencies(id) on delete set null,
  user_id       uuid references public.profiles(id) on delete set null,
  category      text not null
                check (category in ('bug', 'idea', 'question', 'praise', 'general')),
  message       text not null,
  page_url      text,
  user_agent    text,
  context_data  jsonb,
  status        text not null default 'new'
                check (status in ('new', 'triaged', 'in_progress', 'done', 'archived')),
  admin_notes   text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists idx_feedback_agency_id  on public.feedback(agency_id);
create index if not exists idx_feedback_user_id    on public.feedback(user_id);
create index if not exists idx_feedback_status     on public.feedback(status);
create index if not exists idx_feedback_created_at on public.feedback(created_at desc);

create or replace function public.set_feedback_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

drop trigger if exists trg_feedback_updated_at on public.feedback;
create trigger trg_feedback_updated_at
  before update on public.feedback
  for each row execute function public.set_feedback_updated_at();

alter table public.feedback enable row level security;

-- Agency members can insert (their own) + read their agency's submissions.
drop policy if exists "feedback_agency_insert" on public.feedback;
create policy "feedback_agency_insert"
  on public.feedback for insert
  to authenticated
  with check (user_id = auth.uid());

drop policy if exists "feedback_agency_read_own" on public.feedback;
create policy "feedback_agency_read_own"
  on public.feedback for select
  to authenticated
  using (
    agency_id = (select agency_id from public.profiles where id = auth.uid())
  );

-- Super admins see and manage everything.
drop policy if exists "feedback_super_admin_all" on public.feedback;
create policy "feedback_super_admin_all"
  on public.feedback for all
  to authenticated
  using (public.is_super_admin())
  with check (public.is_super_admin());

grant all on public.feedback to authenticated;
grant all on public.feedback to service_role;
