"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";

interface StrategyPattern {
 name: string;
 why_it_matters: string;
}

interface StrategyGap {
 what_competitors_have: string;
 what_client_likely_needs: string;
}

interface StrategyAction {
 step: number;
 title: string;
 detail: string;
 effort: "low" | "medium" | "high";
 impact: "low" | "medium" | "high";
}

interface ClientPageAudit {
 url: string;
 title: string | null;
 wordCount: number;
 strengths: string[];
 weaknesses: string[];
 pageChanges: string[];
}

export interface CitationStrategy {
 summary: string;
 patterns: StrategyPattern[];
 gaps: StrategyGap[];
 actions: StrategyAction[];
 clientPageAudit?: ClientPageAudit | null;
 scrapedSources: Array<{
 url: string;
 title: string | null;
 wordCount: number;
 scraped: boolean;
 isClient?: boolean;
 }>;
 generatedAt: string;
}

// Polls the citation-strategy status endpoint until the background job
// finishes or the ceiling is reached. Kept outside the component so the
// purity lint rule doesn't trip on the Date.now() inside the loop.
async function pollCitationStrategy(snapshotId: string): Promise<{ status: string; error?: string; strategy?: CitationStrategy | null }> {
 const start = Date.now();
 const TIMEOUT_MS = 180_000;
 const INTERVAL_MS = 3000;
 while (Date.now() - start < TIMEOUT_MS) {
 await new Promise((r) => setTimeout(r, INTERVAL_MS));
 try {
 const res = await fetch(`/api/citation-strategy/${snapshotId}/status`, { cache: "no-store" });
 if (!res.ok) continue;
 const data = (await res.json()) as { status?: string; error?: string; strategy?: CitationStrategy | null };
 if (data.status === "ready") return { status: "ready", strategy: data.strategy ?? null };
 if (data.status === "failed") return { status: "failed", error: data.error ?? "Failed" };
 } catch {
 // transient — keep polling
 }
 }
 return { status: "failed", error: "Analysis timed out — try again in a minute." };
}

const EFFORT_COLOR = { low: "text-green-700", medium: "text-yellow-700", high: "text-red-700" };
const IMPACT_COLOR = { low: "text-gray-500", medium: "text-blue-700", high: "text-green-700" };

interface Props {
 snapshotId: string;
 initial: CitationStrategy | null;
 competitorCount: number;
}

export default function CitationStrategyPanel({ snapshotId, initial, competitorCount }: Props) {
 const router = useRouter();
 const [strategy, setStrategy] = useState<CitationStrategy | null>(initial);
 const [loading, setLoading] = useState(false);
 const [error, setError] = useState<string | null>(null);

 async function generate() {
 if (loading) return;
 setLoading(true);
 setError(null);
 try {
 const res = await fetch("/api/citation-strategy", {
 method: "POST",
 headers: { "Content-Type": "application/json" },
 body: JSON.stringify({ snapshot_id: snapshotId }),
 });
 if (res.redirected) {
 setError("Your session has expired — please reload the page and sign in again.");
 return;
 }
 const raw = await res.text();
 let data: { error?: string; status?: string };
 try {
 data = JSON.parse(raw);
 } catch {
 setError(
 res.status === 504 || res.status === 502
 ? "Service is busy right now. Try again in a minute."
 : `Service returned an unexpected response (${res.status}). Try again.`
 );
 return;
 }
 if (!res.ok && res.status !== 202) {
 setError(data.error ?? "Failed to analyse");
 return;
 }

 // Generation runs in the background — poll the status endpoint until
 // the strategy is ready or generation fails. ~2 minutes ceiling.
 const final = await pollCitationStrategy(snapshotId);
 if (final.status === "ready" && final.strategy) {
 setStrategy(final.strategy);
 router.refresh();
 } else {
 setError(final.error ?? "Citation analysis failed");
 }
 } catch (e) {
 setError(e instanceof Error ? e.message : "Network error");
 } finally {
 setLoading(false);
 }
 }

 const hasCompetitors = competitorCount > 0;
 const buttonLabel = loading
 ? "Analysing citations..."
 : strategy
 ? "↻ Re-analyse"
 : "⚡ Analyse citations";

 return (
 <div className="rounded-[20px] border border-gray-200 bg-card p-5 space-y-4">
 <div className="flex items-start justify-between gap-3">
 <div className="flex-1 min-w-0">
 <div className="flex items-center gap-2 mb-1">
 <Sparkles size={16} strokeWidth={2} className="text-amber-600" />
 <h3 className="text-base font-semibold text-gray-900">Citation Strategy</h3>
 {strategy && (
 <span className="text-xs text-gray-500">
 · last run {new Date(strategy.generatedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
 </span>
 )}
 </div>
 <p className="text-xs text-gray-500">
 Scrapes the top cited competitor pages and asks an LLM what content earns AI Mode citations for this query. Use the output as a citation-worthiness brief for the client&rsquo;s page.
 </p>
 </div>
 <button
 onClick={generate}
 disabled={loading || !hasCompetitors}
 className="shrink-0 rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-600 disabled:opacity-50 transition-colors"
 >
 {buttonLabel}
 </button>
 </div>

 {!hasCompetitors && !strategy && (
 <div className="rounded-lg bg-gray-50 border border-gray-200 px-4 py-3 text-xs text-gray-500">
 No competitor citations to analyse yet. Run the keyword first to capture AI Mode citations.
 </div>
 )}

 {error && (
 <div className="rounded-lg bg-red-50 border border-red-300 px-4 py-3 text-sm text-red-700">{error}</div>
 )}

 {strategy && (
 <div className="space-y-4">
 {/* TL;DR */}
 <div className="rounded-lg bg-amber-50 border border-amber-200 p-4">
 <p className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-1">TL;DR</p>
 <p className="text-sm text-gray-800 leading-relaxed">{strategy.summary}</p>
 </div>

 {/* Patterns */}
 {strategy.patterns?.length > 0 && (
 <div>
 <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
 What earns citations here
 </p>
 <div className="space-y-2">
 {strategy.patterns.map((p, i) => (
 <div key={i} className="rounded-lg bg-gray-50 border border-gray-200 p-3">
 <p className="text-sm font-semibold text-gray-900">{p.name}</p>
 <p className="mt-1 text-xs text-gray-600 leading-relaxed">{p.why_it_matters}</p>
 </div>
 ))}
 </div>
 </div>
 )}

 {/* Gaps */}
 {strategy.gaps?.length > 0 && (
 <div>
 <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
 Likely gaps on the client&rsquo;s page
 </p>
 <div className="space-y-2">
 {strategy.gaps.map((g, i) => (
 <div key={i} className="rounded-lg bg-card border border-gray-200 p-3">
 <p className="text-xs text-gray-500 mb-0.5">Competitors have</p>
 <p className="text-sm text-gray-800">{g.what_competitors_have}</p>
 <p className="text-xs text-blue-700 mt-2 mb-0.5">Client likely needs</p>
 <p className="text-sm text-gray-800">{g.what_client_likely_needs}</p>
 </div>
 ))}
 </div>
 </div>
 )}

 {/* Client page audit (only when we managed to scrape the client's ranking URL) */}
 {strategy.clientPageAudit && (
 <div>
 <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
 Your ranking page vs the cited pages
 </p>
 <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-4 space-y-3">
 <div className="flex items-baseline justify-between gap-3 flex-wrap">
 <a
 href={strategy.clientPageAudit.url}
 target="_blank"
 rel="noopener noreferrer"
 className="text-sm font-semibold text-amber-800 hover:underline truncate"
 >
 {strategy.clientPageAudit.title ?? strategy.clientPageAudit.url}
 </a>
 <span className="text-[11px] text-amber-700 shrink-0">
 {strategy.clientPageAudit.wordCount} words scraped
 </span>
 </div>

 {strategy.clientPageAudit.strengths.length > 0 && (
 <div>
 <p className="text-[10px] font-bold uppercase tracking-wider text-green-700 mb-1">✓ Strengths</p>
 <ul className="space-y-1">
 {strategy.clientPageAudit.strengths.map((s, i) => (
 <li key={i} className="text-xs text-gray-800 leading-relaxed flex items-start gap-2">
 <span className="shrink-0 text-green-600 mt-0.5">•</span><span>{s}</span>
 </li>
 ))}
 </ul>
 </div>
 )}

 {strategy.clientPageAudit.weaknesses.length > 0 && (
 <div>
 <p className="text-[10px] font-bold uppercase tracking-wider text-red-700 mb-1">✗ What&rsquo;s missing</p>
 <ul className="space-y-1">
 {strategy.clientPageAudit.weaknesses.map((s, i) => (
 <li key={i} className="text-xs text-gray-800 leading-relaxed flex items-start gap-2">
 <span className="shrink-0 text-red-600 mt-0.5">•</span><span>{s}</span>
 </li>
 ))}
 </ul>
 </div>
 )}

 {strategy.clientPageAudit.pageChanges.length > 0 && (
 <div>
 <p className="text-[10px] font-bold uppercase tracking-wider text-blue-700 mb-1">→ Specific changes to make</p>
 <ul className="space-y-1">
 {strategy.clientPageAudit.pageChanges.map((s, i) => (
 <li key={i} className="text-xs text-gray-800 leading-relaxed flex items-start gap-2">
 <span className="shrink-0 text-blue-600 mt-0.5">→</span><span>{s}</span>
 </li>
 ))}
 </ul>
 </div>
 )}
 </div>
 </div>
 )}

 {/* Actions */}
 {strategy.actions?.length > 0 && (
 <div>
 <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
 3-step plan
 </p>
 <div className="space-y-2">
 {strategy.actions.map((action) => (
 <div key={action.step} className="rounded-lg bg-card border border-gray-200 p-3">
 <div className="flex items-start gap-3">
 <span className="shrink-0 flex h-6 w-6 items-center justify-center rounded-full bg-amber-500 text-xs font-bold text-white">
 {action.step}
 </span>
 <div className="flex-1 min-w-0">
 <div className="flex items-center gap-3 flex-wrap mb-1">
 <p className="text-sm font-semibold text-gray-900">{action.title}</p>
 <span className={`text-xs font-medium ${EFFORT_COLOR[action.effort]}`}>Effort: {action.effort}</span>
 <span className={`text-xs font-medium ${IMPACT_COLOR[action.impact]}`}>Impact: {action.impact}</span>
 </div>
 <p className="text-xs text-gray-600 leading-relaxed">{action.detail}</p>
 </div>
 </div>
 </div>
 ))}
 </div>
 </div>
 )}

 {/* Scraped sources transparency */}
 {strategy.scrapedSources?.length > 0 && (
 <div>
 <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
 Sources analysed ({strategy.scrapedSources.filter((s) => s.scraped).length} of {strategy.scrapedSources.length})
 </p>
 <div className="space-y-1">
 {strategy.scrapedSources.map((s, i) => (
 <a
 key={i}
 href={s.url}
 target="_blank"
 rel="noopener noreferrer"
 className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs transition-colors ${
 !s.scraped
 ? "border-red-200 bg-red-50 text-red-700"
 : s.isClient
 ? "border-amber-200 bg-amber-50 hover:bg-amber-100"
 : "border-gray-200 bg-gray-50 hover:bg-gray-100"
 }`}
 >
 <span className="shrink-0 text-gray-400">{i + 1}.</span>
 <span className="truncate flex-1">{s.title ?? s.url}</span>
 {s.isClient && <span className="shrink-0 text-amber-700 font-bold">CLIENT</span>}
 <span className="shrink-0 text-gray-400">{s.wordCount} words</span>
 {!s.scraped && <span className="shrink-0 text-red-600">scrape failed</span>}
 </a>
 ))}
 </div>
 </div>
 )}
 </div>
 )}
 </div>
 );
}
