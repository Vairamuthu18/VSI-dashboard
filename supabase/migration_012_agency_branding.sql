-- ============================================================
-- VSI Migration 012 — Agency white-label branding
-- ============================================================
-- Each agency can supply their own logo, brand color, display name,
-- support email, and report footer text. Used in client-facing reports
-- (Phase 2D) and the dashboard sidebar.

alter table public.agencies
  add column if not exists logo_url       text,
  add column if not exists primary_color  text default '#F59E0B',  -- amber-500
  add column if not exists display_name   text,
  add column if not exists support_email  text,
  add column if not exists report_footer  text;

-- ────────────────────────────────────────────────────────────
-- Supabase Storage bucket for agency logos
-- ────────────────────────────────────────────────────────────
-- Public-readable so logos can render in shared reports without auth.
insert into storage.buckets (id, name, public)
values ('agency-logos', 'agency-logos', true)
on conflict (id) do update set public = excluded.public;

-- Authenticated users can upload to a folder named after their own
-- agency_id. The folder is the first path segment of the object name.
drop policy if exists "agency_logo_upload" on storage.objects;
create policy "agency_logo_upload"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'agency-logos'
    and (storage.foldername(name))[1] = (
      select agency_id::text from public.profiles where id = auth.uid()
    )
  );

drop policy if exists "agency_logo_update" on storage.objects;
create policy "agency_logo_update"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'agency-logos'
    and (storage.foldername(name))[1] = (
      select agency_id::text from public.profiles where id = auth.uid()
    )
  );

drop policy if exists "agency_logo_delete" on storage.objects;
create policy "agency_logo_delete"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'agency-logos'
    and (storage.foldername(name))[1] = (
      select agency_id::text from public.profiles where id = auth.uid()
    )
  );

drop policy if exists "agency_logo_public_read" on storage.objects;
create policy "agency_logo_public_read"
  on storage.objects for select
  to public
  using (bucket_id = 'agency-logos');
