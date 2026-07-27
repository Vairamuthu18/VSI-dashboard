-- ============================================================
-- VSI Migration 026 — Disable / delete users + agencies
-- ============================================================
-- Super admin needs to suspend access for a misbehaving pilot or
-- offboard an agency entirely. Soft-disable is the safe primary
-- action; hard delete is available via the same endpoints for
-- cleanup (cascade is already defined on the existing FKs).

alter table public.profiles
  add column if not exists is_disabled boolean not null default false,
  add column if not exists disabled_at timestamptz,
  add column if not exists disabled_reason text;

alter table public.agencies
  add column if not exists is_disabled boolean not null default false,
  add column if not exists disabled_at timestamptz,
  add column if not exists disabled_reason text;

create index if not exists idx_profiles_is_disabled on public.profiles(is_disabled) where is_disabled = true;
create index if not exists idx_agencies_is_disabled on public.agencies(is_disabled) where is_disabled = true;

-- Update the admin_list_users RPC (from migration 025) to surface the
-- disable flag so the UI can render the right button state.
create or replace function public.admin_list_users()
returns table (
  id uuid,
  email text,
  full_name text,
  role text,
  agency_id uuid,
  agency_name text,
  is_disabled boolean,
  agency_is_disabled boolean,
  created_at timestamptz
) language plpgsql security definer set search_path = public, auth as $$
begin
  if not public.is_super_admin() then
    raise exception 'Not authorised';
  end if;
  return query
    select
      p.id,
      u.email::text,
      p.full_name,
      p.role,
      p.agency_id,
      a.name as agency_name,
      coalesce(p.is_disabled, false) as is_disabled,
      coalesce(a.is_disabled, false) as agency_is_disabled,
      p.created_at
    from public.profiles p
    left join auth.users u on u.id = p.id
    left join public.agencies a on a.id = p.agency_id
    order by p.created_at desc;
end $$;

grant execute on function public.admin_list_users() to authenticated;
