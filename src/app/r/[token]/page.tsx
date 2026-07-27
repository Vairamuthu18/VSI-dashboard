import { notFound } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import type { ReportContent, KeywordRow } from "@/lib/report-builder";
import type { KeywordReportContent } from "@/lib/keyword-report-builder";
import PrintButton from "@/components/PrintButton";
import KeywordReportView from "@/components/KeywordReportView";

export const dynamic = "force-dynamic";

const GAP_LABELS: Record<string, string> = {
 aligned: "Aligned",
 aligned_no_mention: "Ranking & Cited, Unnamed",
 ai_mentioned: "AI Mentioned",
 search_strong_ai_invisible: "AI Invisible",
 weak_double_loss: "Double Loss",
 geo_cited: "AI Mode Cited & Named",
 geo_cited_no_mention: "AI Mode Cited, Unnamed",
 geo_mentioned: "AI Mode Mentioned",
 geo_invisible: "AI Mode Invisible",
 geo_no_aio: "No AI Trigger",
 seo_ranked: "Ranked",
 seo_ranked_no_aio: "Ranked, No AI",
 seo_not_ranked: "Not Ranked",
};

const HERO_TONE: Record<string, { ring: string; text: string }> = {
 good: { ring: "ring-green-200", text: "text-green-700" },
 bad: { ring: "ring-red-200", text: "text-red-700" },
 neutral: { ring: "ring-amber-200", text: "text-amber-700" },
};

function shortDate(d: string | Date) {
 return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export default async function PublicReportPage({ params }: { params: Promise<{ token: string }> }) {
 const { token } = await params;
 const supabase = await createClient();
 const { data: row, error } = await supabase
 .from("reports")
 .select("id, type, status, generated_at, expires_at, content")
 .eq("share_token", token)
 .maybeSingle();

 if (error) {
 console.error("[/r/:token] supabase error:", error);
 notFound();
 }
 if (!row) notFound();
 if (row.expires_at && new Date(row.expires_at) < new Date()) notFound();

 // Reports that haven't finished generating shouldn't render the report
 // shell. A small placeholder is friendlier than a 404.
 if (row.status === "pending") {
 return (
 <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6">
 <div className="max-w-md text-center">
 <div className="mx-auto mb-4 h-10 w-10 rounded-full border-4 border-amber-200 border-t-amber-500 animate-spin" />
 <h1 className="text-lg font-semibold text-gray-900">Generating your report…</h1>
 <p className="text-sm text-gray-500 mt-1">This page refreshes automatically. Usually under a minute.</p>
 </div>
 <meta httpEquiv="refresh" content="5" />
 </div>
 );
 }
 if (row.status === "failed") {
 return (
 <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6">
 <div className="max-w-md text-center">
 <h1 className="text-lg font-semibold text-gray-900">Report could not be generated</h1>
 <p className="text-sm text-gray-500 mt-2">Open VSI and try generating it again.</p>
 </div>
 </div>
 );
 }

 // New per-keyword report types branch into a dedicated view.
 if (row.type === "keyword_summary" || row.type === "keyword_detailed" || row.type === "keyword_tasks") {
 const kwContent = row.content as KeywordReportContent | null;
 if (!kwContent || kwContent.schema !== "vsi-keyword-report-v1") {
 console.error("[/r/:token] malformed keyword report content", token);
 notFound();
 }
 return <KeywordReportView content={kwContent} />;
 }

 const raw = row.content as Partial<ReportContent> | null;
 if (!raw || !raw.branding || !raw.client || !Array.isArray(raw.hero)) {
 console.error("[/r/:token] malformed content for token", token, raw);
 notFound();
 }

 const c: ReportContent = {
 schema: raw.schema ?? "vsi-report-v1",
 generatedAt: raw.generatedAt ?? row.generated_at ?? new Date().toISOString(),
 rangeLabel: raw.rangeLabel ?? "",
 branding: {
 displayName: raw.branding!.displayName ?? "Search Intelligence",
 logoUrl: raw.branding!.logoUrl ?? null,
 primaryColor: raw.branding!.primaryColor ?? "#F59E0B",
 supportEmail: raw.branding!.supportEmail ?? null,
 footer: raw.branding!.footer ?? null,
 },
 client: raw.client!,
 hero: raw.hero ?? [],
 wins: raw.wins ?? [],
 losses: raw.losses ?? [],
 opportunities: raw.opportunities ?? [],
 totalKeywords: raw.totalKeywords ?? 0,
 };
 const color = c.branding.primaryColor;

 return (
 <div className="min-h-screen bg-gray-100 text-gray-900">
 <style>{`
 @media print {
 @page { size: A4; margin: 14mm; }
 .no-print { display: none !important; }
 body { background: white !important; }
 .print-page { background: white !important; box-shadow: none !important; padding: 0 !important; }
 .avoid-break { page-break-inside: avoid; }
 }
 `}</style>

 {/* Sticky print bar */}
 <div className="no-print sticky top-0 z-20 bg-card border-b border-gray-200">
 <div className="max-w-4xl mx-auto px-6 py-3 flex items-center justify-between">
 <p className="text-xs text-gray-500">
 Confidential · Generated {shortDate(c.generatedAt)}
 </p>
 <PrintButton color={color} />
 </div>
 </div>

 {/* The actual "paper" */}
 <div className="max-w-4xl mx-auto my-6 print:my-0">
 <div className="print-page bg-card rounded-[20px] shadow-sm border border-gray-200 overflow-hidden">

 {/* HEADER — full-bleed brand bar */}
 <div
 className="relative px-8 sm:px-12 pt-10 pb-8 print:py-6"
 style={{
 background: `linear-gradient(135deg, ${color}10 0%, ${color}05 50%, transparent 100%)`,
 borderBottom: `3px solid ${color}`,
 }}
 >
 <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
 <div className="flex items-center gap-4 min-w-0">
 {c.branding.logoUrl ? (
 <div className="h-16 w-16 rounded-[20px] bg-card border border-gray-200 p-2 shadow-sm shrink-0 flex items-center justify-center">
 <Image
 src={c.branding.logoUrl}
 alt={c.branding.displayName}
 width={56}
 height={56}
 className="object-contain max-h-12"
 unoptimized
 />
 </div>
 ) : (
 <div
 className="h-16 w-16 rounded-[20px] flex items-center justify-center text-white font-bold text-xl shrink-0"
 style={{ backgroundColor: color }}
 >
 {c.branding.displayName.charAt(0).toUpperCase()}
 </div>
 )}
 <div className="min-w-0">
 <p className="text-[11px] font-bold uppercase tracking-[0.18em]" style={{ color }}>
 {c.branding.displayName}
 </p>
 <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1 leading-tight">
 Search Visibility Report
 </h1>
 <p className="text-sm text-gray-600 mt-1">{c.rangeLabel}</p>
 </div>
 </div>
 <div className="text-left sm:text-right shrink-0 border-l-0 sm:border-l border-gray-200 sm:pl-6">
 <p className="text-[11px] uppercase tracking-wider text-gray-500 font-medium">Prepared for</p>
 <p className="text-lg font-bold text-gray-900 mt-0.5">{c.client.name}</p>
 {c.client.website && (
 <p className="text-xs text-gray-500 mt-0.5">{c.client.website}</p>
 )}
 </div>
 </div>
 </div>

 {/* HERO METRICS */}
 <section className="px-8 sm:px-12 pt-8 avoid-break">
 <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
 {c.hero.map((m, i) => {
 const tone = m.tone ? HERO_TONE[m.tone] : null;
 return (
 <div
 key={i}
 className={`rounded-[20px] bg-card p-5 ring-1 ${tone?.ring ?? "ring-gray-200"}`}
 >
 <p className="text-[11px] uppercase tracking-wider text-gray-500 font-semibold">
 {m.label}
 </p>
 <p className={`text-3xl font-bold mt-2 ${tone?.text ?? "text-gray-900"}`}>
 {m.value}
 </p>
 {m.sub && (
 <p className="text-xs text-gray-500 mt-1 leading-relaxed">{m.sub}</p>
 )}
 </div>
 );
 })}
 </div>
 </section>

 {/* CONTENT SECTIONS */}
 <div className="px-8 sm:px-12 py-8 space-y-10">

 {c.wins.length > 0 && (
 <Section
 title="Wins this period"
 subtitle="Keywords that improved in rank or gained AI Mode citations"
 accent="#16a34a"
 badge={`+${c.wins.length}`}
 badgeBg="bg-green-100"
 badgeText="text-green-700"
 >
 <KeywordTable rows={c.wins} showDelta highlightDelta="good" />
 </Section>
 )}

 {c.losses.length > 0 && (
 <Section
 title="Where we lost ground"
 subtitle="Keywords that dropped in rank or lost citations vs last week"
 accent="#dc2626"
 badge={`-${c.losses.length}`}
 badgeBg="bg-red-100"
 badgeText="text-red-700"
 >
 <KeywordTable rows={c.losses} showDelta highlightDelta="bad" />
 </Section>
 )}

 {c.opportunities.length > 0 && (
 <Section
 title="Opportunities to capture"
 subtitle="Competitors are visible here but you aren't — each is a content investment with a known target"
 accent={color}
 badge={String(c.opportunities.length)}
 badgeBg="bg-amber-100"
 badgeText="text-amber-800"
 >
 <KeywordTable rows={c.opportunities} showDelta={false} />
 </Section>
 )}

 {c.wins.length === 0 && c.losses.length === 0 && c.opportunities.length === 0 && (
 <div className="rounded-[20px] border border-dashed border-gray-300 p-10 text-center">
 <p className="text-sm text-gray-500">No comparable changes this period.</p>
 <p className="text-xs text-gray-400 mt-1">
 Run more snapshots over the next 7 days and this section will populate with concrete wins and opportunities.
 </p>
 </div>
 )}
 </div>

 {/* FOOTER */}
 <footer className="px-8 sm:px-12 py-6 border-t border-gray-200 bg-gray-50">
 <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
 <div>
 <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">
 {c.branding.displayName}
 </p>
 {c.branding.footer && (
 <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-wrap mt-1.5 max-w-xl">
 {c.branding.footer}
 </p>
 )}
 </div>
 {c.branding.supportEmail && (
 <a
 href={`mailto:${c.branding.supportEmail}`}
 className="text-xs text-gray-600 hover:underline shrink-0"
 style={{ color }}
 >
 {c.branding.supportEmail}
 </a>
 )}
 </div>
 </footer>
 </div>
 </div>
 </div>
 );
}

// ── Components ───────────────────────────────────────────────────

function Section({
 title,
 subtitle,
 accent,
 badge,
 badgeBg,
 badgeText,
 children,
}: {
 title: string;
 subtitle?: string;
 accent: string;
 badge?: string;
 badgeBg?: string;
 badgeText?: string;
 children: React.ReactNode;
}) {
 return (
 <section className="avoid-break">
 <div className="flex items-baseline gap-3 mb-1">
 <span
 className="inline-block w-1.5 h-6 rounded-full mt-0.5"
 style={{ backgroundColor: accent }}
 />
 <h2 className="text-lg font-bold text-gray-900">{title}</h2>
 {badge && (
 <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${badgeBg} ${badgeText}`}>
 {badge}
 </span>
 )}
 </div>
 {subtitle && (
 <p className="text-xs text-gray-500 ml-4 mb-4 leading-relaxed">{subtitle}</p>
 )}
 <div className="mt-3">{children}</div>
 </section>
 );
}

function KeywordTable({
 rows,
 showDelta,
 highlightDelta,
}: {
 rows: KeywordRow[];
 showDelta: boolean;
 highlightDelta?: "good" | "bad";
}) {
 return (
 <div className="rounded-[20px] border border-gray-200 overflow-hidden bg-card">
 <div className="hidden sm:grid grid-cols-12 gap-2 px-4 py-2.5 bg-gray-50 text-[11px] uppercase tracking-wider text-gray-500 font-semibold border-b border-gray-200">
 <div className="col-span-5">Keyword</div>
 <div className="col-span-2 text-center">Rank</div>
 <div className="col-span-2 text-center">AI Mode</div>
 <div className="col-span-2 text-center">ChatGPT</div>
 <div className="col-span-1 text-right">Status</div>
 </div>
 {rows.map((r, i) => {
 const deltaRowClass =
 showDelta && r.rankDelta != null && highlightDelta === "good" && r.rankDelta > 0
 ? "bg-green-50/40"
 : showDelta && r.rankDelta != null && highlightDelta === "bad" && r.rankDelta < 0
 ? "bg-red-50/40"
 : "";
 return (
 <div
 key={i}
 className={`border-t border-gray-100 px-4 py-3 text-xs flex flex-col gap-2 sm:grid sm:grid-cols-12 sm:gap-2 sm:items-center ${deltaRowClass}`}
 >
 <div className="sm:col-span-5 font-medium text-gray-900 sm:truncate">{r.keyword}</div>

 <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 sm:contents">
 <div className="sm:col-span-2 sm:text-center">
 <span className="text-gray-400 sm:hidden">Rank:</span>{" "}
 {r.rank ? (
 <span className="text-blue-700 font-semibold">#{r.rank}</span>
 ) : (
 <span className="text-gray-400">—</span>
 )}
 {showDelta && r.rankDelta != null && r.rankDelta !== 0 && (
 <span
 className={`ml-1.5 inline-block rounded px-1.5 py-0.5 text-[10px] font-bold ${
 r.rankDelta > 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
 }`}
 >
 {r.rankDelta > 0 ? "▲" : "▼"}
 {Math.abs(r.rankDelta)}
 </span>
 )}
 </div>

 <div className="sm:col-span-2 sm:text-center">
 <span className="text-gray-400 sm:hidden">AI Mode:</span>{" "}
 {r.clientCited ? (
 <span className="text-green-700 font-medium">✓ Cited</span>
 ) : r.mentionedInText ? (
 <span className="text-blue-700 font-medium">~ Mentioned</span>
 ) : r.aioPresent ? (
 <span className="text-red-700 font-medium">✗ Invisible</span>
 ) : (
 <span className="text-gray-400">—</span>
 )}
 </div>

 <div className="sm:col-span-2 sm:text-center">
 <span className="text-gray-400 sm:hidden">ChatGPT:</span>{" "}
 {r.chatgptCited ? (
 <span className="text-green-700 font-medium">✓ Cited</span>
 ) : r.chatgptMentioned ? (
 <span className="text-blue-700 font-medium">~ Mentioned</span>
 ) : (
 <span className="text-gray-400">—</span>
 )}
 </div>

 <div className="sm:col-span-1 sm:text-right text-gray-500 text-[11px]">
 {GAP_LABELS[r.gap] ?? r.gap}
 </div>
 </div>
 </div>
 );
 })}
 </div>
 );
}
