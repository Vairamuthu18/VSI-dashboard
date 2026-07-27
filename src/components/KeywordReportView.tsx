import Image from "next/image";
import PrintButton from "@/components/PrintButton";
import type {
 KeywordReportContent,
 KeywordReportBranding,
 SummaryNarrative,
 DetailedNarrative,
 TasksNarrative,
 KeywordReportSnapshot,
 KeywordReportHistoryRow,
} from "@/lib/keyword-report-builder";

const TYPE_LABEL: Record<KeywordReportContent["type"], string> = {
 keyword_summary: "Executive Summary",
 keyword_detailed: "Detailed Strategy Report",
 keyword_tasks: "Execution Task List",
};

const GROUP_COLOR: Record<"Content" | "Technical" | "Off-page", string> = {
 Content: "bg-blue-50 border-blue-200 text-blue-800",
 Technical: "bg-purple-50 border-purple-200 text-purple-800",
 "Off-page": "bg-green-50 border-green-200 text-green-800",
};

const OWNER_COLOR: Record<"Writer" | "Developer" | "SEO" | "Outreach", string> = {
 Writer: "bg-indigo-100 text-indigo-700",
 Developer: "bg-purple-100 text-purple-700",
 SEO: "bg-amber-100 text-amber-700",
 Outreach: "bg-green-100 text-green-700",
};

const EFFORT_LABEL: Record<"S" | "M" | "L", string> = {
 S: "Small · hours",
 M: "Medium · 1-2 days",
 L: "Large · 3+ days",
};

function shortDate(d: string) {
 return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export default function KeywordReportView({ content }: { content: KeywordReportContent }) {
 const c = content;
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

 <div className="no-print sticky top-0 z-20 bg-card border-b border-gray-200">
 <div className="max-w-4xl mx-auto px-6 py-3 flex items-center justify-between">
 <p className="text-xs text-gray-500">Confidential · Generated {shortDate(c.generatedAt)}</p>
 <PrintButton color={color} />
 </div>
 </div>

 <div className="max-w-4xl mx-auto my-6 print:my-0">
 <div className="print-page bg-card rounded-[20px] shadow-sm border border-gray-200 overflow-hidden">
 <ReportHeader branding={c.branding} client={c.client} keyword={c.keyword} type={c.type} />

 {c.aioOffTopic && (
 <div className="px-8 sm:px-12 pt-6">
 <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3">
 <p className="text-xs font-bold text-red-700 uppercase tracking-wider mb-1">AI Mode topic mismatch</p>
 <p className="text-sm text-gray-800">
 Google&rsquo;s AI Mode answer for this query is actually about <strong>{c.aioOffTopic.actualTopic}</strong>, not the client&rsquo;s industry. The recommendations below are a disambiguation strategy, not citation injection.
 </p>
 </div>
 </div>
 )}

 {/* Body — dispatch by type */}
 <div className="px-8 sm:px-12 py-8 space-y-10">
 <SnapshotStrip snapshot={c.snapshot} />

 {c.type === "keyword_summary" && <SummaryBody narrative={c.narrative} />}
 {c.type === "keyword_detailed" && <DetailedBody narrative={c.narrative} snapshot={c.snapshot} history={c.history} />}
 {c.type === "keyword_tasks" && <TasksBody narrative={c.narrative} />}
 </div>

 <ReportFooter branding={c.branding} color={color} />
 </div>
 </div>
 </div>
 );
}

// ─── Shared bits ────────────────────────────────────────────────

function ReportHeader({
 branding, client, keyword, type,
}: { branding: KeywordReportBranding; client: KeywordReportContent["client"]; keyword: string; type: KeywordReportContent["type"] }) {
 const color = branding.primaryColor;
 return (
 <div
 className="relative px-8 sm:px-12 pt-10 pb-8 print:py-6"
 style={{
 background: `linear-gradient(135deg, ${color}10 0%, ${color}05 50%, transparent 100%)`,
 borderBottom: `3px solid ${color}`,
 }}
 >
 <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
 <div className="flex items-center gap-4 min-w-0">
 {branding.logoUrl ? (
 <div className="h-16 w-16 rounded-[20px] bg-card border border-gray-200 p-2 shadow-sm shrink-0 flex items-center justify-center">
 <Image src={branding.logoUrl} alt={branding.displayName} width={56} height={56} className="object-contain max-h-12" unoptimized />
 </div>
 ) : (
 <div className="h-16 w-16 rounded-[20px] flex items-center justify-center text-white font-bold text-xl shrink-0" style={{ backgroundColor: color }}>
 {branding.displayName.charAt(0).toUpperCase()}
 </div>
 )}
 <div className="min-w-0">
 <p className="text-[11px] font-bold uppercase tracking-[0.18em]" style={{ color }}>{branding.displayName}</p>
 <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1 leading-tight">{TYPE_LABEL[type]}</h1>
 <p className="text-sm text-gray-600 mt-1">Keyword: <strong>&ldquo;{keyword}&rdquo;</strong></p>
 </div>
 </div>
 <div className="text-left sm:text-right shrink-0 border-l-0 sm:border-l border-gray-200 sm:pl-6">
 <p className="text-[11px] uppercase tracking-wider text-gray-500 font-medium">Prepared for</p>
 <p className="text-lg font-bold text-gray-900 mt-0.5">{client.brandName ?? client.name}</p>
 {client.website && <p className="text-xs text-gray-500 mt-0.5">{client.website}</p>}
 </div>
 </div>
 </div>
 );
}

function ReportFooter({ branding, color }: { branding: KeywordReportBranding; color: string }) {
 return (
 <footer className="px-8 sm:px-12 py-6 border-t border-gray-200 bg-gray-50">
 <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
 <div>
 <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">{branding.displayName}</p>
 {branding.footer && <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-wrap mt-1.5 max-w-xl">{branding.footer}</p>}
 </div>
 {branding.supportEmail && (
 <a href={`mailto:${branding.supportEmail}`} className="text-xs hover:underline shrink-0" style={{ color }}>{branding.supportEmail}</a>
 )}
 </div>
 </footer>
 );
}

function SnapshotStrip({ snapshot }: { snapshot: KeywordReportSnapshot }) {
 const chatgptValue = (() => {
 if (!snapshot.chatgptChecked) return "Not captured";
 if (snapshot.chatgptEntityMatch === false) return "⚠ Wrong entity";
 if (snapshot.chatgptBrandCited) return "✓ Cited";
 if (snapshot.chatgptBrandMentioned) return "~ Mentioned";
 return "✗ Invisible";
 })();

 const items = [
 { label: "Google rank", value: snapshot.rankPosition ? `#${snapshot.rankPosition}` : "Not in top 10" },
 { label: "AI Mode", value: snapshot.aioPresent ? "Present" : "Not triggered" },
 {
 label: "AIO citation",
 value: snapshot.clientCited ? "✓ Cited" : snapshot.mentionedInText ? "~ Mentioned" : snapshot.aioPresent ? "✗ Invisible" : "—",
 },
 { label: "ChatGPT", value: chatgptValue },
 ];
 return (
 <section className="avoid-break">
 <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
 {items.map((it) => (
 <div key={it.label} className="rounded-[20px] ring-1 ring-gray-200 bg-card p-4">
 <p className="text-[11px] uppercase tracking-wider text-gray-500 font-semibold">{it.label}</p>
 <p className="text-xl font-bold text-gray-900 mt-1">{it.value}</p>
 </div>
 ))}
 </div>
 <p className="text-[11px] text-gray-400 mt-2">Snapshot captured {shortDate(snapshot.capturedAt)}</p>
 </section>
 );
}

// ─── Summary body ───────────────────────────────────────────────

function SummaryBody({ narrative }: { narrative: SummaryNarrative }) {
 return (
 <>
 <section className="avoid-break">
 <h2 className="text-xl font-bold text-gray-900 leading-snug">{narrative.headline}</h2>
 <p className="text-sm text-gray-700 leading-relaxed mt-3 whitespace-pre-line">{narrative.narrative}</p>
 </section>

 <section className="avoid-break">
 <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-3">What we&rsquo;ll do</h3>
 <div className="space-y-2.5">
 {narrative.priorityActions.map((a, i) => (
 <div key={i} className="rounded-[20px] border border-gray-200 bg-card p-4">
 <div className="flex items-start gap-3">
 <span className="shrink-0 flex h-6 w-6 items-center justify-center rounded-full bg-amber-500 text-xs font-bold text-white">{i + 1}</span>
 <div className="flex-1 min-w-0">
 <p className="text-sm font-semibold text-gray-900">{a.title}</p>
 <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">{a.why}</p>
 </div>
 </div>
 </div>
 ))}
 </div>
 </section>

 <section className="avoid-break rounded-[20px] bg-amber-50 border border-amber-200 p-4">
 <p className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-1">Why this matters</p>
 <p className="text-sm text-gray-800 leading-relaxed">{narrative.whyItMatters}</p>
 </section>

 <section className="avoid-break rounded-[20px] bg-gray-50 border border-gray-200 p-4">
 <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Next check-in</p>
 <p className="text-sm text-gray-800">{narrative.nextCheckIn}</p>
 </section>
 </>
 );
}

// ─── Detailed body ──────────────────────────────────────────────

function DetailedBody({
 narrative, snapshot, history,
}: { narrative: DetailedNarrative; snapshot: KeywordReportSnapshot; history: KeywordReportHistoryRow[] }) {
 return (
 <>
 <Section title="Executive summary">
 <p className="text-sm text-gray-800 leading-relaxed">{narrative.executiveSummary}</p>
 </Section>

 <Section title="Situation analysis">
 <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-line">{narrative.situationAnalysis}</p>
 </Section>

 <Section title="Google SERP — top 10">
 {snapshot.serp.length === 0 ? (
 <p className="text-xs text-gray-500">No SERP data captured.</p>
 ) : (
 <div className="space-y-1">
 {snapshot.serp.slice(0, 10).map((r, i) => (
 <div key={i} className={`rounded-lg p-3 border ${r.isClient ? "bg-amber-50 border-amber-300" : "bg-gray-50 border-gray-200"}`}>
 <div className="flex items-baseline gap-3">
 <span className="text-xs font-bold text-gray-500 w-6 shrink-0">{r.position}.</span>
 <div className="flex-1 min-w-0">
 <p className="text-sm font-semibold text-gray-900">{r.title}</p>
 <p className="text-[11px] text-gray-500">{r.domain}{r.isClient ? " · CLIENT" : ""}</p>
 {r.snippet && <p className="text-xs text-gray-600 mt-1 leading-relaxed">{r.snippet}</p>}
 </div>
 </div>
 </div>
 ))}
 </div>
 )}
 </Section>

 <Section title="AI Mode answer">
 {snapshot.aioFullText ? (
 <div className="rounded-lg bg-gray-50 border border-gray-200 p-4">
 <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-line">{snapshot.aioFullText.slice(0, 2200)}</p>
 </div>
 ) : (
 <p className="text-xs text-gray-500">Google did not return an AI Mode answer for this query.</p>
 )}
 <p className="text-sm text-gray-800 leading-relaxed mt-3 whitespace-pre-line">{narrative.aioAnalysis}</p>
 </Section>

 <Section title="ChatGPT visibility">
 {snapshot.chatgptChecked ? (
 <>
 <div className="flex flex-wrap items-center gap-2 mb-3 text-xs">
 {snapshot.chatgptEntityMatch === false ? (
 <span className="rounded-full bg-orange-50 px-2.5 py-0.5 font-semibold text-orange-700 ring-1 ring-orange-200">⚠ Wrong entity</span>
 ) : (
 <>
 {snapshot.chatgptBrandCited && (
 <span className="rounded-full bg-green-50 px-2.5 py-0.5 font-semibold text-green-700 ring-1 ring-green-200">✓ Cited as source</span>
 )}
 {snapshot.chatgptBrandMentioned && !snapshot.chatgptBrandCited && (
 <span className="rounded-full bg-blue-50 px-2.5 py-0.5 font-semibold text-blue-700 ring-1 ring-blue-200">~ Mentioned</span>
 )}
 {!snapshot.chatgptBrandMentioned && !snapshot.chatgptBrandCited && (
 <span className="rounded-full bg-red-50 px-2.5 py-0.5 font-semibold text-red-700 ring-1 ring-red-200">✗ Not mentioned</span>
 )}
 </>
 )}
 {snapshot.chatgptMentionCount != null && snapshot.chatgptMentionCount > 0 && snapshot.chatgptEntityMatch !== false && (
 <span className="text-[11px] text-gray-500">{snapshot.chatgptMentionCount}× named</span>
 )}
 {snapshot.chatgptCompetitors.length > 0 && (
 <span className="text-[11px] text-gray-500">vs {snapshot.chatgptCompetitors.length} competitor{snapshot.chatgptCompetitors.length === 1 ? "" : "s"}</span>
 )}
 </div>

 {snapshot.chatgptEntityMatch === false && (
 <div className="mb-3 rounded-lg border border-orange-200 bg-orange-50 p-3">
 <p className="text-xs font-bold text-orange-700 uppercase tracking-wider mb-1">Brand-name collision</p>
 <p className="text-xs text-orange-900 leading-relaxed">
 ChatGPT&rsquo;s answer mentions the brand name but appears to describe{" "}
 <strong>{snapshot.chatgptActualEntity ?? "a different organisation"}</strong>. Treat &ldquo;mentioned&rdquo; as a false positive for this snapshot.
 </p>
 </div>
 )}

 {snapshot.chatgptResponse && (
 <details className="mb-3 rounded-lg border border-gray-200 bg-gray-50 p-3">
 <summary className="text-xs font-semibold text-gray-700 cursor-pointer">Verbatim ChatGPT response</summary>
 <p className="mt-2 text-xs text-gray-700 leading-relaxed whitespace-pre-wrap max-h-72 overflow-y-auto">
 {snapshot.chatgptResponse}
 </p>
 </details>
 )}

 {snapshot.chatgptCompetitors.length > 0 && (
 <div className="mb-3">
 <p className="text-[11px] uppercase tracking-wider text-gray-500 font-semibold mb-1">Competitors ChatGPT named</p>
 <div className="flex flex-wrap gap-1.5">
 {snapshot.chatgptCompetitors.map((c, i) => (
 <span key={i} className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-700">{c}</span>
 ))}
 </div>
 </div>
 )}

 <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-line">{narrative.chatgptAnalysis}</p>
 </>
 ) : (
 <p className="text-xs text-gray-500">ChatGPT-style check was not captured for this snapshot. {narrative.chatgptAnalysis ? <span className="text-gray-700">{narrative.chatgptAnalysis}</span> : null}</p>
 )}
 </Section>

 <Section title="Competitive landscape">
 <div className="space-y-2">
 {narrative.competitiveLandscape.map((row, i) => (
 <div key={i} className="rounded-lg border border-gray-200 bg-card p-3">
 <p className="text-sm font-semibold text-gray-900">{row.domain}</p>
 <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">{row.whyTheyWin}</p>
 </div>
 ))}
 </div>
 </Section>

 <Section title="Recommended strategy">
 <div className="space-y-3">
 {narrative.recommendedStrategy.map((phase, i) => (
 <div key={i} className="rounded-[20px] border border-gray-200 bg-card p-4">
 <p className="text-xs font-bold uppercase tracking-wider text-amber-700 mb-2">{phase.phase}</p>
 <ul className="list-disc list-inside space-y-1 text-sm text-gray-800">
 {phase.actions.map((a, j) => <li key={j} className="leading-relaxed">{a}</li>)}
 </ul>
 </div>
 ))}
 </div>
 </Section>

 {history.length > 1 && (
 <Section title="History">
 <div className="rounded-lg border border-gray-200 overflow-hidden">
 <div className="grid grid-cols-12 gap-2 px-3 py-2 bg-gray-50 text-[11px] uppercase tracking-wider text-gray-500 font-semibold">
 <div className="col-span-3">Date</div>
 <div className="col-span-2 text-center">Rank</div>
 <div className="col-span-2 text-center">AIO</div>
 <div className="col-span-2 text-center">Cited</div>
 <div className="col-span-3">Gap</div>
 </div>
 {history.slice(0, 12).map((row, i) => (
 <div key={i} className="grid grid-cols-12 gap-2 px-3 py-2 text-xs border-t border-gray-100 items-center">
 <div className="col-span-3 text-gray-700">{shortDate(row.capturedAt)}</div>
 <div className="col-span-2 text-center font-semibold">{row.rankPosition ? <span className="text-blue-700">#{row.rankPosition}</span> : <span className="text-gray-500 text-[10px]">Not&nbsp;top&nbsp;10</span>}</div>
 <div className="col-span-2 text-center">{row.aioPresent ? <span className="text-yellow-700">Yes</span> : <span className="text-gray-500">No</span>}</div>
 <div className="col-span-2 text-center">{row.clientCited ? <span className="text-green-700">✓</span> : <span className="text-gray-500">✗</span>}</div>
 <div className="col-span-3 text-gray-700">{row.gapLabel.replace(/_/g, " ")}</div>
 </div>
 ))}
 </div>
 </Section>
 )}

 <Section title="Risks & assumptions">
 <p className="text-sm text-gray-800 leading-relaxed">{narrative.risks}</p>
 </Section>
 </>
 );
}

// ─── Tasks body ─────────────────────────────────────────────────

function TasksBody({ narrative }: { narrative: TasksNarrative }) {
 const groups: Array<"Content" | "Technical" | "Off-page"> = ["Content", "Technical", "Off-page"];

 return (
 <>
 <div className="rounded-[20px] border border-blue-200 bg-blue-50 p-4">
 <p className="text-xs font-bold text-blue-700 uppercase tracking-wider mb-1">How to use this report</p>
 <p className="text-sm text-gray-800 leading-relaxed">
 Each task below is a ready-to-assign ticket with an owner role, effort, impact, and acceptance criteria. Copy any task into ClickUp, Linear, Notion, or your tracker of choice — they&rsquo;re written to be executable without further clarification.
 </p>
 </div>

 {groups.map((group) => {
 const tasks = narrative.tasks.filter((t) => t.group === group);
 if (tasks.length === 0) return null;
 return (
 <Section key={group} title={group}>
 <div className="space-y-3">
 {tasks.map((t) => (
 <div key={t.id} className={`rounded-[20px] border p-4 ${GROUP_COLOR[t.group]}`}>
 <div className="flex items-start gap-3 mb-2">
 <span className="shrink-0 text-xs font-mono font-bold text-gray-500 bg-card rounded px-2 py-1 border border-gray-200">{t.id}</span>
 <p className="text-sm font-bold text-gray-900 flex-1">{t.title}</p>
 </div>
 <div className="flex flex-wrap items-center gap-2 mb-2">
 <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${OWNER_COLOR[t.owner]}`}>{t.owner}</span>
 <span className="rounded-full bg-card border border-gray-300 px-2 py-0.5 text-[10px] font-semibold text-gray-700">{EFFORT_LABEL[t.effort]}</span>
 <span className="rounded-full bg-card border border-gray-300 px-2 py-0.5 text-[10px] font-semibold text-gray-700">Impact: {t.impact}</span>
 </div>
 <p className="text-sm text-gray-800 leading-relaxed mb-3">{t.description}</p>
 <div>
 <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">Acceptance criteria</p>
 <ul className="space-y-1">
 {t.acceptanceCriteria.map((ac, i) => (
 <li key={i} className="text-xs text-gray-700 leading-relaxed flex items-start gap-2">
 <span className="shrink-0 text-gray-400 mt-0.5">☐</span>
 <span>{ac}</span>
 </li>
 ))}
 </ul>
 </div>
 </div>
 ))}
 </div>
 </Section>
 );
 })}
 </>
 );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
 return (
 <section className="avoid-break">
 <div className="flex items-baseline gap-3 mb-3">
 <span className="inline-block w-1.5 h-6 rounded-full mt-0.5 bg-amber-500" />
 <h2 className="text-lg font-bold text-gray-900">{title}</h2>
 </div>
 <div>{children}</div>
 </section>
 );
}
