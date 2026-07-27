import { createClient } from "@/lib/supabase/server";
import crypto from "crypto";

// Anonymous analytics event capture. Use this anywhere you'd want to
// understand how the platform is being used or to build a training
// corpus later. Never blocks the caller — failures are swallowed and
// logged.

export type EventType =
  | "chat_query"
  | "chat_thumbs"           // payload: { vote: "up" | "down", message_index, scope_kind }
  | "brief_generated"
  | "brief_regenerated"
  | "report_generated"
  | "report_completed"
  | "task_imported"
  | "task_status_change"    // payload: { from, to }
  | "task_outcome"          // payload: { status: verified | regressed | neutral }
  | "feedback_submitted"
  | "keyword_run_outcome"   // payload: { gap_label, rank_delta, citation_delta }
  | "engine_used";          // payload: { engine, latency_ms, ok }

interface TrackOpts {
  agencyId?: string | null;
  userId?: string | null;
  type: EventType;
  payload?: Record<string, unknown>;
  pagePath?: string | null;
  sessionId?: string | null;
}

// Per-process salt — combined with agency_id so a user_id can't be
// reverse-engineered to a row even if the salt leaks (without the
// matching agency_id). Set ANALYTICS_SALT in env for stable hashing
// across restarts; otherwise we fall back to a process-local UUID.
const SALT = process.env.ANALYTICS_SALT || crypto.randomUUID();

function hashUser(userId: string | null | undefined, agencyId: string | null | undefined): string | null {
  if (!userId) return null;
  return crypto
    .createHash("sha256")
    .update(`${SALT}::${agencyId ?? ""}::${userId}`)
    .digest("hex")
    .slice(0, 32);
}

export async function track(opts: TrackOpts): Promise<void> {
  try {
    const supabase = await createClient();
    await supabase.from("analytics_events").insert({
      agency_id: opts.agencyId ?? null,
      user_hash: hashUser(opts.userId, opts.agencyId),
      event_type: opts.type,
      payload: opts.payload ?? {},
      page_path: opts.pagePath ?? null,
      session_id: opts.sessionId ?? null,
    });
  } catch (e) {
    // Analytics failures must never break user-facing flows.
    console.warn("[track] failed to record event:", opts.type, e);
  }
}
