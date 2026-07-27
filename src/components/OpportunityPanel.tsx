"use client";

import { useState } from "react";
import Link from "next/link";
import { getOpportunitySignal, groupByPriority, PRIORITY_ORDER } from "@/lib/opportunities";
import type { KeywordOpportunity, Priority } from "@/lib/opportunities";
import type { OpportunityBrief } from "@/app/api/opportunity-brief/route";
import { Sparkles, ArrowRight, AlertTriangle, CheckCircle2 } from "lucide-react";

interface RawResult {
 id: string;
 tracked_keyword_id: string | null;
 keyword: string;
 domain: string;
 track_type: string;
 rank_position: number | null;
 aio_present: boolean | null;
 client_cited: boolean | null;
 mentioned_in_text: boolean | null;
 cited_domains: string[];
 gap_label: string;
 created_at: string;
}

interface Props {
 results: RawResult[];
 clientId: string;
 briefsByKeywordId?: Record<string, OpportunityBrief | null>;
}

function KeywordCard({
 opp,
 raw,
 clientId,
 savedBrief,
}: {
 opp: KeywordOpportunity;
 raw: RawResult;
 clientId: string;
 savedBrief?: OpportunityBrief | null;
}) {
 const { signal } = opp;
 const detailHref = raw.tracked_keyword_id
 ? `/dashboard/clients/${clientId}/keywords/${raw.tracked_keyword_id}`
 : null;
 const briefReady = !!savedBrief;

 // Inline signal chips — compact, no duplicates
 const chips: { label: string; tone: "blue" | "green" | "yellow" | "gray" | "red" }[] = [];
 if (opp.rankPosition) chips.push({ label: `#${opp.rankPosition} Google`, tone: "blue" });
 else if (opp.trackType !== "geo") chips.push({ label: "Not ranking", tone: "gray" });
 if (opp.clientCited) chips.push({ label: "✓ Cited in AI", tone: "green" });
 else if (opp.mentionedInText) chips.push({ label: "~ Mentioned in AI", tone: "blue" });
 else if (opp.aioPresent) chips.push({ label: "✗ AI invisible", tone: "yellow" });
 if (opp.citedDomains.length > 0 && !opp.clientCited)
 chips.push({ label: `${opp.citedDomains.length} competitors cited`, tone: "gray" });

 const toneClass: Record<"blue" | "green" | "yellow" | "gray" | "red", string> = {
 blue: "bg-cyan-500/10 text-cyan-400 border border-cyan-500/25 shadow-[0_0_8px_rgba(6,182,212,0.15)]",
 green: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 shadow-[0_0_8px_rgba(16,185,129,0.15)]",
 yellow: "bg-amber-500/10 text-amber-400 border border-amber-500/25 shadow-[0_0_8px_rgba(245,158,11,0.15)]",
 gray: "bg-card/[0.04] text-gray-400 border border-white/10",
 red: "bg-rose-500/10 text-rose-400 border border-rose-500/25 shadow-[0_0_8px_rgba(244,63,94,0.15)]",
 };

 const priorityRailMap: Record<string, string> = {
 "text-rose-700": "bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.8)]",
 "text-amber-700": "bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.8)]",
 "text-cyan-700": "bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.8)]",
 "text-emerald-700": "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]",
 "text-gray-500": "bg-gray-600",
 };

 const railGlow = priorityRailMap[signal.priorityColor] ?? "bg-amber-500";

 const inner = (
 <div className="group rounded-[20px] border border-white/[0.08] hover:border-amber-500/60 bg-[#121215] p-5 transition-all duration-300 hover:-translate-y-0.5 shadow-xl hover:shadow-2xl relative overflow-hidden">
 <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/[0.03] rounded-full blur-2xl pointer-events-none group-hover:bg-amber-500/[0.08] transition-all" />

 <div className="flex items-start gap-4 relative z-10">
 {/* Priority neon colour rail */}
 <span
 className={`shrink-0 mt-1 inline-block w-1.5 self-stretch rounded-full ${railGlow}`}
 aria-hidden
 />
 <div className="flex-1 min-w-0">
 <div className="flex flex-wrap items-center gap-2.5 mb-2.5">
 <p className="text-base font-heading font-black text-white truncate group-hover:text-amber-400 transition-colors">
 {opp.keyword}
 </p>
 {briefReady && (
 <span className="rounded-full bg-cyan-500/10 px-2.5 py-0.5 text-[10px] font-mono font-bold text-cyan-400 border border-cyan-500/30 uppercase tracking-wider flex items-center gap-1 shadow-[0_0_8px_rgba(6,182,212,0.2)]">
 <Sparkles size={11} /> Brief Ready
 </span>
 )}
 </div>
 {chips.length > 0 && (
 <div className="flex flex-wrap gap-1.5">
 {chips.map((c, i) => (
 <span key={i} className={`rounded-lg px-2.5 py-1 text-xs font-mono ${toneClass[c.tone]}`}>
 {c.label}
 </span>
 ))}
 </div>
 )}
 </div>
 <div className="shrink-0 flex items-center gap-1.5 text-xs font-mono font-bold text-gray-500 transition-all duration-300 group-hover:text-amber-400 group-hover:translate-x-1">
 <span>Inspect</span>
 <ArrowRight size={14} />
 </div>
 </div>
 </div>
 );

 return detailHref ? <Link href={detailHref} className="block">{inner}</Link> : inner;
}

export default function OpportunityPanel({ results, clientId, briefsByKeywordId }: Props) {
 const [filter, setFilter] = useState<Priority | "all">("all");

 if (results.length === 0) {
 return (
 <div className="rounded-[20px] border border-dashed border-white/15 bg-[#121215] p-12 text-center shadow-xl">
 <Sparkles size={32} className="text-amber-500 mx-auto mb-3 animate-pulse" />
 <p className="text-sm font-heading font-bold text-white">No Diagnostic Results Yet</p>
 <p className="text-xs text-gray-400 mt-1">Run the AI visibility scan above to generate prioritized keywords and competitor opportunities.</p>
 </div>
 );
 }

 // Build opportunity objects + keep raw lookup
 const rawMap = Object.fromEntries(results.map((r) => [r.id, r]));
 const opportunities: KeywordOpportunity[] = results.map((r) => ({
 id: r.id,
 keyword: r.keyword,
 domain: r.domain,
 trackType: r.track_type,
 rankPosition: r.rank_position,
 aioPresent: r.aio_present,
 clientCited: r.client_cited,
 mentionedInText: r.mentioned_in_text,
 citedDomains: r.cited_domains ?? [],
 gapLabel: r.gap_label,
 signal: getOpportunitySignal(r.gap_label),
 createdAt: r.created_at,
 }));

 const grouped = groupByPriority(opportunities);

 const priorityMeta: Record<Priority, { label: string; count: number; color: string; glow: string }> = {
 critical: { label: "Critical", count: grouped.critical.length, color: "text-rose-400", glow: "from-rose-500 to-red-600" },
 high: { label: "High", count: grouped.high.length, color: "text-amber-400", glow: "from-amber-500 to-orange-500" },
 medium: { label: "Medium", count: grouped.medium.length, color: "text-cyan-400", glow: "from-cyan-500 to-blue-500" },
 protect: { label: "Winning", count: grouped.protect.length, color: "text-emerald-400", glow: "from-emerald-500 to-teal-500" },
 info: { label: "Info", count: grouped.info.length, color: "text-gray-400", glow: "from-gray-500 to-gray-600" },
 };

 const visiblePriorities = PRIORITY_ORDER.filter(
 (p) => grouped[p].length > 0 && (filter === "all" || filter === p)
 );

 return (
 <div className="space-y-6">
 {/* Extej Filter Tabs Bar */}
 <div className="flex items-center gap-2 flex-wrap bg-[#121215] border border-white/[0.08] p-1.5 rounded-[20px] w-fit">
 <button
 onClick={() => setFilter("all")}
 className={`rounded-[20px] px-4 py-1.5 text-xs font-mono font-bold transition-all ${
 filter === "all"
 ? "bg-gradient-to-r from-amber-500 to-orange-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.35)] scale-105"
 : "text-gray-400 hover:text-white hover:bg-card/5"
 }`}
 >
 ALL ({opportunities.length})
 </button>
 {PRIORITY_ORDER.filter((p) => grouped[p].length > 0).map((p) => {
 const active = filter === p;
 return (
 <button
 key={p}
 onClick={() => setFilter(p)}
 className={`rounded-[20px] px-4 py-1.5 text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
 active
 ? `bg-gradient-to-r ${priorityMeta[p].glow} text-black shadow-[0_0_15px_rgba(245,158,11,0.35)] scale-105`
 : "text-gray-400 hover:text-white hover:bg-card/5"
 }`}
 >
 <span className={active ? "text-black font-black" : priorityMeta[p].color}>{priorityMeta[p].label.toUpperCase()}</span>
 <span className={active ? "text-black/80" : "text-gray-500 font-normal"}>({priorityMeta[p].count})</span>
 </button>
 );
 })}
 </div>

 {/* Priority groups */}
 {visiblePriorities.map((priority) => (
 <div key={priority} className="space-y-3">
 <div className="flex items-center gap-3 mb-4 pt-2">
 <h3 className={`text-xs font-heading font-black uppercase tracking-widest ${priorityMeta[priority].color} flex items-center gap-1.5`}>
 <span className="w-2 h-2 rounded-full bg-current shadow-[0_0_6px_currentColor]" />
 <span>{priorityMeta[priority].label} PRIORITY — {grouped[priority].length} KEYWORD{grouped[priority].length !== 1 ? "S" : ""}</span>
 </h3>
 {priority === "critical" && (
 <span className="rounded-full bg-rose-500/10 border border-rose-500/30 px-3 py-0.5 text-[11px] font-mono font-bold text-rose-300 flex items-center gap-1 shadow-[0_0_12px_rgba(244,63,94,0.2)]">
 <AlertTriangle size={12} className="text-rose-400" /> Act Now · AI Visibility Deficit
 </span>
 )}
 </div>
 <div className="grid grid-cols-1 gap-3.5">
 {grouped[priority].map((opp) => {
 const raw = rawMap[opp.id];
 const saved = raw?.tracked_keyword_id ? briefsByKeywordId?.[raw.tracked_keyword_id] ?? null : null;
 return (
 <KeywordCard
 key={opp.id}
 opp={opp}
 raw={raw}
 clientId={clientId}
 savedBrief={saved}
 />
 );
 })}
 </div>
 </div>
 ))}
 </div>
 );
}
