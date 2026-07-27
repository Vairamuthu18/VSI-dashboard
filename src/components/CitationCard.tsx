"use client";

import { useState } from "react";
import type { AIOCitation } from "@/types/search";
import { PLATFORM_LABELS } from "@/types/search";
import type { CitationContent } from "@/app/api/citation-content/route";
import type { CitationIntelligence } from "@/lib/llm";

interface Props {
 citation: AIOCitation;
 keyword: string;
 clientBrand: string;
 preloaded?: CitationContent | null;
 loadingPreload?: boolean;
}

export default function CitationCard({ citation, keyword, clientBrand, preloaded, loadingPreload }: Props) {
 const [expanded, setExpanded] = useState(false);
 const [intelligence, setIntelligence] = useState<CitationIntelligence | null>(null);
 const [analyzing, setAnalyzing] = useState(false);

 const data = preloaded;

 async function runAnalysis() {
 if (analyzing || intelligence) return;
 setAnalyzing(true);
 try {
 const res = await fetch("/api/citation-content", {
 method: "POST",
 headers: { "Content-Type": "application/json" },
 body: JSON.stringify({
 url: citation.url,
 keyword,
 sourceName: citation.sourceName,
 clientBrand,
 analyze: true,
 }),
 });
 if (res.ok) {
 const result: CitationContent = await res.json();
 setIntelligence(result.intelligence);
 }
 } finally {
 setAnalyzing(false);
 }
 }

 const intel = intelligence ?? data?.intelligence ?? null;

 return (
 <div className={`rounded-[20px] border transition-all ${
 citation.isClient
 ? "border-amber-300 bg-amber-50/50 shadow-xs"
 : "border-slate-200 bg-card shadow-xs hover:border-slate-300"
 }`}>
 {/* Header row */}
 <div className="flex items-start gap-3 px-4 py-3.5">
 <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
 citation.isClient ? "bg-amber-500 text-white" : "bg-slate-200 text-slate-700"
 }`}>
 {citation.position}
 </span>

 <div className="min-w-0 flex-1">
 <div className="flex items-center gap-2 flex-wrap">
 <span className={`text-xs font-bold ${citation.isClient ? "text-amber-900" : "text-slate-900"}`}>
 {citation.sourceName}
 </span>
 {citation.isClient && (
 <span className="rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">
 Your Client
 </span>
 )}
 {!citation.isClient && citation.platform !== "other" && citation.platform !== "brand" && (
 <span className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${PLATFORM_LABELS[citation.platform].color}`}>
 {PLATFORM_LABELS[citation.platform].label}
 </span>
 )}
 {loadingPreload && (
 <span className="text-[11px] text-slate-400 animate-pulse">Reading content...</span>
 )}
 {data && !loadingPreload && (
 <span className="text-[11px] text-slate-400">{data.wordCount.toLocaleString()} words</span>
 )}
 </div>
 {citation.title && (
 <p className="mt-0.5 text-xs text-slate-500 truncate">{citation.title}</p>
 )}
 <p className="mt-0.5 text-[11px] font-mono text-slate-400 truncate">{citation.domain}</p>
 </div>

 <div className="flex items-center gap-2 shrink-0">
 <a href={citation.url} target="_blank" rel="noopener noreferrer"
 className="text-xs font-bold text-slate-400 hover:text-blue-600 transition-colors" title="Open in new tab">
 ↗
 </a>
 {(data || loadingPreload) && (
 <button
 onClick={() => setExpanded((v) => !v)}
 className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
 expanded ? "bg-slate-200 text-slate-700"
 : citation.isClient
 ? "bg-amber-200/80 text-amber-900 hover:bg-amber-300"
 : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
 }`}
 >
 {expanded ? "Hide" : "View"}
 </button>
 )}
 </div>
 </div>

 {/* Expandable panel */}
 {expanded && data && (
 <div className="border-t border-slate-200 px-4 pb-4 pt-4 space-y-4 bg-slate-50/50 rounded-b-xl">

 {/* Intelligence panel */}
 {intel ? (
 <div className="space-y-3">
 <div className={`rounded-[20px] px-4 py-3 border ${
 citation.isClient ? "bg-amber-50 border-amber-200" : "bg-card border-slate-200 shadow-xs"
 }`}>
 <div className="flex items-start justify-between gap-3">
 <p className="text-xs text-slate-800 leading-relaxed font-medium">{intel.summary}</p>
 {intel.citabilityScore > 0 && (
 <div className="shrink-0 text-center">
 <div className={`text-base font-extrabold ${
 intel.citabilityScore >= 7 ? "text-rose-600" :
 intel.citabilityScore >= 4 ? "text-amber-600" : "text-emerald-600"
 }`}>{intel.citabilityScore}/10</div>
 <div className="text-[10px] text-slate-400 uppercase font-bold">Citability</div>
 </div>
 )}
 </div>
 </div>

 <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
 {intel.whyCited.length > 0 && (
 <div className="rounded-[20px] bg-card border border-slate-200 p-3 shadow-xs">
 <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Why Google cited this</p>
 <ul className="space-y-1">
 {intel.whyCited.map((r, i) => (
 <li key={i} className="flex gap-2 text-xs text-slate-600">
 <span className="text-emerald-600 shrink-0 font-bold">✓</span><span>{r}</span>
 </li>
 ))}
 </ul>
 </div>
 )}

 {intel.contentSignals.length > 0 && (
 <div className="rounded-[20px] bg-card border border-slate-200 p-3 shadow-xs">
 <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Authority signals</p>
 <div className="flex flex-wrap gap-1">
 {intel.contentSignals.map((s, i) => (
 <span key={i} className="rounded-full bg-blue-50 border border-blue-200 px-2 py-0.5 text-[11px] text-blue-700 font-medium">{s}</span>
 ))}
 </div>
 </div>
 )}

 {intel.keyTopics.length > 0 && (
 <div className="rounded-[20px] bg-card border border-slate-200 p-3 shadow-xs">
 <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Topics covered</p>
 <div className="flex flex-wrap gap-1">
 {intel.keyTopics.map((t, i) => (
 <span key={i} className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-600">{t}</span>
 ))}
 </div>
 </div>
 )}

 {intel.missingFromClient.length > 0 && (
 <div className="rounded-[20px] bg-rose-50 border border-rose-200 p-3">
 <p className="text-[10px] font-bold text-rose-700 uppercase tracking-wider mb-2">
 What {clientBrand || "your client"} is missing
 </p>
 <ul className="space-y-1">
 {intel.missingFromClient.map((g, i) => (
 <li key={i} className="flex gap-2 text-xs text-rose-700">
 <span className="shrink-0 font-bold">✗</span><span>{g}</span>
 </li>
 ))}
 </ul>
 </div>
 )}
 </div>
 </div>
 ) : (
 <button
 onClick={runAnalysis}
 disabled={analyzing}
 className="w-full rounded-[20px] border border-dashed border-blue-300 bg-blue-50/50 px-4 py-3 text-xs font-semibold text-blue-700 hover:bg-blue-50 disabled:opacity-50 transition-colors"
 >
 {analyzing ? (
 <span className="animate-pulse">Running citation analysis...</span>
 ) : (
 "Analyse why Google cited this page"
 )}
 </button>
 )}

 {/* Page content */}
 <div>
 <div className="flex items-center justify-between mb-1">
 <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Page Content Extract</p>
 <span className="text-[11px] text-slate-400">{data.wordCount.toLocaleString()} words</span>
 </div>
 {data.description && (
 <p className="mb-2 text-xs text-slate-500 italic">{data.description}</p>
 )}
 <div className="rounded-lg bg-card border border-slate-200 px-3 py-2.5 max-h-48 overflow-y-auto">
 <pre className="text-[11px] text-slate-600 leading-relaxed whitespace-pre-wrap font-sans">{data.markdown}</pre>
 </div>
 </div>
 </div>
 )}
 </div>
 );
}
