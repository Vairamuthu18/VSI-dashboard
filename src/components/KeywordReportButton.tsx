"use client";

import { useState, useRef, useEffect } from "react";

type ReportType = "keyword_summary" | "keyword_detailed" | "keyword_tasks";

const OPTIONS: { type: ReportType; title: string; subtitle: string; needsStrategy?: boolean }[] = [
 { type: "keyword_summary", title: "Executive Summary", subtitle: "One page · client-facing language" },
 { type: "keyword_detailed", title: "Detailed Strategy Report", subtitle: "Full intelligence · for strategists" },
 { type: "keyword_tasks", title: "Execution Task List", subtitle: "Tickets for writers / devs / SEO", needsStrategy: true },
];

const TYPE_LABEL: Record<ReportType, string> = {
 keyword_summary: "Executive Summary",
 keyword_detailed: "Detailed Strategy Report",
 keyword_tasks: "Execution Task List",
};

interface ReportRow {
 id?: string;
 type: ReportType;
 shareUrl: string;
 generatedAt: string;
}

interface Props {
 trackedKeywordId: string;
 priorReports?: ReportRow[];
 // Set when a Citation Strategy has been generated for this keyword.
 // Task List quality is much higher when we have one to ground the output.
 hasCitationStrategy?: boolean;
}

function shortDateTime(iso: string) {
 const d = new Date(iso);
 const date = d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
 const time = d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
 return `${date} · ${time}`;
}

// Async helper lives outside the component so the react-hooks/purity lint rule
// doesn't mistake the Date.now() inside it for a render-time call.
async function pollUntilReady(reportId: string): Promise<{ status: string; error?: string }> {
 const start = Date.now();
 const TIMEOUT_MS = 180_000;
 const INTERVAL_MS = 2500;
 while (Date.now() - start < TIMEOUT_MS) {
 await new Promise((r) => setTimeout(r, INTERVAL_MS));
 try {
 const res = await fetch(`/api/keyword-report/${reportId}/status`, { cache: "no-store" });
 if (!res.ok) continue;
 const data = (await res.json()) as { status: string; error?: string };
 if (data.status === "ready") return { status: "ready" };
 if (data.status === "failed") return { status: "failed", error: data.error };
 } catch {
 // transient — keep polling
 }
 }
 return { status: "failed", error: "Generation timed out. Try again in a minute." };
}

export default function KeywordReportButton({ trackedKeywordId, priorReports = [], hasCitationStrategy = false }: Props) {
 const [open, setOpen] = useState(false);
 const [loading, setLoading] = useState<ReportType | null>(null);
 const [error, setError] = useState<string | null>(null);
 const [reports, setReports] = useState<ReportRow[]>(priorReports);
 const [justGenerated, setJustGenerated] = useState<string | null>(null); // shareUrl of the newest one
 const [importing, setImporting] = useState<string | null>(null);
 const [importMsg, setImportMsg] = useState<string | null>(null);
 const ref = useRef<HTMLDivElement>(null);

 useEffect(() => {
 function onClick(e: MouseEvent) {
 if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
 }
 if (open) document.addEventListener("mousedown", onClick);
 return () => document.removeEventListener("mousedown", onClick);
 }, [open]);

 // Listen for the "Generate Task List" CTA from the brief, so the user
 // doesn't have to manually open the dropdown after scrolling here.
 useEffect(() => {
 function onTrigger() {
 if (loading) return;
 generate("keyword_tasks");
 }
 window.addEventListener("vsi:generate-task-list", onTrigger);
 return () => window.removeEventListener("vsi:generate-task-list", onTrigger);
 // eslint-disable-next-line react-hooks/exhaustive-deps
 }, [loading]);

 async function generate(type: ReportType) {
 if (loading) return;
 setLoading(type);
 setError(null);
 setJustGenerated(null);
 setOpen(false);
 try {
 const res = await fetch("/api/keyword-report/generate", {
 method: "POST",
 headers: { "Content-Type": "application/json" },
 body: JSON.stringify({ tracked_keyword_id: trackedKeywordId, type }),
 });
 const raw = await res.text();
 let data: { id?: string; share_url?: string; status?: string; error?: string };
 try {
 data = JSON.parse(raw);
 } catch {
 setError(res.status === 504 || res.status === 502
 ? "The assistant is busy right now. Try again in a minute."
 : "Service returned an unexpected response. Try again.");
 return;
 }
 if ((!res.ok && res.status !== 202) || !data.id || !data.share_url) {
 setError(data.error ?? "Failed to start report generation");
 return;
 }
 // Add the row in "pending" state so the user sees it immediately.
 const fresh: ReportRow = {
 id: data.id,
 type,
 shareUrl: data.share_url,
 generatedAt: new Date().toISOString(),
 };
 setReports((prev) => [fresh, ...prev]);

 // Poll until ready or failed. Stay in `loading` so the user sees the spinner.
 const final = await pollUntilReady(data.id);
 if (final.status === "ready") {
 setJustGenerated(data.share_url);
 } else {
 setError(final.error ?? "Generation failed");
 // Remove the placeholder row so the user isn't left with an unreadable link
 setReports((prev) => prev.filter((r) => r.id !== data.id));
 }
 } catch (e) {
 setError(e instanceof Error ? e.message : "Network error");
 } finally {
 setLoading(null);
 }
 }

 async function copyToClipboard(text: string) {
 try { await navigator.clipboard.writeText(text); } catch {}
 }

 async function deleteReport(reportId: string) {
 if (!confirm("Delete this report? Anyone with the share link will no longer be able to view it.")) return;
 try {
 const res = await fetch(`/api/keyword-report/${reportId}`, { method: "DELETE" });
 if (res.ok) {
 setReports((prev) => prev.filter((r) => r.id !== reportId));
 }
 } catch {}
 }

 async function importToTracker(reportId: string) {
 if (importing) return;
 setImporting(reportId);
 setImportMsg(null);
 try {
 const res = await fetch("/api/tasks/import-from-report", {
 method: "POST",
 headers: { "Content-Type": "application/json" },
 body: JSON.stringify({ report_id: reportId }),
 });
 const data = await res.json().catch(() => ({})) as { inserted?: number; skipped?: number; error?: string };
 if (!res.ok) {
 setImportMsg(data.error ?? "Failed to import tasks");
 } else {
 const ins = data.inserted ?? 0;
 const skp = data.skipped ?? 0;
 setImportMsg(
 ins === 0
 ? `All ${skp} tasks already imported. Nothing new added.`
 : `Imported ${ins} task${ins === 1 ? "" : "s"} to the tracker${skp > 0 ? ` · ${skp} duplicates skipped` : ""}.`
 );
 // Refresh the page so the task panel below shows the new rows.
 if (ins > 0) window.location.reload();
 }
 } catch (e) {
 setImportMsg(e instanceof Error ? e.message : "Network error");
 } finally {
 setImporting(null);
 }
 }

 // Group reports by type so users can see what kinds they have at a glance.
 const grouped: Record<ReportType, ReportRow[]> = {
 keyword_summary: [],
 keyword_detailed: [],
 keyword_tasks: [],
 };
 for (const r of reports) grouped[r.type].push(r);

 const hasAny = reports.length > 0;

 return (
 <div id="reports-section" className="rounded-[20px] border border-gray-200 bg-card p-5 scroll-mt-20">
 <div className="flex items-start justify-between gap-3 flex-wrap">
 <div className="flex-1 min-w-0">
 <h3 className="text-base font-semibold text-gray-900">Reports</h3>
 <p className="text-xs text-gray-500 mt-0.5">
 Produce a shareable, branded report from the latest snapshot. Each new report is saved alongside the previous ones — generating a different type does not replace the old one.
 </p>
 </div>

 <div className="relative" ref={ref}>
 <button
 onClick={() => setOpen((v) => !v)}
 disabled={!!loading}
 className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-600 disabled:opacity-50 transition-colors flex items-center gap-2"
 >
 {loading ? (
 <>
 <span className="inline-block h-3 w-3 rounded-full border-2 border-white/40 border-t-white animate-spin" />
 Generating {TYPE_LABEL[loading]}…
 </>
 ) : (
 <>
 {hasAny ? "Generate another" : "Generate report"}
 <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
 <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.06l3.71-3.83a.75.75 0 111.08 1.04l-4.25 4.39a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z" clipRule="evenodd"/>
 </svg>
 </>
 )}
 </button>

 {open && !loading && (
 <div className="absolute right-0 mt-2 w-80 rounded-[20px] border border-gray-200 bg-card shadow-lg z-20 overflow-hidden">
 {OPTIONS.map((o) => {
 const wantsStrategy = o.needsStrategy && !hasCitationStrategy;
 return (
 <button
 key={o.type}
 onClick={() => generate(o.type)}
 className="w-full text-left px-4 py-3 hover:bg-amber-50 transition-colors border-b border-gray-100 last:border-b-0"
 >
 <div className="flex items-center justify-between gap-2">
 <p className="text-sm font-semibold text-gray-900">{o.title}</p>
 {o.needsStrategy && (
 <span className={`text-[10px] font-bold uppercase tracking-wider rounded-full px-1.5 py-0.5 ${
 hasCitationStrategy ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
 }`}>
 {hasCitationStrategy ? "Grounded" : "Best after Citation Strategy"}
 </span>
 )}
 </div>
 <p className="text-xs text-gray-500 mt-0.5">{o.subtitle}</p>
 {wantsStrategy && (
 <p className="text-[11px] text-amber-700 mt-1.5 leading-relaxed">
 Run <strong>Citation Strategy</strong> first — the task list will then map every ticket to its patterns, gaps, and page changes.
 </p>
 )}
 </button>
 );
 })}
 </div>
 )}
 </div>
 </div>

 {loading && (
 <div className="mt-3 rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 flex items-center gap-3">
 <span className="shrink-0 inline-block h-4 w-4 rounded-full border-2 border-amber-300 border-t-amber-600 animate-spin" />
 <div className="min-w-0">
 <p className="text-sm font-semibold text-amber-900">Generating {TYPE_LABEL[loading]}…</p>
 <p className="text-[11px] text-amber-700/80 mt-0.5">Running in the background — usually 30 to 90 seconds. You can leave the page and come back; the report will be saved.</p>
 </div>
 </div>
 )}

 {error && (
 <div className="mt-3 rounded-lg bg-red-50 border border-red-300 px-4 py-3 text-sm text-red-700">{error}</div>
 )}

 {importMsg && (
 <div className="mt-3 rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-2.5 text-sm text-emerald-800">{importMsg}</div>
 )}

 {hasAny && (
 <div className="mt-4 space-y-3">
 {(Object.keys(grouped) as ReportType[]).map((t) => {
 const list = grouped[t];
 if (list.length === 0) return null;
 return (
 <div key={t}>
 <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">{TYPE_LABEL[t]}</p>
 <div className="space-y-1.5">
 {list.map((r) => {
 const fresh = justGenerated === r.shareUrl;
 return (
 <div
 key={r.shareUrl}
 className={`flex flex-wrap items-center justify-between gap-2 rounded-lg border px-3 py-2 transition-colors ${
 fresh ? "border-green-300 bg-green-50" : "border-gray-200 bg-gray-50"
 }`}
 >
 <div className="min-w-0 flex-1">
 <p className="text-xs text-gray-700 truncate">{r.shareUrl}</p>
 <p className="text-[11px] text-gray-500 mt-0.5">
 {fresh && <span className="text-green-700 font-semibold mr-1">Just generated · </span>}
 {shortDateTime(r.generatedAt)}
 </p>
 </div>
 <div className="flex items-center gap-1.5 shrink-0">
 {r.type === "keyword_tasks" && r.id && (
 <button
 onClick={() => importToTracker(r.id!)}
 disabled={importing === r.id}
 className="rounded-md bg-emerald-500 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-emerald-600 disabled:opacity-50 transition-colors"
 title="Push these tasks into the built-in task tracker"
 >
 {importing === r.id ? "Importing…" : "Import to tracker"}
 </button>
 )}
 <button
 onClick={() => copyToClipboard(window.location.origin + r.shareUrl)}
 className="rounded-md border border-gray-300 bg-card px-2 py-1 text-[11px] font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
 >Copy link</button>
 <a
 href={r.shareUrl}
 target="_blank"
 rel="noopener noreferrer"
 className="rounded-md bg-amber-500 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-amber-600 transition-colors"
 >Open →</a>
 {r.id && (
 <button
 onClick={() => deleteReport(r.id!)}
 title="Delete this report"
 className="rounded-md border border-gray-300 bg-card px-2 py-1 text-[11px] font-semibold text-red-600 hover:bg-red-50 hover:border-red-300 transition-colors"
 >✕</button>
 )}
 </div>
 </div>
 );
 })}
 </div>
 </div>
 );
 })}
 </div>
 )}
 </div>
 );
}
