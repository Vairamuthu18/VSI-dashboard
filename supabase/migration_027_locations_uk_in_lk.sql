-- Widen the location check constraints to match the app-side LOCATIONS map
-- (ae, us, uk, in, lk). The product UI lets pilots pick any of these but
-- the database was still pinned to ('ae','us'), so any client/keyword/run
-- using UK/India/Sri Lanka was rejected by Postgres with
-- "violates check constraint clients_default_location_check" (and the
-- equivalent on tracked_keywords + search_results).

alter table public.clients
  drop constraint if exists clients_default_location_check;
alter table public.clients
  add  constraint clients_default_location_check
  check (default_location in ('ae', 'us', 'uk', 'in', 'lk'));

alter table public.tracked_keywords
  drop constraint if exists tracked_keywords_location_check;
alter table public.tracked_keywords
  add  constraint tracked_keywords_location_check
  check (location in ('ae', 'us', 'uk', 'in', 'lk'));

alter table public.search_results
  drop constraint if exists search_results_location_check;
alter table public.search_results
  add  constraint search_results_location_check
  check (location in ('ae', 'us', 'uk', 'in', 'lk'));
