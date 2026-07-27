-- ============================================================
-- VSI Migration 011 — Per-client pipeline settings
-- ============================================================
-- Each agency admin can override which checks run for each client.
-- All columns default to NULL meaning "inherit from system_settings /
-- system default". Explicit true/false overrides the inheritance.

alter table public.clients
  add column if not exists ai_mode_enabled          boolean,
  add column if not exists rank_tracking_enabled    boolean,
  add column if not exists chatgpt_enabled          boolean,
  add column if not exists brief_model_override     text,
  add column if not exists location_override        text;

-- NB: check_frequency already exists from migration 002. Change the
-- default for newly-created clients to 'weekly' so cron has a sensible
-- starting point. Existing rows are untouched.
alter table public.clients
  alter column check_frequency set default 'weekly';

-- System-wide default frequency, settable by super admin. New clients
-- created through the UI will use this value.
insert into public.system_settings (key, value)
values ('default_check_frequency', '"weekly"'::jsonb)
on conflict (key) do nothing;
