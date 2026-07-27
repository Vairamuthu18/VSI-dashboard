-- ============================================================
-- VSI Migration 014 — Branded client reports
-- ============================================================
-- Snapshots of client visibility data, packaged as branded HTML
-- reports shareable via signed token URL. The `content` jsonb stores
-- everything needed to render the report so the underlying data can
-- change later without affecting historical reports.

create table if not exists public.reports (
  id              uuid primary key default gen_random_uuid(),
  agency_id       uuid not null references public.agencies(id) on delete cascade,
  client_id       uuid not null references public.clients(id) on delete cascade,
  type            text not null default 'weekly',
  share_token     text not null unique,
  generated_at    timestamptz not null default now(),
  expires_at      timestamptz,
  content         jsonb not null,
  created_by      uuid references public.profiles(id) on delete set null
);

create index if not exists idx_reports_agency_id on public.reports(agency_id);
create index if not exists idx_reports_client_id on public.reports(client_id);
create index if not exists idx_reports_share_token on public.reports(share_token);
create index if not exists idx_reports_generated_at on public.reports(generated_at desc);

alter table public.reports enable row level security;

-- Agency members read/write their own reports
drop policy if exists "reports_agency_all" on public.reports;
create policy "reports_agency_all"
  on public.reports for all
  to authenticated
  using (agency_id = (select agency_id from public.profiles where id = auth.uid()))
  with check (agency_id = (select agency_id from public.profiles where id = auth.uid()));

-- Public can read a single report by share_token (the route validates the token)
drop policy if exists "reports_public_read_by_token" on public.reports;
create policy "reports_public_read_by_token"
  on public.reports for select
  to anon
  using (share_token is not null and (expires_at is null or expires_at > now()));

-- Super admin can see everything (existing helper)
drop policy if exists "reports_super_admin_all" on public.reports;
create policy "reports_super_admin_all"
  on public.reports for all
  to authenticated
  using (public.is_super_admin())
  with check (public.is_super_admin());

grant select on public.reports to anon;
grant all on public.reports to authenticated;
grant all on public.reports to service_role;
