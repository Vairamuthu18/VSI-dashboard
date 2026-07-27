-- Tighten the "winning" gap labels: a citation alone (link in the AIO source
-- panel) is not enough — the brand must also be NAMED in the AI answer text.
-- Otherwise we were calling things "Winning" when Google linked to the page
-- without ever saying the brand out loud, which over-credits visibility.
--
-- New / changed labels:
--   aligned                  ranked top-10 AND cited AND named in AIO text   (was: ranked + cited)
--   aligned_no_mention       ranked top-10 AND cited but NOT named in text   (NEW)
--   geo_cited                cited AND named in AIO text                     (was: cited only)
--   geo_cited_no_mention     cited but NOT named in text                     (NEW)
--
-- All other branches stay the same. Generated columns can't be altered in
-- place, so the column is dropped + recreated. The index on gap_label is
-- recreated after.

drop index if exists idx_sr_gap;

alter table public.search_results drop column if exists gap_label;

alter table public.search_results
  add column gap_label text generated always as (
    case
      -- SEO + GEO: full winning state (ranked, cited as source, named in text)
      when rank_position is not null and rank_position <= 10
           and coalesce(client_cited, false)
           and coalesce(mentioned_in_text, false)                                then 'aligned'
      -- SEO + GEO: ranked + cited as source, but brand not named in the AIO text
      when rank_position is not null and rank_position <= 10
           and coalesce(client_cited, false)                                    then 'aligned_no_mention'
      -- SEO + GEO: ranked + brand named, no source citation
      when rank_position is not null and rank_position <= 10
           and coalesce(mentioned_in_text, false)                               then 'ai_mentioned'
      when rank_position is not null and rank_position <= 10
           and aio_present = true                                               then 'search_strong_ai_invisible'

      -- GEO-only: full winning (cited as source AND named in AIO text)
      when rank_position is null
           and coalesce(client_cited, false)
           and coalesce(mentioned_in_text, false)                               then 'geo_cited'
      -- GEO-only: cited as source but brand not named in answer text
      when rank_position is null
           and coalesce(client_cited, false)                                    then 'geo_cited_no_mention'
      -- GEO-only: brand named but not a source link
      when rank_position is null
           and coalesce(mentioned_in_text, false)                               then 'geo_mentioned'
      when rank_position is null
           and coalesce(aio_present, false)                                     then 'geo_invisible'

      -- SEO-only snapshots
      when rank_position is not null and rank_position <= 10 and aio_present is null then 'seo_ranked'
      when rank_position is not null and rank_position >  10 and aio_present is null then 'seo_not_ranked'

      else 'weak_double_loss'
    end
  ) stored;

create index idx_sr_gap on public.search_results (gap_label, created_at desc);
