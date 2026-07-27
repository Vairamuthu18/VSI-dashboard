-- ============================================================
-- VSI Migration 004 — Fix gap_label classification
-- Run in Supabase SQL Editor
-- ============================================================
--
-- Bug: SEO-only clients with rank_position = null fell through
-- to 'weak_double_loss' instead of 'seo_not_ranked'.
-- Fix: use track_type to disambiguate, and handle null rank for SEO.

alter table public.search_results drop column gap_label;

alter table public.search_results
  add column gap_label text generated always as (
    case
      -- ── SEO-only track (no AIO data, only rank) ──
      when track_type = 'seo' and rank_position is not null and rank_position <= 10 then 'seo_ranked'
      when track_type = 'seo'                                                       then 'seo_not_ranked'

      -- ── GEO-only track (no rank data, only AIO) ──
      when track_type = 'geo' and coalesce(client_cited, false)                     then 'geo_cited'
      when track_type = 'geo' and coalesce(mentioned_in_text, false)                then 'geo_mentioned'
      when track_type = 'geo' and coalesce(aio_present, false)                      then 'geo_invisible'
      when track_type = 'geo'                                                       then 'geo_no_aio'

      -- ── Both tracks (full intelligence) ──
      when rank_position is not null and rank_position <= 10 and coalesce(client_cited, false)      then 'aligned'
      when rank_position is not null and rank_position <= 10 and coalesce(mentioned_in_text, false) then 'ai_mentioned'
      when rank_position is not null and rank_position <= 10 and coalesce(aio_present, false)       then 'search_strong_ai_invisible'
      when rank_position is not null and rank_position <= 10                                        then 'seo_ranked_no_aio'
      when coalesce(aio_present, false)                                                             then 'geo_invisible'
      else 'weak_double_loss'
    end
  ) stored;
