"use client";

import { useState } from "react";
import type { SerpResult, AIOResult, Location } from "@/types/search";
import type { AIOIntelligence } from "@/lib/llm";
import { LOCATIONS, classifyGap, PLATFORM_LABELS } from "@/types/search";
import CitationCard from "@/components/CitationCard";
import GapMetrics from "@/components/GapMetrics";
import type { CitationContent } from "@/app/api/citation-content/route";
import type { DomainRank } from "@/lib/serper";
import { normaliseDomain } from "@/lib/url-input";
import { Search, Zap, Globe, TrendingUp, AlertCircle, CheckCircle, XCircle, Loader2, MapPin } from "lucide-react";

interface Results {
 serp: SerpResult | null;
 aio: AIOResult | null;
 intelligence: AIOIntelligence | null;
}

type CitationMap = Record<string, CitationContent | "loading" | "error">;

const GAP_STYLES: Record<string, { border: string; bg: string; badge: string; dot: string }> = {
 aligned: { border: "border-[#22C55E]/30", bg: "bg-[#22C55E]/5", badge: "bg-[#22C55E]/10 text-[#22C55E]", dot: "bg-[#22C55E]" },
 ai_mentioned: { border: "border-blue-500/30", bg: "bg-blue-500/5", badge: "bg-blue-500/10 text-blue-400", dot: "bg-blue-400" },
 search_strong_ai_invisible:{ border: "border-[#FFD600]/30", bg: "bg-[#FFD600]/5", badge: "bg-[#FFD600]/10 text-[#FFD600]", dot: "bg-[#FFD600]" },
 weak_double_loss: { border: "border-primary/30", bg: "bg-primary/5", badge: "bg-primary/10 text-primary", dot: "bg-primary" },
 geo_invisible: { border: "border-[#FFD600]/30", bg: "bg-[#FFD600]/5", badge: "bg-[#FFD600]/10 text-[#FFD600]", dot: "bg-[#FFD600]" },
 seo_not_ranked: { border: "border-primary/30", bg: "bg-primary/5", badge: "bg-primary/10 text-primary", dot: "bg-primary" },
};

const getGapStyle = (label: string) => GAP_STYLES[label] ?? GAP_STYLES.weak_double_loss;

export default function QuickCheckPage() {
 const [keyword, setKeyword] = useState("");
 const [domain, setDomain] = useState("");
 const [brand, setBrand] = useState("");
 const [location, setLocation] = useState<Location>("ae");
 const [loading, setLoading] = useState(false);
 const [analyzing, setAnalyzing] = useState(false);
 const [error, setError] = useState<string | null>(null);
 const [results, setResults] = useState<Results | null>(null);
 const [citationMap, setCitationMap] = useState<CitationMap>({});
 const [serpRankings, setSerpRankings] = useState<DomainRank[]>([]);

 async function handleSubmit(e: React.FormEvent) {
 e.preventDefault();
 if (!keyword.trim() || !domain.trim()) return;

 const normalisedDomain = normaliseDomain(domain);
 if (!normalisedDomain) {
 setError("Enter a valid domain like example.com");
 return;
 }

 setLoading(true);
 setError(null);
 setResults(null);
 setCitationMap({});
 setSerpRankings([]);

 try {
 const payload = { keyword: keyword.trim(), domain: normalisedDomain.domain, brand: brand.trim(), location };

 const [rankRes, aioRes] = await Promise.all([
 fetch("/api/rank", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }),
 fetch("/api/aio", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }),
 ]);

 if (!rankRes.ok || !aioRes.ok) throw new Error("Failed to fetch results. Please try again.");

 const [serp, aio] = await Promise.all([rankRes.json(), aioRes.json()]);
 setResults({ serp, aio, intelligence: null });
 setLoading(false);

 if (aio?.citations?.length) {
 const top10Domains = aio.citations.slice(0, 10).map((c: { domain: string }) => c.domain);
 fetch("/api/serp-rankings", {
 method: "POST",
 headers: { "Content-Type": "application/json" },
 body: JSON.stringify({ keyword: keyword.trim(), domains: top10Domains, location }),
 })
 .then((r) => r.ok ? r.json() : Promise.reject())
 .then((ranks: DomainRank[]) => setSerpRankings(ranks))
 .catch(() => {});
 }

 if (aio?.citations?.length) {
 const initialMap: CitationMap = {};
 aio.citations.forEach((c: { url: string }) => { initialMap[c.url] = "loading"; });
 setCitationMap(initialMap);

 aio.citations.forEach((c: { url: string; sourceName: string }) => {
 fetch("/api/citation-content", {
 method: "POST",
 headers: { "Content-Type": "application/json" },
 body: JSON.stringify({ url: c.url, analyze: false }),
 })
 .then((r) => r.ok ? r.json() : Promise.reject())
 .then((data: CitationContent) => {
 setCitationMap((prev) => ({ ...prev, [c.url]: data }));
 })
 .catch(() => {
 setCitationMap((prev) => ({ ...prev, [c.url]: "error" }));
 });
 });
 }

 if (aio?.aioPresent && aio?.aioSnippet) {
 setAnalyzing(true);
 try {
 const analyzeRes = await fetch("/api/analyze", {
 method: "POST",
 headers: { "Content-Type": "application/json" },
 body: JSON.stringify({
 keyword: keyword.trim(),
 brand: brand.trim(),
 aioSnippet: aio.aioFullText ?? aio.aioSnippet,
 citedSources: aio.citedDomains,
 }),
 });
 if (analyzeRes.ok) {
 const intelligence = await analyzeRes.json();
 setResults((prev) => prev ? { ...prev, intelligence } : prev);
 }
 } finally {
 setAnalyzing(false);
 }
 }
 } catch (err) {
 setError(err instanceof Error ? err.message : "Something went wrong.");
 } finally {
 setLoading(false);
 }
 }

 const gap = results?.serp && results?.aio ? classifyGap(results.serp, results.aio) : null;
 const gapStyle = gap ? getGapStyle(gap.label) : null;

 return (
    <div className="min-h-[calc(100vh-60px)] bg-background p-3 sm:p-6 font-sans text-foreground">
      <div className="max-w-[1400px] mx-auto bg-card rounded-[20px] p-6 lg:p-8 shadow-2xl border border-border min-h-[calc(100vh-108px)]">

        {/* Page title */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 rounded-[20px] bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
            <Search className="w-4 h-4 text-amber-500" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground tracking-tight">Keyword Intelligence</h1>
            <p className="text-xs text-muted-foreground mt-0.5">Check search rank & AI Mode visibility for any keyword</p>
          </div>
        </div>

        {/* Search form — dark card */}
        <form onSubmit={handleSubmit} className="bg-card border border-border rounded-[20px] p-6 mb-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="block text-[11px] font-bold text-foreground mb-2 uppercase tracking-wider">Keyword</label>
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="e.g. best SEO agency dubai"
                required
                className="w-full bg-background border border-border focus:border-amber-500 rounded-[20px] px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/70 focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-foreground mb-2 uppercase tracking-wider">Domain</label>
              <input
                type="text"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="e.g. unitedseo.ae"
                required
                className={`w-full bg-background border rounded-[20px] px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/70 focus:outline-none transition-colors ${
                  domain.trim() && !normaliseDomain(domain)
                    ? "border-rose-500 focus:border-rose-500"
                    : "border-border focus:border-amber-500"
                }`}
              />
              {domain.trim() && !normaliseDomain(domain) && (
                <p className="mt-1 text-xs text-rose-500">Enter a domain like <span className="font-mono">example.com</span></p>
              )}
            </div>

            <div>
              <label className="block text-[11px] font-bold text-foreground mb-2 uppercase tracking-wider">Brand Name</label>
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="e.g. United SEO"
                className="w-full bg-background border border-border focus:border-amber-500 rounded-[20px] px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/70 focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-foreground mb-2 uppercase tracking-wider">Location</label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value as Location)}
                className="w-full bg-background border border-border focus:border-amber-500 rounded-[20px] px-4 py-2.5 text-sm text-foreground focus:outline-none transition-colors appearance-none font-medium"
              >
                {(Object.entries(LOCATIONS) as [Location, typeof LOCATIONS[Location]][]).map(([key, val]) => (
                  <option key={key} value={key} className="bg-card text-foreground">{val.label}</option>
                ))}
              </select>
            </div>
          </div>

 <div className="mt-5 flex items-center gap-3">
 <button
 type="submit"
 disabled={loading}
 className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold px-6 py-2.5 rounded-full shadow-sm transition-colors"
 >
 {loading ? (
 <><Loader2 className="w-4 h-4 animate-spin" /> Checking…</>
 ) : (
 <><Zap className="w-4 h-4" /> Run Check</>
 )}
 </button>
 {analyzing && (
 <span className="flex items-center gap-1.5 text-xs text-blue-400 animate-pulse">
 <Loader2 className="w-3 h-3 animate-spin" /> Analysing with AI…
 </span>
 )}
 </div>
 </form>

 {/* Error */}
 {error && (
 <div className="flex items-center gap-3 bg-primary/10 border border-primary/30 rounded-[20px] px-5 py-4 mb-6 text-sm text-primary">
 <AlertCircle className="w-4 h-4 shrink-0" />
 {error}
 </div>
 )}

 {/* Empty state */}
 {!results && !loading && !error && (
 <div className="flex flex-col items-center justify-center py-24 text-center">
 <div className="w-16 h-16 rounded-[20px] bg-card border border-border flex items-center justify-center mb-4">
 <Search className="w-7 h-7 text-[#666666]" />
 </div>
 <p className="text-[#666666] text-sm">Enter a keyword and domain above to check search rank & AI Mode visibility</p>
 <div className="grid grid-cols-3 gap-4 mt-10 w-full max-w-lg">
 {[
 { icon: TrendingUp, label: "SERP Position", desc: "Where your client ranks on Google" },
 { icon: Zap, label: "AI Mode", desc: "Is the brand cited in AI answers?" },
 { icon: Globe, label: "Citations", desc: "Who's being cited instead?" },
 ].map(({ icon: Icon, label, desc }) => (
 <div key={label} className="bg-card border border-border rounded-[20px] p-4 text-left">
 <Icon className="w-5 h-5 text-primary mb-2" />
 <p className="text-xs font-semibold text-foreground mb-1">{label}</p>
 <p className="text-[11px] text-[#666666] leading-snug">{desc}</p>
 </div>
 ))}
 </div>
 </div>
 )}

 {/* Results */}
 {results?.serp && results?.aio && gap && gapStyle && (
 <div className="space-y-5">

 {/* Gap classification banner */}
 <div className={`rounded-[20px] border ${gapStyle.border} ${gapStyle.bg} px-6 py-4 flex items-center gap-4`}>
 <div className={`w-3 h-3 rounded-full shrink-0 ${gapStyle.dot}`} />
 <div>
 <p className="text-base font-semibold text-foreground">{gap.title}</p>
 <p className="text-sm text-[#666666] mt-0.5">{gap.description}</p>
 </div>
 <span className={`ml-auto text-xs font-semibold px-3 py-1 rounded-full ${gapStyle.badge}`}>
 {gap.label.replace(/_/g, " ")}
 </span>
 </div>

 {/* SERP + AIO side by side */}
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
 {/* SERP card */}
 <div className="bg-card border border-border rounded-[20px] p-6 space-y-4">
 <div className="flex items-center justify-between">
 <h3 className="text-[11px] font-medium text-[#666666] uppercase tracking-wider">Google Ranking</h3>
 <TrendingUp className="w-4 h-4 text-[#666666]" />
 </div>

 {results.serp.position ? (
 <div className="flex items-baseline gap-3">
 <span className="text-5xl font-bold text-foreground tracking-tight">#{results.serp.position}</span>
 <span className="text-sm text-[#666666]">your client</span>
 </div>
 ) : (
 <div className="flex items-center gap-2">
 <XCircle className="w-5 h-5 text-primary" />
 <p className="text-sm text-[#666666]">Not found in top 100 results</p>
 </div>
 )}

 {results.serp.organicResults.length > 0 && (
 <div className="space-y-1.5 pt-1">
 {results.serp.organicResults.map((r) => (
 <div
 key={r.url}
 className={`flex items-start gap-3 rounded-[20px] px-3 py-2 ${
 r.isClient ? "bg-primary/10 border border-border" : "bg-card"
 }`}
 >
 <span className={`shrink-0 mt-0.5 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
 r.isClient ? "bg-primary text-foreground" : "bg-[#F5F5F3] text-[#666666]"
 }`}>
 {r.position}
 </span>
 <div className="min-w-0">
 <p className={`text-xs font-medium truncate ${r.isClient ? "text-primary" : "text-foreground"}`}>{r.title}</p>
 <p className="text-[11px] text-[#666666] truncate">{r.domain}</p>
 </div>
 </div>
 ))}
 </div>
 )}

 {results.serp.serpFeatures.length > 0 && (
 <div>
 <p className="text-[11px] text-[#666666] mb-2">SERP Features</p>
 <div className="flex flex-wrap gap-1.5">
 {results.serp.serpFeatures.map((f) => (
 <span key={f} className="rounded-full bg-card border border-border px-2 py-0.5 text-[11px] text-[#666666]">
 {f.replace(/_/g, " ")}
 </span>
 ))}
 </div>
 </div>
 )}
 </div>

 {/* AIO card */}
 <div className="bg-card border border-border rounded-[20px] p-6 space-y-4">
 <div className="flex items-center justify-between">
 <h3 className="text-[11px] font-medium text-[#666666] uppercase tracking-wider">AI Mode</h3>
 <Zap className="w-4 h-4 text-[#666666]" />
 </div>

 <div className="flex items-center gap-2">
 <span className={`w-2.5 h-2.5 rounded-full ${results.aio.aioPresent ? "bg-primary" : "bg-gray-600"}`} />
 <span className="text-sm font-medium text-foreground">
 {results.aio.aioPresent ? "AI Mode triggered" : "No AI Mode for this query"}
 </span>
 </div>

 {results.aio.aioPresent && (
 <div className="flex flex-wrap gap-2">
 <span className={`text-xs font-medium px-3 py-1 rounded-full border ${
 results.aio.clientCited
 ? "bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/30"
 : "bg-card text-[#666666] border-border"
 }`}>
 {results.aio.clientCited ? "✓ Cited as source" : "✗ Not a cited source"}
 </span>
 <span className={`text-xs font-medium px-3 py-1 rounded-full border ${
 results.aio.mentionedInText
 ? "bg-blue-500/10 text-blue-400 border-blue-500/30"
 : "bg-card text-[#666666] border-border"
 }`}>
 {results.aio.mentionedInText ? "✓ Mentioned in text" : "✗ Not mentioned in text"}
 </span>
 </div>
 )}

 {results.aio.aioBlocks.length > 0 && (
 <div className="space-y-2">
 <p className="text-[11px] text-[#666666] uppercase tracking-wider">AI Answer Preview</p>
 {results.aio.aioBlocks.map((block, i) => (
 block.type === "paragraph" ? (
 <p key={i} className="text-xs text-[#666666] leading-relaxed">{block.snippet}</p>
 ) : block.type === "list" && block.list ? (
 <ul key={i} className="space-y-1">
 {block.list.map((item, j) => (
 <li key={j} className="flex gap-2 text-xs text-[#666666]">
 <span className="text-primary shrink-0">•</span>
 <span>{item.snippet}</span>
 </li>
 ))}
 </ul>
 ) : null
 ))}
 </div>
 )}

 {/* AI Intelligence */}
 {results.intelligence && (
 <div className="space-y-3 pt-2 border-t border-border">
 <div className="bg-primary/10 border border-border rounded-[20px] px-4 py-3">
 <p className="text-[11px] text-primary font-medium mb-1 uppercase tracking-wider">Insight</p>
 <p className="text-xs text-foreground leading-relaxed">{results.intelligence.insight}</p>
 </div>
 <div className="bg-card rounded-[20px] px-4 py-3">
 <p className="text-[11px] text-[#666666] font-medium mb-1 uppercase tracking-wider">Recommended Action</p>
 <p className="text-xs text-[#666666] leading-relaxed">{results.intelligence.recommendedAction}</p>
 </div>
 <div className="flex flex-wrap gap-2">
 {results.intelligence.brandMentioned !== undefined && (
 <span className={`text-[11px] px-2.5 py-1 rounded-full border ${
 results.intelligence.brandMentioned
 ? "bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/30"
 : "bg-card text-[#666666] border-border"
 }`}>
 {results.intelligence.brandMentioned ? "✓ Brand mentioned" : "✗ Brand not mentioned"}
 </span>
 )}
 </div>
 </div>
 )}

 {analyzing && !results.intelligence && (
 <div className="space-y-2 pt-2">
 {[...Array(3)].map((_, i) => (
 <div key={i} className="h-3 rounded-full bg-[#F5F5F3] animate-pulse" style={{ width: `${70 + i * 10}%` }} />
 ))}
 </div>
 )}
 </div>
 </div>

 {/* Gap Metrics */}
 {results.aio.aioPresent && (
 <GapMetrics serp={results.serp} aio={results.aio} serpRankings={serpRankings} />
 )}

 {/* Citations */}
 {results.aio.aioPresent && results.aio.citations.length > 0 && (
 <div className="bg-card border border-border rounded-[20px] p-6">
 <div className="flex items-center justify-between mb-4">
 <h3 className="text-[11px] font-medium text-[#666666] uppercase tracking-wider">AI Mode Citations</h3>
 <span className="text-xs text-[#666666]">{results.aio.citations.length} sources cited</span>
 </div>
 <div className="space-y-2">
 {results.aio.citations.map((c) => {
 const cData = citationMap[c.url];
 return (
 <CitationCard
 key={c.url}
 citation={c}
 keyword={keyword}
 clientBrand={brand || domain}
 preloaded={cData instanceof Object && cData !== null && typeof cData !== "string" ? cData as CitationContent : null}
 loadingPreload={cData === "loading"}
 />
 );
 })}
 </div>
 {!results.aio.clientCited && (
 <div className="mt-4 bg-primary/10 border border-border rounded-[20px] px-4 py-3">
 <p className="text-xs text-primary">
 <span className="font-semibold">{results.aio.citations.length} competitor{results.aio.citations.length !== 1 ? "s" : ""}</span> are cited while your client is not.
 {results.aio.mentionedInText && " The brand is mentioned in the answer text but holds no source link."}
 </p>
 </div>
 )}
 </div>
 )}
 </div>
 )}

 </div>
 </div>
 );
}
