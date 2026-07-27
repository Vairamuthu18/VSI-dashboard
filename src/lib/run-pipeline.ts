import { createClient } from "@/lib/supabase/server";
import { fetchRank } from "@/lib/serper";
import { fetchAIO, fetchAIOverview } from "@/lib/serpapi";
import { runChatGPTCheck } from "@/lib/chatgpt-check";
import { getSetting } from "@/lib/settings";
import { track } from "@/lib/track";
import type { Location, TrackType } from "@/types/search";

export interface RunResult {
  total: number;
  completed: number;
  failed: number;
  skipped: number;
  results: Array<{
    keyword: string;
    track_type: TrackType;
    status: "ok" | "error";
    error?: string;
  }>;
}

export interface TrackedKeyword {
  id: string;
  keyword: string;
  domain: string;
  brand: string | null;
  location: Location;
  track_type: TrackType;
  client_id: string;
}

interface ClientToggles {
  ai_mode_enabled: boolean | null;
  ai_overview_enabled: boolean | null;
  rank_tracking_enabled: boolean | null;
  chatgpt_enabled: boolean | null;
}

async function runKeyword(
  kw: TrackedKeyword,
  agencyId: string,
  clientId: string,
  chatgptApiEnabled: boolean,
  aiModeEnabled: boolean,
  rankTrackingEnabled: boolean,
  aiOverviewEnabled: boolean,
): Promise<{ status: "ok" | "error"; error?: string }> {
  try {
    const runAIO = aiModeEnabled && (kw.track_type === "geo" || kw.track_type === "both");
    const runAIOverview = aiOverviewEnabled && (kw.track_type === "geo" || kw.track_type === "both");
    const runRank = rankTrackingEnabled;

    const [serpSettled, aioSettled, gptSettled, aioOverviewSettled] = await Promise.allSettled([
      runRank
        ? fetchRank(kw.keyword, kw.domain, kw.location, kw.brand ?? "")
        : Promise.resolve(null),
      runAIO ? fetchAIO(kw.keyword, kw.domain, kw.brand ?? "", kw.location) : Promise.resolve(null),
      chatgptApiEnabled
        ? runChatGPTCheck({
            keyword: kw.keyword,
            clientBrand: kw.brand ?? "",
            clientDomain: kw.domain,
          })
        : Promise.resolve(null),
      runAIOverview
        ? fetchAIOverview(kw.keyword, kw.domain, kw.brand ?? "", kw.location)
        : Promise.resolve(null),
    ]);

    const serpResult = serpSettled.status === "fulfilled" ? serpSettled.value : null;
    const aioResult  = aioSettled.status === "fulfilled"  ? aioSettled.value  : null;
    const gptResult  = gptSettled.status === "fulfilled"  ? gptSettled.value  : null;
    const aioOverviewResult = aioOverviewSettled.status === "fulfilled" ? aioOverviewSettled.value : null;

    const errors: string[] = [];
    if (serpSettled.status === "rejected") {
      errors.push(`SERP: ${serpSettled.reason instanceof Error ? serpSettled.reason.message : String(serpSettled.reason)}`);
    }
    if (aioSettled.status === "rejected") {
      errors.push(`AIO: ${aioSettled.reason instanceof Error ? aioSettled.reason.message : String(aioSettled.reason)}`);
    }
    if (errors.length === 2) {
      return { status: "error", error: errors.join("; ") };
    }

    const supabase = await createClient();
    // Insert the snapshot. The chatgpt_entity_match / chatgpt_actual_entity
    // columns ship in migration 029 — if production hasn't run that yet,
    // the insert will fail. We retry once without those fields so the
    // pipeline never blocks on a pending migration.
    const baseRow: Record<string, unknown> = {
      agency_id:          agencyId,
      client_id:          clientId,
      tracked_keyword_id: kw.id,
      keyword:            kw.keyword,
      domain:             kw.domain,
      brand:              kw.brand,
      location:           kw.location,
      track_type:         kw.track_type,
      rank_position:      serpResult?.position ?? null,
      rank_url:           serpResult?.rankingUrl ?? null,
      rank_title:         serpResult?.rankingTitle ?? null,
      serp_features:      serpResult?.serpFeatures ?? [],
      aio_present:        aioResult?.aioPresent ?? null,
      aio_snippet:        aioResult?.aioSnippet ?? null,
      aio_full_text:      aioResult?.aioFullText ?? null,
      cited_domains:      aioResult?.citedDomains ?? [],
      client_cited:       aioResult?.clientCited ?? null,
      mentioned_in_text:  aioResult?.mentionedInText ?? null,
      chatgpt_checked:          gptResult?.checked ?? false,
      chatgpt_response:         gptResult?.response ?? null,
      chatgpt_brand_cited:      gptResult?.brand_cited ?? null,
      chatgpt_brand_mentioned:  gptResult?.brand_mentioned ?? null,
      chatgpt_mention_count:    gptResult?.mention_count ?? null,
      chatgpt_competitors:      gptResult?.competitors ?? [],
      chatgpt_cited_urls:       gptResult?.cited_urls ?? [],
      citations_json:    aioResult?.citations    ?? [],
      serp_results_json: serpResult?.organicResults ?? [],
      // AI Overview (engine=google_ai_overview) — populated only when
      // ai_overview_enabled is true for the client.
      ai_overview_present:        aioOverviewResult?.aioPresent ?? null,
      ai_overview_full_text:      aioOverviewResult?.aioFullText ?? null,
      ai_overview_snippet:        aioOverviewResult?.aioSnippet ?? null,
      ai_overview_citations_json: aioOverviewResult?.citations ?? null,
      ai_overview_client_cited:   aioOverviewResult?.clientCited ?? null,
      ai_overview_cited_domains:  aioOverviewResult?.citedDomains ?? null,
    };
    const fullRow = {
      ...baseRow,
      chatgpt_entity_match:  gptResult?.entity_match ?? null,
      chatgpt_actual_entity: gptResult?.entity_actual ?? null,
    };
    const insertFull = await supabase.from("search_results").insert(fullRow);
    if (insertFull.error) {
      // Most likely migration 029 isn't applied yet — retry without the
      // entity columns. Any other error will surface on the fallback too.
      await supabase.from("search_results").insert(baseRow);
    }

    // After a successful run, check whether any completed tasks for this
    // keyword can be marked as outcome-verified or regressed. Best-effort:
    // we don't want a task-update failure to take down the pipeline.
    try {
      const { runOutcomeVerification } = await import("@/lib/task-outcome");
      await runOutcomeVerification(supabase, kw.id);
    } catch (e) {
      console.error("[pipeline] outcome verification failed", e);
    }

    // Anonymous outcome telemetry for usage patterns + training data.
    track({
      agencyId,
      type: "keyword_run_outcome",
      payload: {
        track_type: kw.track_type,
        rank_position: serpResult?.position ?? null,
        aio_present: aioResult?.aioPresent ?? null,
        aio_overview_present: aioOverviewResult?.aioPresent ?? null,
        client_cited: aioResult?.clientCited ?? null,
        ai_overview_client_cited: aioOverviewResult?.clientCited ?? null,
        cited_domain_count: aioResult?.citedDomains?.length ?? 0,
      },
    });

    return { status: "ok" };
  } catch (err) {
    return { status: "error", error: err instanceof Error ? err.message : "Unknown error" };
  }
}

/**
 * Run a batch of keywords for a single client. Used by /api/run-client (manual
 * UI trigger) and by /api/cron/run-due-clients (scheduled auto-runs).
 *
 * The caller is responsible for verifying the agency owns the client (or for
 * being the cron job itself, which is authorised by CRON_SECRET).
 */
export async function runKeywordsForClient(opts: {
  agencyId: string;
  clientId: string;
  client: ClientToggles;
  keywords: TrackedKeyword[];
  batchSize?: number;
}): Promise<RunResult> {
  if (opts.keywords.length === 0) {
    return { total: 0, completed: 0, failed: 0, skipped: 0, results: [] };
  }

  const systemChatgptEnabled = await getSetting<boolean>("chatgpt_api_enabled");
  const chatgptApiEnabled    = opts.client.chatgpt_enabled ?? systemChatgptEnabled;
  // Platform defaults: AI Mode is the primary AI surface (SerpAPI's reliable
  // production signal). AI Overview is opt-in — clients who really want it
  // pair this toggle with the browser-extension capture path (additional
  // charges apply).
  const aiModeEnabled        = opts.client.ai_mode_enabled ?? true;
  const aiOverviewEnabled    = opts.client.ai_overview_enabled ?? false;
  const rankTrackingEnabled  = opts.client.rank_tracking_enabled ?? true;

  const batchSize = opts.batchSize ?? 3;
  const results: RunResult["results"] = [];

  for (let i = 0; i < opts.keywords.length; i += batchSize) {
    const batch = opts.keywords.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map(async (kw) => {
        const res = await runKeyword(kw, opts.agencyId, opts.clientId, chatgptApiEnabled, aiModeEnabled, rankTrackingEnabled, aiOverviewEnabled);
        return { keyword: kw.keyword, track_type: kw.track_type, ...res };
      })
    );
    results.push(...batchResults);
  }

  const completed = results.filter((r) => r.status === "ok").length;
  const failed    = results.filter((r) => r.status === "error").length;
  return { total: opts.keywords.length, completed, failed, skipped: 0, results };
}
