import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireSuperAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// Export every analytics event as JSONL (one JSON object per line), suitable
// for jq / pandas / fine-tuning corpora. CSV variant available with ?format=csv.

export async function GET(req: NextRequest) {
 await requireSuperAdmin();
 const url = new URL(req.url);
 const format = url.searchParams.get("format") ?? "jsonl";
 const sinceDays = Math.max(1, Math.min(395, Number(url.searchParams.get("since_days") ?? 30)));
 const type = url.searchParams.get("type"); // optional filter

 const supabase = await createClient();
 const sinceISO = new Date(Date.now() - sinceDays * 86400 * 1000).toISOString();

 // Pull in chunks to avoid one giant query
 const PAGE = 1000;
 let cursor = 0;
 const all: Array<Record<string, unknown>> = [];
 for (;;) {
 let q = supabase
 .from("analytics_events")
 .select("id, agency_id, user_hash, event_type, payload, page_path, session_id, created_at")
 .gte("created_at", sinceISO)
 .order("created_at", { ascending: true })
 .range(cursor, cursor + PAGE - 1);
 if (type) q = q.eq("event_type", type);
 const { data, error } = await q;
 if (error) return NextResponse.json({ error: error.message }, { status: 500 });
 const rows = data ?? [];
 all.push(...(rows as Record<string, unknown>[]));
 if (rows.length < PAGE) break;
 cursor += PAGE;
 if (all.length >= 200_000) break; // safety cap
 }

 if (format === "csv") {
 const cols = ["id", "agency_id", "user_hash", "event_type", "page_path", "session_id", "created_at", "payload"];
 const esc = (v: unknown): string => {
 if (v === null || v === undefined) return "";
 const s = typeof v === "string" ? v : JSON.stringify(v);
 if (/["\n,]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
 return s;
 };
 const head = cols.join(",") + "\n";
 const body = all.map((r) => cols.map((c) => esc(r[c])).join(",")).join("\n");
 return new NextResponse(head + body, {
 status: 200,
 headers: {
 "Content-Type": "text/csv; charset=utf-8",
 "Content-Disposition": `attachment; filename="vsi-analytics-${sinceDays}d.csv"`,
 },
 });
 }

 // Default: JSONL — one event per line
 const body = all.map((r) => JSON.stringify(r)).join("\n");
 return new NextResponse(body, {
 status: 200,
 headers: {
 "Content-Type": "application/x-ndjson",
 "Content-Disposition": `attachment; filename="vsi-analytics-${sinceDays}d.jsonl"`,
 },
 });
}
