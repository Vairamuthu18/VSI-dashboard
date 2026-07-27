"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { getOpportunitySignal } from "@/lib/opportunities";
import type { OpportunityBrief } from "@/app/api/opportunity-brief/route";

interface Props {
 gapLabel: string;
 trackedKeywordId: string;
 initialBrief?: OpportunityBrief | null;
 isStale?: boolean;
}

export default function OpportunityBriefButton(props: Props) {
 const router = useRouter();
 const [, startTransition] = useTransition();
 const [brief, setBrief] = useState<OpportunityBrief | null>(props.initialBrief ?? null);
 const [loading, setLoading] = useState(false);
 const [expanded, setExpanded] = useState(!!props.initialBrief);
 // Optimistically clear the stale flag after a successful regenerate so the
 // user doesn't see "Outdated — signals changed" still hanging there while
 // the server-rendered isStale prop refreshes.
 const [staleOverride, setStaleOverride] = useState<boolean | null>(null);
 const isStale = staleOverride ?? props.isStale ?? false;
 const [error, setError] = useState<string | null>(null);

 const signal = getOpportunitySignal(props.gapLabel);

 async function regenerate() {
 if (loading) return;
 setLoading(true);
 setExpanded(true);
 setError(null);
 try {
 const res = await fetch("/api/opportunity-brief", {
 method: "POST",
 headers: { "Content-Type": "application/json" },
 body: JSON.stringify({ trackedKeywordId: props.trackedKeywordId }),
 });
 if (res.ok) {
 setBrief(await res.json());
 setStaleOverride(false);
 // Re-fetch the server component so the persisted ai_brief_snapshot
 // is picked up next render — also refreshes any other panels that
 // depend on the new state (e.g. the snapshot strip).
 startTransition(() => router.refresh());
 } else {
 const data = await res.json().catch(() => ({}));
 setError(data.error ?? `Request failed (${res.status}). All AI models may be rate-limited — try again in a minute.`);
 }
 } catch (e) {
 setError(e instanceof Error ? e.message : "Network error");
 } finally {
 setLoading(false);
 }
 }

 return (
 <div className={`rounded-[20px] ${signal.priorityBg} p-5`}>
 {/* Header */}
 <div className="flex items-start justify-between gap-4">
 <div className="flex-1">
 <div className="flex items-center gap-2 mb-1">
 <span className={`text-sm font-bold uppercase tracking-wider ${signal.priorityColor}`}>
 {signal.priorityLabel}
 </span>
 {brief && isStale && (
 <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
 Outdated — signals changed
 </span>
 )}
 </div>
 <h2 className="text-lg font-bold text-gray-900">{signal.headline}</h2>
 <p className="text-sm text-gray-600 mt-1">{signal.explanation}</p>
 </div>

 <div className="flex flex-wrap items-center gap-2 shrink-0">
 {brief && !loading && (
 <button
 onClick={() => setExpanded((v) => !v)}
 className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
 >
 {expanded ? "Hide" : "Show"}
 </button>
 )}
 <button
 onClick={regenerate}
 disabled={loading}
 className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-600 disabled:opacity-50 transition-colors"
 >
 {loading
 ? "Generating..."
 : brief
 ? (isStale ? "↻ Regenerate (outdated)" : "↻ Regenerate")
 : "⚡ Generate AI Brief"}
 </button>
 </div>
 </div>

 {/* Quick rule-based actions (always visible) */}
 {!brief && signal.quickActions.length > 0 && (
 <div className="mt-4 space-y-2">
 <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Quick actions</p>
 {signal.quickActions.map((qa, i) => (
 <div key={i} className="flex gap-3 rounded-lg bg-gray-50 border border-gray-200 px-3 py-2.5">
 <span className="shrink-0 flex h-5 w-5 mt-0.5 items-center justify-center rounded-full bg-gray-200 text-xs font-bold text-gray-700">
 {i + 1}
 </span>
 <div>
 <p className="text-sm font-medium text-gray-900">{qa.action}</p>
 <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{qa.why}</p>
 </div>
 </div>
 ))}
 </div>
 )}

 {/* Error state */}
 {error && expanded && !brief && (
 <div className="mt-4 rounded-lg bg-red-50 border border-red-300 px-4 py-3">
 <p className="text-xs font-bold text-red-700 uppercase tracking-wider mb-1">Brief Generation Failed</p>
 <p className="text-sm text-red-700 leading-relaxed">{error}</p>
 </div>
 )}

 {/* LLM-generated brief */}
 {brief && expanded && (
 <div className="mt-5 space-y-3">
 {brief.confidence && (
 <div className={`rounded-lg border px-4 py-3 ${
 brief.confidence.level === "high" ? "bg-green-50 border-green-200"
 : brief.confidence.level === "medium" ? "bg-amber-50 border-amber-200"
 : "bg-orange-50 border-orange-200"
 }`}>
 <div className="flex items-center justify-between gap-2 mb-1.5">
 <p className="text-xs font-bold uppercase tracking-wider text-gray-700">
 Confidence
 </p>
 <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
 brief.confidence.level === "high" ? "bg-green-500 text-white"
 : brief.confidence.level === "medium" ? "bg-amber-500 text-white"
 : "bg-orange-500 text-white"
 }`}>{brief.confidence.level}</span>
 </div>
 <ul className="space-y-0.5">
 {brief.confidence.reasons.map((r, i) => (
 <li key={i} className="text-xs text-gray-700 flex items-start gap-1.5">
 <span className="text-gray-400 mt-0.5">·</span><span>{r}</span>
 </li>
 ))}
 </ul>
 </div>
 )}
 {brief.aioOffTopic && (
 <div className="rounded-lg bg-red-50 border border-red-300 px-4 py-3">
 <p className="text-xs font-bold text-red-700 uppercase tracking-wider mb-1">⚠️ AIO topic mismatch</p>
 <p className="text-sm text-gray-800 leading-relaxed">
 Google&apos;s AI answer for this query is actually about <strong>{brief.aioOffTopic.actualTopic}</strong> — not your industry. The actions below are a disambiguation strategy, not citation injection.
 </p>
 </div>
 )}

 {/* Insight callout */}
 {brief.targetedInsight && (
 <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3">
 <p className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-1">Key Insight</p>
 <p className="text-sm text-gray-800 leading-relaxed">{brief.targetedInsight}</p>
 </div>
 )}

 {/* Situation */}
 <div className="rounded-lg bg-card border border-gray-200 px-4 py-3">
 <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Situation</p>
 <p className="text-sm text-gray-800 leading-relaxed">{brief.situation}</p>
 </div>

 {/* Content angle */}
 {brief.contentAngle && (
 <div className="rounded-lg bg-blue-50 border border-blue-200 px-4 py-3">
 <p className="text-xs font-bold text-blue-700 uppercase tracking-wider mb-1">Content Angle</p>
 <p className="text-sm text-gray-800 leading-relaxed">{brief.contentAngle}</p>
 </div>
 )}

 {/* CTA — fires the Task List report directly. KeywordReportButton
 listens for vsi:generate-task-list and runs the generator. */}
 <div className="rounded-lg bg-gradient-to-br from-gray-900 to-gray-800 text-white px-5 py-4">
 <div className="flex items-center justify-between gap-3 flex-wrap">
 <div className="min-w-0">
 <p className="text-sm font-bold leading-tight">Ready to execute?</p>
 <p className="text-xs text-gray-300 mt-0.5 leading-relaxed">
 Generate a <strong className="text-white">Task List report</strong> — concrete tickets with owner roles, effort, acceptance criteria. Import to the tracker in one click.
 </p>
 </div>
 <button
 type="button"
 onClick={() => {
 if (typeof window === "undefined") return;
 window.dispatchEvent(new CustomEvent("vsi:generate-task-list"));
 const el = document.getElementById("reports-section");
 if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
 }}
 className="shrink-0 rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-600 transition-colors"
 >
 Generate Task List →
 </button>
 </div>
 </div>
 </div>
 )}
 </div>
 );
}
