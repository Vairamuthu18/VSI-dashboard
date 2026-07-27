-- ============================================================
-- VSI Migration 016 — Editable LLM prompts
-- ============================================================
-- Optional super-admin override layer. Hardcoded defaults live in
-- src/lib/prompts.ts and always work even if this table is empty or
-- contains a malformed row.

create table if not exists public.prompts (
  key             text primary key,
  template        text not null,
  description     text,
  template_vars   text[] not null default '{}',
  updated_by      uuid references public.profiles(id) on delete set null,
  updated_at      timestamptz not null default now()
);

alter table public.prompts enable row level security;

drop policy if exists "prompts_super_admin_write" on public.prompts;
create policy "prompts_super_admin_write"
  on public.prompts for all
  to authenticated
  using (public.is_super_admin())
  with check (public.is_super_admin());

drop policy if exists "prompts_read_authenticated" on public.prompts;
create policy "prompts_read_authenticated"
  on public.prompts for select
  to authenticated
  using (true);

grant select on public.prompts to authenticated;
grant all on public.prompts to service_role;
