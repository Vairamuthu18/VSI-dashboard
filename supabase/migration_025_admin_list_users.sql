-- ============================================================
-- VSI Migration 025 — Admin RPC to list users with their auth email
-- ============================================================
-- The profiles table doesn't store email (canonical copy lives in
-- auth.users). PostgREST can't read auth.users directly, so we expose
-- a SECURITY DEFINER function that joins everything and returns rows
-- only when the caller is a super admin.

create or replace function public.admin_list_users()
returns table (
  id uuid,
  email text,
  full_name text,
  role text,
  agency_id uuid,
  agency_name text,
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
      p.created_at
    from public.profiles p
    left join auth.users u on u.id = p.id
    left join public.agencies a on a.id = p.agency_id
    order by p.created_at desc;
end $$;

grant execute on function public.admin_list_users() to authenticated;
