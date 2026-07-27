-- ============================================================
-- VSI Migration 023 — QA testers + per-tester checklist saves
-- ============================================================
-- The /qa page is a shared checklist used by the pilot test team.
-- Each tester signs in with a short hardcoded code; their changes
-- attribute to them. No agency auth — these are standalone identities.

create table if not exists public.qa_testers (
  id          uuid primary key default gen_random_uuid(),
  code        text unique not null,
  name        text not null,
  created_at  timestamptz not null default now()
);

insert into public.qa_testers (code, name) values
  ('1122', 'Atheefa'),
  ('1133', 'Dhashi')
on conflict (code) do nothing;

create table if not exists public.qa_checks (
  id          uuid primary key default gen_random_uuid(),
  tester_id   uuid not null references public.qa_testers(id) on delete cascade,
  item_key    text not null,
  status      text not null default 'todo'
              check (status in ('todo', 'pass', 'fail', 'skipped')),
  notes       text,
  updated_at  timestamptz not null default now(),
  unique (tester_id, item_key)
);

create index if not exists idx_qa_checks_tester_id on public.qa_checks(tester_id);
create index if not exists idx_qa_checks_status    on public.qa_checks(status);

create or replace function public.set_qa_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

drop trigger if exists trg_qa_checks_updated_at on public.qa_checks;
create trigger trg_qa_checks_updated_at
  before update on public.qa_checks
  for each row execute function public.set_qa_updated_at();

-- RLS: testers themselves don't authenticate against Supabase, so the
-- server side uses the service role. Anon clients shouldn't read or
-- write directly — block them.
alter table public.qa_testers enable row level security;
alter table public.qa_checks  enable row level security;

-- Super admins can manage everything; everyone else is denied by default
-- (no policies = no access).
drop policy if exists "qa_testers_super_admin_all" on public.qa_testers;
create policy "qa_testers_super_admin_all"
  on public.qa_testers for all
  to authenticated
  using (public.is_super_admin())
  with check (public.is_super_admin());

drop policy if exists "qa_checks_super_admin_all" on public.qa_checks;
create policy "qa_checks_super_admin_all"
  on public.qa_checks for all
  to authenticated
  using (public.is_super_admin())
  with check (public.is_super_admin());

grant select, insert, update, delete on public.qa_testers to service_role;
grant select, insert, update, delete on public.qa_checks  to service_role;

-- ─── RPC entry points used by /api/qa/* ──────────────────────
-- Anon clients call these instead of writing tables directly. The
-- functions enforce their own validation (code exists / tester exists)
-- and bypass RLS via SECURITY DEFINER.

create or replace function public.qa_login(p_code text)
returns table (id uuid, name text)
language plpgsql security definer set search_path = public as $$
begin
  return query
    select t.id, t.name
      from public.qa_testers t
     where t.code = p_code;
end $$;

create or replace function public.qa_get_session(p_tester_id uuid)
returns table (id uuid, name text)
language plpgsql security definer set search_path = public as $$
begin
  return query
    select t.id, t.name
      from public.qa_testers t
     where t.id = p_tester_id;
end $$;

create or replace function public.qa_save_check(
  p_tester_id uuid,
  p_item_key  text,
  p_status    text,
  p_notes     text
) returns void
language plpgsql security definer set search_path = public as $$
begin
  -- Validate tester exists
  if not exists (select 1 from public.qa_testers where id = p_tester_id) then
    raise exception 'Invalid tester';
  end if;
  -- Validate status enum
  if p_status not in ('todo', 'pass', 'fail', 'skipped') then
    raise exception 'Invalid status %', p_status;
  end if;

  insert into public.qa_checks (tester_id, item_key, status, notes)
    values (p_tester_id, p_item_key, p_status, p_notes)
  on conflict (tester_id, item_key)
    do update set status = excluded.status,
                  notes  = excluded.notes;
end $$;

create or replace function public.qa_list_checks(p_tester_id uuid)
returns table (item_key text, status text, notes text, updated_at timestamptz)
language plpgsql security definer set search_path = public as $$
begin
  return query
    select c.item_key, c.status, c.notes, c.updated_at
      from public.qa_checks c
     where c.tester_id = p_tester_id;
end $$;

create or replace function public.qa_all_checks_admin()
returns table (
  tester_id uuid,
  tester_name text,
  item_key text,
  status text,
  notes text,
  updated_at timestamptz
) language plpgsql security definer set search_path = public as $$
begin
  if not public.is_super_admin() then
    raise exception 'Not authorised';
  end if;
  return query
    select t.id, t.name, c.item_key, c.status, c.notes, c.updated_at
      from public.qa_checks c
      join public.qa_testers t on t.id = c.tester_id
     order by c.updated_at desc;
end $$;

grant execute on function public.qa_login(text)                          to anon, authenticated;
grant execute on function public.qa_get_session(uuid)                    to anon, authenticated;
grant execute on function public.qa_save_check(uuid, text, text, text)   to anon, authenticated;
grant execute on function public.qa_list_checks(uuid)                    to anon, authenticated;
grant execute on function public.qa_all_checks_admin()                   to authenticated;
