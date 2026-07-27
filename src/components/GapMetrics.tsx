"use client";

import type { SerpResult, AIOResult } from "@/types/search";
import type { DomainRank } from "@/lib/serper";

interface Props {
 serp: SerpResult;
 aio: AIOResult;
 serpRankings: DomainRank[];
}

export default function GapMetrics({ serp, aio, serpRankings }: Props) {
 const googleRank = serp.position;
 const clientCitation = aio.citations.find((c) => c.isClient);
 const citationPos = clientCitation?.position ?? null;
 const totalCitations = aio.citations.length;
 const clientCited = aio.clientCited;
 const mentionedInText = aio.mentionedInText;

 const r2cGap = googleRank !== null && citationPos !== null ? googleRank - citationPos : null;
 const competitorsBefore = citationPos !== null ? citationPos - 1 : totalCitations;

 const rankMap = Object.fromEntries(serpRankings.map((r) => [r.domain, r]));
 const top10Citations = aio.citations.slice(0, 10);

 return (
 <div className="rounded-[20px] border border-slate-200 bg-card p-6 space-y-6 shadow-xs font-sans">
 <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
 Rank-to-Citation Gap™
 </h3>

 {/* Summary metric cards */}
 <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
 <MetricCard label="Google Rank" value={googleRank ? `#${googleRank}` : "—"} sub="organic SERP" color="blue" />
 <MetricCard
 label="AIO Citation"
 value={citationPos ? `#${citationPos}` : "—"}
 sub={citationPos ? `of ${totalCitations} sources` : "not cited"}
 color={clientCited ? "amber" : "gray"}
 />
 <MetricCard
 label="R2C Gap"
 value={r2cGap !== null ? (r2cGap > 0 ? `+${r2cGap}` : String(r2cGap)) : "—"}
 sub={r2cGap === null ? "not cited" : r2cGap > 0 ? "AIO favors more" : r2cGap < 0 ? "rank favors more" : "aligned"}
 color={r2cGap === null ? "gray" : r2cGap > 0 ? "green" : r2cGap < 0 ? "red" : "gray"}
 />
 <MetricCard
 label="Ahead of Client"
 value={String(competitorsBefore)}
 sub="citation competitors"
 color={competitorsBefore === 0 ? "green" : competitorsBefore <= 2 ? "amber" : "red"}
 />
 </div>

 {/* Competitor SERP vs AIO table */}
 {top10Citations.length > 0 && (
 <div>
 <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
 Citation vs Google Rank — Top {top10Citations.length}
 {serpRankings.length === 0 && <span className="ml-2 text-slate-400 animate-pulse normal-case font-normal">Fetching rankings...</span>}
 </p>
 <div className="rounded-[20px] border border-slate-200 overflow-hidden">
 {/* Header */}
 <div className="grid grid-cols-12 gap-2 px-4 py-2.5 bg-slate-50 text-xs text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
 <div className="col-span-1 text-center">AIO</div>
 <div className="col-span-5">Source</div>
 <div className="col-span-2 text-center">Google</div>
 <div className="col-span-2 text-center">R2C Gap</div>
 <div className="col-span-2 text-center">Threat</div>
 </div>

 {top10Citations.map((c) => {
 const rank = rankMap[c.domain];
 const gRank = rank?.position ?? null;
 const gap = gRank !== null && c.position !== null ? gRank - c.position : null;

 const threat: "high" | "medium" | "low" | "unknown" =
 gap === null ? "unknown" :
 gap >= 5 ? "high" :
 gap >= 2 ? "medium" :
 "low";

 const threatColors = {
 high: "text-red-700 bg-red-50 border border-red-200",
 medium: "text-amber-700 bg-amber-50 border border-amber-200",
 low: "text-emerald-700 bg-emerald-50 border border-emerald-200",
 unknown: "text-slate-500 bg-slate-100 border border-slate-200",
 };

 const isClient = c.isClient;

 return (
 <div
 key={c.url}
 className={`grid grid-cols-12 gap-2 px-4 py-3 border-b border-slate-100 text-xs items-center ${
 isClient ? "bg-amber-50/60" : "hover:bg-slate-50/80"
 }`}
 >
 {/* AIO position */}
 <div className="col-span-1 flex justify-center">
 <span className={`flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold ${
 isClient ? "bg-amber-500 text-white" : "bg-slate-200 text-slate-700"
 }`}>
 {c.position}
 </span>
 </div>

 {/* Source name */}
 <div className="col-span-5 min-w-0">
 <span className={`font-semibold truncate block ${isClient ? "text-amber-800" : "text-slate-900"}`}>
 {c.sourceName}
 {isClient && <span className="ml-1.5 text-amber-600 text-xs font-bold">★</span>}
 </span>
 <span className="text-slate-400 truncate block text-[11px]">{c.domain}</span>
 </div>

 {/* Google rank */}
 <div className="col-span-2 text-center">
 {serpRankings.length === 0 ? (
 <span className="text-slate-400">—</span>
 ) : gRank ? (
 <span className={`font-bold ${isClient ? "text-blue-700" : "text-slate-600"}`}>
 #{gRank}
 </span>
 ) : (
 <span className="text-slate-400">—</span>
 )}
 </div>

 {/* R2C gap */}
 <div className="col-span-2 text-center">
 {gap !== null ? (
 <span className={`font-bold ${gap > 0 ? "text-emerald-600" : gap < 0 ? "text-red-600" : "text-slate-500"}`}>
 {gap > 0 ? `+${gap}` : gap}
 </span>
 ) : (
 <span className="text-slate-400">—</span>
 )}
 </div>

 {/* Threat level */}
 <div className="col-span-2 flex justify-center">
 {!isClient && (
 <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${threatColors[threat]}`}>
 {threat === "unknown" ? "—" : threat}
 </span>
 )}
 {isClient && (
 <span className="text-amber-700 text-xs font-bold">Client</span>
 )}
 </div>
 </div>
 );
 })}
 </div>

 <p className="mt-2 text-[11px] text-slate-500">
 <span className="text-red-600 font-semibold">High threat</span>: competitor ranks lower in Google organic but wins AI citation.
 </p>
 </div>
 )}

 {/* Interpretation */}
 <div className="rounded-[20px] bg-slate-50 border border-slate-200 p-4">
 <p className="text-xs text-slate-600 leading-relaxed">
 {!clientCited && !mentionedInText && (
 <><span className="text-red-600 font-bold">Silent loss.</span> Client is ranking in Google but invisible in AI Mode.</>
 )}
 {!clientCited && mentionedInText && (
 <><span className="text-blue-600 font-bold">Partial visibility.</span> Brand name appears in the AI answer text but holds no citation link.</>
 )}
 {clientCited && r2cGap !== null && r2cGap > 0 && (
 <><span className="text-emerald-600 font-bold">AIO overperformer.</span> Cited higher in AI Mode than Google organic rank suggests.</>
 )}
 {clientCited && r2cGap !== null && r2cGap < 0 && (
 <><span className="text-amber-600 font-bold">Citation lag.</span> Ranks higher in Google organic than AI position.</>
 )}
 {clientCited && r2cGap === 0 && (
 <><span className="text-emerald-600 font-bold">Perfectly aligned.</span> Google organic rank and AIO citation match.</>
 )}
 {competitorsBefore > 0 && (
 <> <span className="font-bold text-slate-900">{competitorsBefore} competitor{competitorsBefore !== 1 ? "s" : ""}</span> cited before the client.</>
 )}
 </p>
 </div>
 </div>
 );
}

function MetricCard({ label, value, sub, color }: {
 label: string; value: string; sub: string;
 color: "blue" | "amber" | "green" | "red" | "gray";
}) {
 const valueColor = {
 blue: "text-blue-600", amber: "text-amber-600",
 green: "text-emerald-600", red: "text-rose-600", gray: "text-slate-500",
 }[color];

 return (
 <div className="rounded-[20px] bg-slate-50 border border-slate-200 p-3.5">
 <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">{label}</p>
 <p className={`text-xl font-extrabold ${valueColor}`}>{value}</p>
 <p className="text-[11px] text-slate-500 mt-1 leading-tight">{sub}</p>
 </div>
 );
}
