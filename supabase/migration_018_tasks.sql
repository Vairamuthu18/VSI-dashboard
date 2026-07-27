-- ============================================================
-- VSI Migration 018 — Built-in task tracker
-- ============================================================
-- Promotes the LLM-generated task list from "JSON inside a report" to
-- a first-class entity. Tasks can be linked to a tracked keyword
-- (most common) or stand alone at the client level. They carry
-- structured metadata so the UI can group/filter, plus a free-form
-- description and per-criterion checkboxes for acceptance.

create table if not exists public.tasks (
  id                  uuid primary key default gen_random_uuid(),
  agency_id           uuid not null references public.agencies(id) on delete cascade,
  client_id           uuid not null references public.clients(id) on delete cascade,
  tracked_keyword_id  uuid references public.tracked_keywords(id) on delete cascade,
  source_report_id    uuid references public.reports(id) on delete set null,

  group_name          text not null check (group_name in ('Content', 'Technical', 'Off-page')),
  owner               text check (owner in ('Writer', 'Developer', 'SEO', 'Outreach')),
  title               text not null,
  description         text,

  -- acceptance criteria: array of { text: string, done: boolean }
  acceptance          jsonb not null default '[]'::jsonb,

  effort              text check (effort in ('S', 'M', 'L')),
  impact              text check (impact in ('low', 'medium', 'high')),

  status              text not null default 'todo'
                      check (status in ('todo', 'in_progress', 'done', 'skipped')),
  priority            int not null default 0,
  due_date            date,

  notes               text,

  created_by          uuid references public.profiles(id) on delete set null,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  completed_at        timestamptz,
  completed_by        uuid references public.profiles(id) on delete set null
);

create index if not exists idx_tasks_agency_id          on public.tasks(agency_id);
create index if not exists idx_tasks_client_id          on public.tasks(client_id);
create index if not exists idx_tasks_tracked_keyword_id on public.tasks(tracked_keyword_id);
create index if not exists idx_tasks_status             on public.tasks(status);
create index if not exists idx_tasks_due_date           on public.tasks(due_date)
  where due_date is not null;

-- updated_at trigger
create or replace function public.set_tasks_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

drop trigger if exists trg_tasks_updated_at on public.tasks;
create trigger trg_tasks_updated_at
  before update on public.tasks
  for each row execute function public.set_tasks_updated_at();

-- ─── RLS ──────────────────────────────────────────────────────
alter table public.tasks enable row level security;

drop policy if exists "tasks_agency_all" on public.tasks;
create policy "tasks_agency_all"
  on public.tasks for all
  to authenticated
  using (agency_id = (select agency_id from public.profiles where id = auth.uid()))
  with check (agency_id = (select agency_id from public.profiles where id = auth.uid()));

drop policy if exists "tasks_super_admin_all" on public.tasks;
create policy "tasks_super_admin_all"
  on public.tasks for all
  to authenticated
  using (public.is_super_admin())
  with check (public.is_super_admin());

grant all on public.tasks to authenticated;
grant all on public.tasks to service_role;
