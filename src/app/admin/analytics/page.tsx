import { createClient } from "@/lib/supabase/server";
import { requireSuperAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

const EVENT_LABEL: Record<string, string> = {
 chat_query: "Chat queries",
 chat_thumbs: "Chat 👍/👎",
 brief_generated: "Briefs generated",
 brief_regenerated: "Briefs regenerated",
 report_generated: "Reports started",
 report_completed: "Reports completed",
 task_imported: "Tasks imported",
 task_status_change: "Task status changes",
 task_outcome: "Task outcomes",
 feedback_submitted: "Feedback submitted",
 keyword_run_outcome: "Keyword runs",
 engine_used: "Engine calls",
};

function nowMs(): number { return Date.now(); }

export default async function AdminAnalyticsPage() {
 await requireSuperAdmin();
 const supabase = await createClient();

 // Last 30 days of events.
 const sinceISO = new Date(nowMs() - 30 * 86400 * 1000).toISOString();

 const { data: events, count } = await supabase
 .from("analytics_events")
 .select("event_type, payload, created_at, agency_id", { count: "exact" })
 .gte("created_at", sinceISO)
 .order("created_at", { ascending: false })
 .limit(2000);

 const rows = events ?? [];

 // Roll up by event type
 const byType = new Map<string, number>();
 for (const r of rows) {
 const t = r.event_type as string;
 byType.set(t, (byType.get(t) ?? 0) + 1);
 }
 const typeRows = Array.from(byType.entries()).sort((a, b) => b[1] - a[1]);

 // Chat thumbs sentiment
 const thumbsRows = rows.filter((r) => r.event_type === "chat_thumbs");
 const thumbsUp = thumbsRows.filter((r) => (r.payload as { vote?: string })?.vote === "up").length;
 const thumbsDown = thumbsRows.filter((r) => (r.payload as { vote?: string })?.vote === "down").length;
 const thumbsTotal = thumbsUp + thumbsDown;
 const thumbsPct = thumbsTotal === 0 ? null : Math.round((thumbsUp / thumbsTotal) * 100);

 // Brief confidence histogram
 const briefRows = rows.filter((r) => r.event_type === "brief_generated");
 const briefConfidence = { high: 0, medium: 0, low: 0 };
 for (const r of briefRows) {
 const c = (r.payload as { confidence?: string })?.confidence;
 if (c && c in briefConfidence) briefConfidence[c as keyof typeof briefConfidence]++;
 }

 // Top chat scopes
 const chatRows = rows.filter((r) => r.event_type === "chat_query");
 const byScope = new Map<string, number>();
 for (const r of chatRows) {
 const k = (r.payload as { scope_kind?: string })?.scope_kind ?? "unknown";
 byScope.set(k, (byScope.get(k) ?? 0) + 1);
 }

 // Daily volume (last 14 days)
 const dailyMap = new Map<string, number>();
 const baseMs = nowMs();
 for (let i = 13; i >= 0; i--) {
 const d = new Date(baseMs - i * 86400 * 1000);
 dailyMap.set(d.toISOString().slice(0, 10), 0);
 }
 for (const r of rows) {
 const d = (r.created_at as string).slice(0, 10);
 if (dailyMap.has(d)) dailyMap.set(d, (dailyMap.get(d) ?? 0) + 1);
 }
 const dailyMax = Math.max(1, ...Array.from(dailyMap.values()));

 return (
 <div className="p-4 sm:p-8 max-w-5xl space-y-6 text-white">
 <div className="flex items-start justify-between gap-3 flex-wrap">
 <div>
 <h1 className="text-xl font-semibold text-white">Analytics</h1>
 <p className="text-xs text-gray-400 mt-1">
 Anonymous interaction data — last 30 days. User IDs are hashed; agency IDs preserved so we can cohort by tenant.
 </p>
 </div>
 <div className="flex items-center gap-2">
 <a
 href="/api/admin/analytics/export?format=jsonl&since_days=30"
 download
 className="rounded-lg bg-[#FF4500] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#E03E00] transition-colors"
 title="Export 30 days of events as JSONL — one event per line, ready for jq / pandas / fine-tuning corpora"
 >
 Export JSONL
 </a>
 <a
 href="/api/admin/analytics/export?format=csv&since_days=30"
 download
 className="rounded-lg border border-[#333] bg-[#1C1C1E] px-3 py-1.5 text-xs font-semibold text-gray-300 hover:bg-[#2C2C2E] transition-colors"
 >
 Export CSV
 </a>
 </div>
 </div>

 {/* Top-line cards */}
 <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
 <Card label="Total events (30d)" value={String(count ?? 0)} />
 <Card label="Brief satisfaction" value={thumbsPct == null ? "—" : `${thumbsPct}%`} sub={thumbsTotal === 0 ? "no thumbs yet" : `${thumbsUp} 👍 · ${thumbsDown} 👎`} />
 <Card label="High-confidence briefs" value={`${briefConfidence.high}`} sub={`${briefConfidence.medium} medium · ${briefConfidence.low} low`} />
 <Card label="Chat queries" value={String(chatRows.length)} sub={`${byScope.get("keyword") ?? 0} keyword · ${byScope.get("client") ?? 0} client · ${byScope.get("global") ?? 0} global`} />
 </div>

 {/* Daily volume bar chart */}
 {/* Agency distribution bar chart */}
 <div className="rounded-[20px] border border-[#333] bg-[#1C1C1E] p-5 mt-6">
 <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Events by agency — last 30 days</p>
 { (() => {
 const agencyMap = new Map<string, number>();
 for (const r of rows) {
 const ag = (r as any).agency_id ?? "unknown";
 agencyMap.set(ag, (agencyMap.get(ag) ?? 0) + 1);
 }
 const agencyRows = Array.from(agencyMap.entries()).sort((a,b)=>b[1]-a[1]).slice(0,10);
 const maxCount = Math.max(1, ...agencyRows.map(([,c])=>c));
 return (
 <div className="flex items-end gap-1 h-32">
 {agencyRows.map(([id, count]) => (
 <div key={id} className="flex-1 flex flex-col items-center justify-end h-full group">
 <div className="flex-1 w-full flex items-end relative">
 <div
 className="w-full rounded-t bg-[#FF4500] hover:bg-[#FF4500]/90 transition-colors animate-fade-in"
 style={{ height: `${Math.max(4, (count / maxCount) * 100)}%` }}
 title={`${id}: ${count} events`}
 />
 </div>
 <p className="text-[9px] text-gray-500 break-all mt-1 shrink-0" style={{maxWidth:"100%"}}>{id.slice(0,6)}</p>
 </div>
 ))}
 </div>
 );
 })() }
 </div>
 <div className="rounded-[20px] border border-[#333] bg-[#1C1C1E] p-5">
 <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Daily event volume — last 14 days</p>
 <div className="flex items-end gap-1 h-32">
 {Array.from(dailyMap.entries()).map(([d, v]) => (
 <div key={d} className="flex-1 flex flex-col items-center justify-end h-full group">
 <div className="flex-1 w-full flex items-end relative">
 <div
 className="w-full rounded-t bg-[#FF4500] hover:bg-[#FF4500]/90 transition-colors animate-fade-in"
 style={{ height: `${Math.max(4, (v / dailyMax) * 100)}%` }}
 title={`${d}: ${v} events`}
 />
 </div>
 <p className="text-[9px] text-gray-500 mt-1 shrink-0">{d.slice(5)}</p>
 </div>
 ))}
 </div>
 </div>

 {/* By type breakdown */}
 <div className="rounded-[20px] border border-[#333] bg-[#1C1C1E] p-5">
 <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Events by type</p>
 {typeRows.length === 0 ? (
 <p className="text-xs text-gray-500">No events yet.</p>
 ) : (
 <div className="space-y-2">
 {typeRows.map(([t, n]) => {
 const pct = count && count > 0 ? Math.round((n / count) * 100) : 0;
 return (
 <div key={t}>
 <div className="flex items-center justify-between text-xs mb-1">
 <p className="text-gray-300 font-medium">{EVENT_LABEL[t] ?? t}</p>
 <p className="text-gray-500">{n} <span className="text-gray-500">({pct}%)</span></p>
 </div>
 <div className="h-1.5 rounded-full bg-[#111111] border border-[#333] overflow-hidden">
 <div className="h-full bg-[#FF4500]" style={{ width: `${pct}%` }} />
 </div>
 </div>
 );
 })}
 </div>
 )}
 </div>
 </div>
 );
}

function Card({ label, value, sub }: { label: string; value: string; sub?: string }) {
 return (
 <div className="rounded-[20px] border border-[#333] bg-[#1C1C1E] p-4">
 <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">{label}</p>
 <p className="text-2xl font-bold text-white mt-1">{value}</p>
 {sub && <p className="text-[11px] text-gray-400 mt-1">{sub}</p>}
 </div>
 );
}
