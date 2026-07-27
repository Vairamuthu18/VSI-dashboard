-- ChatGPT entity disambiguation columns.
--
-- The brand-token detector says "the literal brand name appears in this
-- ChatGPT response" — but plenty of brand names collide. Asking about
-- "Valgrow Labs" can return an answer about a biotech startup in San
-- Diego, not the digital agency in Dubai we're tracking. We now run a
-- cheap LLM disambiguation call when the brand is mentioned but the
-- domain isn't cited, and store the verdict so the UI can flag the
-- snapshot as "ChatGPT answered about a different entity".
--
-- chatgpt_entity_match:
--   true   → response is about the tracked brand (or the domain was
--            cited, which is definitive)
--   false  → response is about a different organisation with the same name
--   null   → not applicable / check skipped (brand not mentioned, no LLM
--            key configured, or the LLM call failed)
--
-- chatgpt_actual_entity:
--   Short noun phrase describing what entity the response was actually
--   about, populated only when chatgpt_entity_match is false.

alter table public.search_results
  add column if not exists chatgpt_entity_match  boolean,
  add column if not exists chatgpt_actual_entity text;
