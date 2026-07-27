"use client";

import type { AIOCitation, OrganicResult } from "@/types/search";
import { PLATFORM_LABELS } from "@/types/search";
import { GAP_CLASSIFICATIONS } from "@/types/search";
import type { GapLabel } from "@/types/search";
import StatusDot from "@/components/ui/StatusDot";

interface Props {
 keyword: string;
 gapLabel: string;
 rankPosition: number | null;
 rankUrl: string | null;
 rankTitle: string | null;
 aioPresent: boolean | null;
 aioFullText: string | null;
 aioSnippet: string | null;
 clientCited: boolean | null;
 mentionedInText: boolean | null;
 citations: AIOCitation[];
 citedDomains?: string[];
 serpResults: OrganicResult[];
 clientDomain: string;
 clientBrand: string;
 aiOverviewPresent?: boolean | null;
 aiOverviewFullText?: string | null;
 aiOverviewCitations?: AIOCitation[];
 aiOverviewClientCited?: boolean | null;
}

const GAP_COLORS: Record<string, string> = {
 aligned: "text-emerald-700",
 aligned_no_mention: "text-blue-700",
 ai_mentioned: "text-blue-700",
 search_strong_ai_invisible: "text-amber-700",
 weak_double_loss: "text-rose-700",
 geo_cited: "text-emerald-700",
 geo_cited_no_mention: "text-blue-700",
 geo_mentioned: "text-blue-700",
 geo_invisible: "text-amber-700",
 geo_no_aio: "text-slate-500",
 seo_ranked: "text-emerald-700",
 seo_ranked_no_aio: "text-emerald-700",
 seo_not_ranked: "text-rose-700",
};

function normaliseHost(input: string | null | undefined): string {
 if (!input) return "";
 const s = input
 .toLowerCase()
 .replace(/^[a-z]+:\/+/, "")
 .replace(/^www\./, "")
 .split(/[\/?#]/)[0]
 .replace(/:\d+$/, "");
 return s.includes(".") ? s : "";
}
function matchesClientHost(rowHost: string, clientHost: string): boolean {
 if (!rowHost || !clientHost) return false;
 return rowHost === clientHost
 || rowHost.endsWith(`.${clientHost}`)
 || clientHost.endsWith(`.${rowHost}`);
}

export default function KeywordIntelligenceView({
 keyword, gapLabel, rankPosition, rankUrl, rankTitle,
 aioPresent, aioFullText, aioSnippet, clientCited, mentionedInText,
 citations, citedDomains = [], serpResults, clientDomain, clientBrand,
 aiOverviewPresent, aiOverviewFullText, aiOverviewCitations = [], aiOverviewClientCited,
}: Props) {
 const gapInfo = GAP_CLASSIFICATIONS[gapLabel as GapLabel];
 const gapColor = GAP_COLORS[gapLabel] ?? "text-slate-500";
 const displayText = aioFullText ?? aioSnippet;
 const clientHost = normaliseHost(clientDomain);
 const isClientHost = (host: string | null | undefined): boolean =>
 matchesClientHost(normaliseHost(host), clientHost);

 const hasRichCitations = citations.length > 0;
 const hasAnyCitations = hasRichCitations || citedDomains.length > 0;
 const needsRerun = aioPresent && !displayText && !hasAnyCitations;

 const showProvisional = needsRerun;

 return (
 <div className="space-y-5 mt-4 pt-4 border-t border-slate-200 font-sans">
 {/* Gap status banner */}
 {showProvisional ? (
 <div className="flex items-start gap-2.5 bg-slate-50 p-3.5 rounded-[20px] border border-slate-200">
 <span className="mt-1"><StatusDot color="gray" size="md" /></span>
 <div>
 <span className="text-xs font-bold text-slate-800">
 AI Mode present — content pending
 </span>
 <p className="text-xs text-slate-500 mt-0.5">
 An AI Mode was triggered for this query. Content extraction is queued — re-run to fetch.
 </p>
 </div>
 </div>
 ) : (
 <div className="flex items-start gap-2.5 bg-slate-50/80 p-3.5 rounded-[20px] border border-slate-200">
 {gapInfo && <span className="mt-1"><StatusDot color={gapInfo.dot} size="md" /></span>}
 <div>
 <span className={`text-xs font-bold ${gapColor}`}>
 {gapInfo?.title ?? gapLabel.replace(/_/g, " ")}
 </span>
 {gapInfo?.description && (
 <p className="text-xs text-slate-500 mt-0.5">{gapInfo.description}</p>
 )}
 </div>
 </div>
 )}

 <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">

 {/* SERP Results Panel */}
 <div className="space-y-2.5">
 <div className="flex items-center justify-between">
 <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
 Google SERP — Top {serpResults.length}
 </p>
 {rankPosition && (
 <span className="text-xs text-blue-700 font-bold bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
 Your Client: #{rankPosition}
 </span>
 )}
 </div>

 {serpResults.length === 0 ? (
 <p className="text-xs text-slate-400 italic py-4">No SERP data — re-run to capture</p>
 ) : (
 <div className="space-y-1.5">
 {serpResults.map((r, i) => {
 const isClient = isClientHost(r.domain);
 return (
 <a
 key={i}
 href={r.url}
 target="_blank"
 rel="noopener noreferrer"
 className={`flex items-start gap-2.5 rounded-[20px] px-3 py-2.5 border transition-all ${
 isClient
 ? "bg-amber-50 border-amber-300 hover:bg-amber-100/60 shadow-xs"
 : "bg-card border-slate-200 hover:bg-slate-50"
 }`}
 >
 <span className={`shrink-0 flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold mt-0.5 ${
 isClient ? "bg-amber-500 text-white" : "bg-slate-200 text-slate-700"
 }`}>
 {r.position}
 </span>
 <div className="min-w-0 flex-1">
 <div className="flex items-center gap-1.5 flex-wrap">
 <p className={`text-xs font-bold truncate ${isClient ? "text-amber-900" : "text-slate-900"}`}>
 {r.title}
 </p>
 {!isClient && r.platform !== "other" && r.platform !== "brand" && (
 <span className={`shrink-0 rounded px-1 py-0.5 text-[10px] font-semibold ${PLATFORM_LABELS[r.platform].color}`}>
 {PLATFORM_LABELS[r.platform].label}
 </span>
 )}
 {isClient && (
 <span className="shrink-0 text-[10px] font-bold text-amber-700 uppercase bg-amber-200/60 px-1.5 py-0.5 rounded">★ Client</span>
 )}
 </div>
 <p className="text-[11px] font-mono text-slate-400 truncate">{r.domain} →</p>
 </div>
 </a>
 );
 })}
 </div>
 )}
 </div>

 {/* AIO Panel */}
 <div className="space-y-3">
 <div className="flex items-center gap-2">
 <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">AI Mode Surface</p>
 <span className={`h-2 w-2 rounded-full ${aioPresent ? "bg-amber-500" : "bg-slate-300"}`} />
 <span className="text-xs font-semibold text-slate-600">{aioPresent ? "Triggered" : "Not triggered"}</span>
 </div>

 {aioPresent ? (
 <>
 {/* Client signals */}
 <div className="flex flex-wrap gap-2">
 <span className={`rounded-full px-3 py-1 text-xs font-bold ${clientCited ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-slate-100 text-slate-500 border border-slate-200"}`}>
 {clientCited ? "✓ Cited as source" : "✗ Not cited"}
 </span>
 <span className={`rounded-full px-3 py-1 text-xs font-bold ${mentionedInText ? "bg-blue-50 text-blue-700 border border-blue-200" : "bg-slate-100 text-slate-500 border border-slate-200"}`}>
 {mentionedInText ? "✓ Mentioned in text" : "✗ Not mentioned"}
 </span>
 </div>

 {/* AIO Answer */}
 {displayText && (
 <div className="rounded-[20px] bg-card border border-slate-200 p-4 shadow-xs">
 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">AI Mode Answer</p>
 <div className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap max-h-72 overflow-y-auto pr-1 font-sans">
 {displayText}
 </div>
 </div>
 )}

 {/* Citations */}
 <div>
 <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
 AIO Citations ({hasRichCitations ? citations.length : citedDomains.length})
 </p>
 {!hasAnyCitations ? (
 <p className="text-xs text-slate-400 italic">No citation sources logged</p>
 ) : hasRichCitations ? (
 <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
 {citations.map((c, i) => {
 const isClient = isClientHost(c.domain);
 return (
 <a
 key={i}
 href={c.url}
 target="_blank"
 rel="noopener noreferrer"
 className={`flex items-start gap-2.5 rounded-[20px] px-3 py-2 border transition-all ${
 isClient
 ? "bg-amber-50 border-amber-300 hover:bg-amber-100/60 shadow-xs"
 : "bg-card border-slate-200 hover:bg-slate-50"
 }`}
 >
 <span className={`shrink-0 flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold mt-0.5 ${
 isClient ? "bg-amber-500 text-white" : "bg-slate-200 text-slate-700"
 }`}>
 {c.position}
 </span>
 <div className="min-w-0 flex-1">
 <div className="flex items-center gap-1.5 flex-wrap">
 <p className={`text-xs font-bold ${isClient ? "text-amber-900" : "text-slate-900"}`}>
 {c.sourceName}
 </p>
 {isClient && <span className="text-[10px] font-bold text-amber-700 uppercase bg-amber-200/60 px-1.5 py-0.5 rounded">★ Client</span>}
 </div>
 <p className="text-[11px] font-mono text-slate-400 truncate">{c.domain} →</p>
 </div>
 </a>
 );
 })}
 </div>
 ) : (
 <div className="space-y-1">
 {citedDomains.map((domain, i) => (
 <div key={i} className="text-xs text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
 {i + 1}. {domain}
 </div>
 ))}
 </div>
 )}
 </div>
 </>
 ) : (
 <div className="rounded-[20px] bg-slate-50 border border-slate-200 p-5 text-center">
 <p className="text-xs text-slate-500 font-medium">No AI Mode for this query</p>
 <p className="text-[11px] text-slate-400 mt-0.5">Google served traditional organic SERP results</p>
 </div>
 )}
 </div>
 </div>
 </div>
 );
}
