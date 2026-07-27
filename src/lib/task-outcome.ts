import type { SupabaseClient } from "@supabase/supabase-js";
import type { TaskContextSnapshot, TaskOutcome } from "@/lib/tasks";

// Map a gap_label to a coarse "good / bad / neutral" bucket so we can tell
// whether a completed task moved the underlying signals in the right
// direction.
// Truly winning labels are aligned / geo_cited (cited AND named) and the
// SEO-only ranked states. The "no_mention" variants are partial wins, not
// good outcomes — they sit in the neutral bucket so closing a task there
// doesn't get falsely credited as a win.
const GOOD_GAPS = new Set([
  "aligned",
  "geo_cited",
  "geo_mentioned",
  "ai_mentioned",
  "seo_ranked",
  "seo_ranked_no_aio",
]);

const BAD_GAPS = new Set([
  "geo_invisible",
  "search_strong_ai_invisible",
  "seo_not_ranked",
  "weak_double_loss",
]);

function bucket(label: string): "good" | "bad" | "neutral" {
  if (GOOD_GAPS.has(label)) return "good";
  if (BAD_GAPS.has(label)) return "bad";
  return "neutral";
}

interface CurrentForOutcome {
  rank_position: number | null;
  client_cited: boolean | null;
  gap_label: string;
}

interface SupabaseLike {
  // Loose typing because the real SupabaseClient type is generic over the DB schema
  // and isn't easy to import here without coupling.
  from: SupabaseClient["from"];
}

export async function runOutcomeVerification(
  supabase: SupabaseLike,
  trackedKeywordId: string,
): Promise<{ checked: number; updated: number }> {
  // Latest snapshot
  const { data: latest } = await supabase
    .from("search_results")
    .select("rank_position, client_cited, gap_label")
    .eq("tracked_keyword_id", trackedKeywordId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!latest) return { checked: 0, updated: 0 };
  const current = latest as CurrentForOutcome;

  // Find completed tasks for this keyword that don't yet have an outcome.
  const { data: tasks } = await supabase
    .from("tasks")
    .select("id, context_snapshot")
    .eq("tracked_keyword_id", trackedKeywordId)
    .eq("status", "done")
    .is("outcome_status", null);
  if (!tasks || tasks.length === 0) return { checked: 0, updated: 0 };

  const now = new Date().toISOString();
  let updated = 0;

  for (const t of tasks) {
    const snap = (t.context_snapshot as TaskContextSnapshot | null);
    if (!snap) continue; // can't compare without a snapshot
    const beforeBucket = bucket(snap.gapLabel);
    const afterBucket = bucket(current.gap_label);

    // Verified: was bad → became good, OR was not-cited → now cited
    // Regressed: was good → became bad, OR was cited → no longer cited
    let outcome: TaskOutcome | null = null;
    let note: string | null = null;

    if (beforeBucket === "bad" && afterBucket === "good") {
      outcome = "verified";
      note = `Gap moved from "${snap.gapLabel}" → "${current.gap_label}".`;
    } else if (snap.clientCited === false && current.client_cited === true) {
      outcome = "verified";
      note = "Client is now cited in AI Mode.";
    } else if (beforeBucket === "good" && afterBucket === "bad") {
      outcome = "regressed";
      note = `Gap regressed from "${snap.gapLabel}" → "${current.gap_label}".`;
    } else if (snap.clientCited === true && current.client_cited === false) {
      outcome = "regressed";
      note = "Lost AI Mode citation since this task closed.";
    } else if (beforeBucket !== afterBucket || snap.clientCited !== current.client_cited) {
      outcome = "neutral";
      note = "Signals shifted but no clear win/loss attribution.";
    }

    if (!outcome) continue;

    const { error } = await supabase
      .from("tasks")
      .update({ outcome_status: outcome, outcome_checked_at: now, outcome_note: note })
      .eq("id", t.id);
    if (!error) updated++;
  }

  return { checked: tasks.length, updated };
}
