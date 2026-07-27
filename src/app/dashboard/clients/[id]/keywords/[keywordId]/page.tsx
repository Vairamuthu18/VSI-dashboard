import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireAgency } from "@/lib/auth";
import { TRACK_TYPE_CONFIG, GAP_CLASSIFICATIONS, LOCATIONS } from "@/types/search";
import type { TrackType, GapLabel, AIOCitation, OrganicResult, Location } from "@/types/search";
import KeywordIntelligenceView from "@/components/KeywordIntelligenceView";
import KeywordRunButton from "@/components/KeywordRunButton";
import OpportunityBriefButton from "@/components/OpportunityBriefButton";
import KeywordReportButton from "@/components/KeywordReportButton";
import KeywordTasksPanel from "@/components/KeywordTasksPanel";
import type { TaskRow } from "@/lib/tasks";
import CitationStrategyPanel, { type CitationStrategy } from "@/components/CitationStrategyPanel";
import { isBriefStale, type BriefSnapshot } from "@/lib/brief-staleness";
import StatusDot from "@/components/ui/StatusDot";

export default async function KeywordDetailPage({
 params,
}: {
 params: Promise<{ id: string; keywordId: string }>;
}) {
 const { id, keywordId } = await params;
 const supabase = await createClient();
 const session = await requireAgency();

 // Fetch tracked keyword + client (incl. engine toggles so we only render
 // surfaces the client has actually opted into). Super admin sees any
 // keyword across the platform; everyone else stays agency-scoped.
 const isSuperAdmin = session.role === "super_admin";
 const kwQuery = supabase
 .from("tracked_keywords")
 .select("*, clients(id, name, website, brand_name, service_type, ai_mode_enabled, ai_overview_enabled, rank_tracking_enabled, chatgpt_enabled)")
 .eq("id", keywordId)
 .eq("client_id", id);
 const { data: keyword } = await (isSuperAdmin ? kwQuery : kwQuery.eq("agency_id", session.agencyId)).single();

 if (!keyword) notFound();

 const client = keyword.clients as {
 id: string; name: string; website: string; brand_name: string; service_type: string;
 ai_mode_enabled: boolean | null;
 ai_overview_enabled: boolean | null;
 rank_tracking_enabled: boolean | null;
 chatgpt_enabled: boolean | null;
 };
 // Platform defaults — keep aligned with run-pipeline.
 const showAiMode = client.ai_mode_enabled ?? true;
 const showAiOverview = client.ai_overview_enabled ?? false;
 const showRank = client.rank_tracking_enabled ?? true;
 // ChatGPT visibility is now on by default for every client — pilots get
 // the full set of signals. Each client can still opt out via /admin/clients.
 const showChatGpt = client.chatgpt_enabled ?? true;

 // Fetch all runs for this keyword (history)
 const { data: runs } = await supabase
 .from("search_results")
 .select("id, rank_position, rank_url, rank_title, aio_present, client_cited, mentioned_in_text, cited_domains, aio_snippet, aio_full_text, citations_json, serp_results_json, gap_label, chatgpt_checked, chatgpt_response, chatgpt_brand_cited, chatgpt_brand_mentioned, chatgpt_mention_count, chatgpt_competitors, chatgpt_cited_urls, citation_strategy, citation_strategy_at, ai_overview_present, ai_overview_full_text, ai_overview_citations_json, ai_overview_client_cited, created_at")
 .eq("client_id", id)
 .eq("keyword", keyword.keyword)
 .eq("track_type", keyword.track_type)
 .order("created_at", { ascending: false })
 .limit(50);

 const history = runs ?? [];
 const latest = history[0];
 const previous = history[1];

 // Recompute "AIO citation: cited" using a fresh host match against the
 // current client.website. Old snapshots may have client_cited=true
 // baked in from when the brand-token fuzzy match flagged unrelated
 // domains; we override that here so the tile reflects reality without
 // forcing a re-run.
 const clientHostNormForLatest = (client.website ?? "")
 .toLowerCase()
 .replace(/^[a-z]+:\/+/, "")
 .replace(/^www\./, "")
 .split(/[\/?#]/)[0];
 const validClientHostForLatest = clientHostNormForLatest.includes(".") ? clientHostNormForLatest : "";
 const liveClientCited = latest && validClientHostForLatest
 ? (((latest.citations_json as { domain?: string }[] | null) ?? []).some((c) => {
 const d = (c.domain ?? "").toLowerCase();
 return d === validClientHostForLatest
 || d.endsWith(`.${validClientHostForLatest}`)
 || validClientHostForLatest.endsWith(`.${d}`);
 }))
 : !!latest?.client_cited;

 // ChatGPT entity-match columns ship in migration 029. Fetch them in a
 // separate tolerant query so the main page doesn't break on older DBs.
 let chatgptEntityMatch: boolean | null = null;
 let chatgptActualEntity: string | null = null;
 if (latest?.id) {
 try {
 const { data: entityRow } = await supabase
 .from("search_results")
 .select("chatgpt_entity_match, chatgpt_actual_entity")
 .eq("id", latest.id)
 .maybeSingle();
 if (entityRow) {
 chatgptEntityMatch = (entityRow as { chatgpt_entity_match?: boolean | null }).chatgpt_entity_match ?? null;
 chatgptActualEntity = (entityRow as { chatgpt_actual_entity?: string | null }).chatgpt_actual_entity ?? null;
 }
 } catch {
 // Columns don't exist yet — leave nulls.
 }
 }

 // Existing keyword reports — only show successfully-generated ("ready")
 // ones so the list doesn't include pending or failed rows the user
 // didn't actually produce.
 const reportsBaseQuery = supabase
 .from("reports")
 .select("id, type, status, share_token, generated_at")
 .eq("tracked_keyword_id", keywordId)
 .in("type", ["keyword_summary", "keyword_detailed", "keyword_tasks"])
 .eq("status", "ready")
 .order("generated_at", { ascending: false })
 .limit(20);
 const { data: existingReports } = await (isSuperAdmin ? reportsBaseQuery : reportsBaseQuery.eq("agency_id", session.agencyId));

 const priorReports = (existingReports ?? []).map((r) => ({
 id: r.id as string,
 type: r.type as "keyword_summary" | "keyword_detailed" | "keyword_tasks",
 shareUrl: `/r/${r.share_token}`,
 generatedAt: r.generated_at as string,
 }));

 // Existing tasks for this keyword (built-in task tracker)
 const tasksBaseQuery = supabase
 .from("tasks")
 .select("*")
 .eq("tracked_keyword_id", keywordId)
 .order("status", { ascending: true })
 .order("priority", { ascending: true })
 .order("created_at", { ascending: false });
 const { data: kwTasks } = await (isSuperAdmin ? tasksBaseQuery : tasksBaseQuery.eq("agency_id", session.agencyId));
 const tasksForKeyword = (kwTasks ?? []) as TaskRow[];

 const tt = TRACK_TYPE_CONFIG[keyword.track_type as TrackType];
 const gap = latest ? GAP_CLASSIFICATIONS[latest.gap_label as GapLabel] : null;

 // Compute deltas vs previous run
 const rankDelta = latest && previous && latest.rank_position && previous.rank_position
 ? previous.rank_position - latest.rank_position
 : null;

 const citationDelta = latest && previous
 ? ((latest.cited_domains?.length ?? 0) - (previous.cited_domains?.length ?? 0))
 : null;

 const gapChanged = latest && previous && latest.gap_label !== previous.gap_label;

 return (
 <div className="p-4 sm:p-8 max-w-6xl space-y-6">
 {/* Breadcrumb */}
 <div className="flex items-center gap-2 text-sm text-gray-500">
 <Link href={`/dashboard/clients/${id}`} className="hover:text-white transition-colors">{client.name}</Link>
 <span className="text-gray-600">/</span>
 <Link href={`/dashboard/clients/${id}/keywords`} className="hover:text-white transition-colors">Keywords</Link>
 <span className="text-gray-600">/</span>
 <span className="text-gray-300 truncate">{keyword.keyword}</span>
 </div>

 {/* Header */}
 <div className="rounded-[20px] border border-white/5 bg-card/[0.02] p-4 sm:p-6 backdrop-blur-md">
 <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
 <div className="flex-1 min-w-0">
 <div className="flex items-center gap-2 sm:gap-3 mb-2 flex-wrap">
 <h1 className="text-lg sm:text-2xl font-heading font-black text-white break-words">{keyword.keyword}</h1>
 <span className={`rounded px-2 py-0.5 text-xs font-bold border border-white/10 ${tt?.color.replace('bg-', 'text-').replace('100', '400')}`}>
 {tt?.label}
 </span>
 <span className="rounded bg-card/10 border border-white/20 px-2 py-0.5 text-xs text-gray-300 font-medium">
 {(LOCATIONS[keyword.location as Location] ?? LOCATIONS.ae).label}
 </span>
 <span className={`flex items-center gap-1.5 text-xs ${keyword.is_active ? "text-emerald-400" : "text-gray-500"}`}>
 <span className={`h-1.5 w-1.5 rounded-full ${keyword.is_active ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-gray-500"}`} />
 {keyword.is_active ? "Active" : "Paused"}
 </span>
 </div>
 <p className="text-sm text-gray-400">
 Tracking <span className="text-white font-medium">{keyword.domain}</span>
 {keyword.brand && <span> · brand: <span className="text-white">{keyword.brand}</span></span>}
 </p>
 </div>

 <div className="flex flex-wrap items-center gap-2 shrink-0">
 <KeywordRunButton clientId={id} keywordId={keywordId} />
 </div>
 </div>

 {/* Current state quick stats — only render tiles for engines the
 client has enabled. Keeps the dashboard clean for clients on
 partial plans. */}
 {latest && (
 <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
 {/* Rank */}
 {showRank && (
 <div className="rounded-lg bg-card/5 border border-white/10 p-3">
 <p className="text-xs text-gray-400 mb-1">Google Rank</p>
 <div className="flex items-baseline gap-2">
 {latest.rank_position ? (
 <p className="text-2xl font-bold text-cyan-400">#{latest.rank_position}</p>
 ) : (
 <p className="text-sm font-semibold text-gray-500">Not in top 10</p>
 )}
 {rankDelta !== null && rankDelta !== 0 && (
 <span className={`text-xs font-semibold ${rankDelta > 0 ? "text-emerald-400" : "text-rose-400"}`}>
 {rankDelta > 0 ? "▲" : "▼"} {Math.abs(rankDelta)}
 </span>
 )}
 </div>
 </div>
 )}

 {/* AI Mode */}
 {showAiMode && (
 <div className="rounded-lg bg-card/5 border border-white/10 p-3">
 <p className="text-xs text-gray-400 mb-1">AI Mode</p>
 <p className={`text-base font-bold ${
 liveClientCited ? "text-emerald-400" :
 latest.mentioned_in_text ? "text-cyan-400" :
 latest.aio_present ? "text-rose-400" : "text-gray-500"
 }`}>
 {liveClientCited ? "✓ Cited" :
 latest.mentioned_in_text ? "~ Mentioned" :
 latest.aio_present === false ? "Not triggered" :
 latest.aio_present === null ? "—" : "✗ Invisible"}
 </p>
 {(latest.cited_domains?.length ?? 0) > 0 && (
 <p className="text-[10px] text-gray-500 mt-0.5">
 {latest.cited_domains.length} citations
 {citationDelta !== null && citationDelta !== 0 && (
 <span className={`ml-1 ${citationDelta > 0 ? "text-cyan-400" : "text-gray-600"}`}>
 ({citationDelta > 0 ? "+" : ""}{citationDelta})
 </span>
 )}
 </p>
 )}
 </div>
 )}

 {/* AI Overview — only when the client opted in */}
 {showAiOverview && (
 <div className="rounded-lg bg-card/5 border border-white/10 p-3">
 <p className="text-xs text-gray-400 mb-1">AI Overview</p>
 <p className={`text-base font-bold ${
 latest.ai_overview_client_cited ? "text-emerald-400" :
 latest.ai_overview_present ? "text-purple-400" :
 latest.ai_overview_present === false ? "text-gray-500" :
 "text-gray-600"
 }`}>
 {latest.ai_overview_client_cited ? "✓ Cited" :
 latest.ai_overview_present ? "Present" :
 latest.ai_overview_present === false ? "Not triggered" :
 "—"}
 </p>
 </div>
 )}

 {/* ChatGPT — only when the client opted in */}
 {showChatGpt && (
 <div className="rounded-lg bg-card/5 border border-white/10 p-3">
 <p className="text-xs text-gray-400 mb-1">ChatGPT</p>
 <p className={`text-base font-bold ${
 chatgptEntityMatch === false ? "text-orange-400" :
 latest.chatgpt_brand_cited ? "text-emerald-400" :
 latest.chatgpt_brand_mentioned ? "text-cyan-400" :
 latest.chatgpt_checked ? "text-rose-400" : "text-gray-600"
 }`}>
 {!latest.chatgpt_checked ? "—" :
 chatgptEntityMatch === false ? "⚠ Wrong entity" :
 latest.chatgpt_brand_cited ? "✓ Cited" :
 latest.chatgpt_brand_mentioned ? "~ Mentioned" :
 "✗ Invisible"}
 </p>
 {chatgptEntityMatch === false ? (
 <p className="text-[10px] text-orange-400 mt-0.5">Answer is about a different brand</p>
 ) : (
 latest.chatgpt_checked && latest.chatgpt_mention_count != null && latest.chatgpt_mention_count > 0 && (
 <p className="text-[10px] text-gray-500 mt-0.5">{latest.chatgpt_mention_count}× mentioned</p>
 )
 )}
 </div>
 )}
 </div>
 )}

 {/* Gap classification — show provisional state if AIO content not yet captured */}
 {gap && (() => {
 const hasContent = !!(latest?.aio_full_text || latest?.aio_snippet);
 const hasCitations = (latest?.cited_domains?.length ?? 0) > 0;
 const aioContentPending = latest?.aio_present && !hasContent && !hasCitations;

 if (aioContentPending) {
 return (
 <div className="mt-4 flex items-center gap-3 rounded-lg bg-card/5 border border-white/10 p-3">
 <StatusDot color="gray" size="md" />
 <div className="flex-1">
 <p className="text-sm font-semibold text-white">AI Mode present — content pending</p>
 <p className="text-xs text-gray-400">
 Google triggered an AI Mode for this query but content wasn&apos;t captured in this snapshot. Re-run to fetch.
 </p>
 </div>
 </div>
 );
 }

 return (
 <div className="mt-4 flex items-center gap-3 rounded-lg bg-card/5 border border-white/10 p-3">
 <StatusDot color={gap.dot} size="md" />
 <div className="flex-1">
 <p className="text-sm font-semibold text-white">{gap.title}</p>
 <p className="text-xs text-gray-400">{gap.description}</p>
 </div>
 {gapChanged && (
 <span className="rounded-full bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 text-xs font-semibold text-amber-400">
 Status changed since last check
 </span>
 )}
 </div>
 );
 })()}
 </div>

 {/* ── Workflow order: Brief → Snapshot → ChatGPT response →
 Citation Strategy → Reports → Tasks ─────────────────────── */}

 {/* 1. Brief — diagnosis */}
 {latest && (
 <OpportunityBriefButton
 gapLabel={latest.gap_label}
 trackedKeywordId={keyword.id}
 initialBrief={keyword.ai_brief ?? null}
 isStale={isBriefStale(
 keyword.ai_brief_snapshot as BriefSnapshot | null,
 {
 gapLabel: latest.gap_label,
 rankPosition: latest.rank_position,
 aioPresent: latest.aio_present,
 clientCited: latest.client_cited,
 mentionedInText: latest.mentioned_in_text,
 citedDomains: latest.cited_domains ?? [],
 },
 keyword.ai_brief_at ?? null
 )}
 />
 )}

 {/* 2. Latest Snapshot — the raw data the brief draws from */}
 {latest ? (
 <div className="rounded-[20px] border border-white/5 bg-card/[0.02] p-6 backdrop-blur-md">
 <h2 className="text-base font-semibold text-white mb-4">Latest Snapshot</h2>
 <KeywordIntelligenceView
 keyword={keyword.keyword}
 gapLabel={latest.gap_label}
 rankPosition={latest.rank_position}
 rankUrl={latest.rank_url}
 rankTitle={latest.rank_title}
 aioPresent={latest.aio_present}
 aioFullText={latest.aio_full_text}
 aioSnippet={latest.aio_snippet}
 clientCited={latest.client_cited}
 mentionedInText={latest.mentioned_in_text}
 citations={(latest.citations_json as AIOCitation[]) ?? []}
 citedDomains={latest.cited_domains ?? []}
 serpResults={(latest.serp_results_json as OrganicResult[]) ?? []}
 clientDomain={client.website}
 clientBrand={client.brand_name ?? client.name}
 aiOverviewPresent={showAiOverview ? latest.ai_overview_present : null}
 aiOverviewFullText={showAiOverview ? latest.ai_overview_full_text : null}
 aiOverviewCitations={showAiOverview ? ((latest.ai_overview_citations_json as AIOCitation[]) ?? []) : []}
 aiOverviewClientCited={showAiOverview ? latest.ai_overview_client_cited : null}
 />
 </div>
 ) : null}

 {/* 3. ChatGPT Response — second AI surface, lives next to the snapshot
 since it's part of the raw "what AI saw" data, not the strategy. */}
 {showChatGpt && latest && latest.chatgpt_checked && (
 <div className="rounded-[20px] border border-white/5 bg-card/[0.02] p-6 backdrop-blur-md">
 <div className="flex items-center justify-between mb-2">
 <h2 className="text-base font-semibold text-white">ChatGPT Response</h2>
 <div className="flex items-center gap-2 text-xs">
 {chatgptEntityMatch === false ? (
 <span className="rounded-full bg-orange-500/10 border border-orange-500/20 px-2.5 py-0.5 font-semibold text-orange-400" title="ChatGPT name-dropped your brand but the answer is actually about a different organisation with the same name">⚠ Wrong entity</span>
 ) : (
 <>
 {latest.chatgpt_brand_cited && (
 <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 font-semibold text-emerald-400">✓ Cited as source</span>
 )}
 {latest.chatgpt_brand_mentioned && !latest.chatgpt_brand_cited && (
 <span className="rounded-full bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-0.5 font-semibold text-cyan-400">~ Mentioned in text</span>
 )}
 {latest.chatgpt_checked && !latest.chatgpt_brand_mentioned && !latest.chatgpt_brand_cited && (
 <span className="rounded-full bg-rose-500/10 border border-rose-500/20 px-2.5 py-0.5 font-semibold text-rose-400">✗ Not mentioned</span>
 )}
 </>
 )}
 </div>
 </div>
 <p className="text-[11px] text-gray-500 mb-4 leading-relaxed">
 How a ChatGPT-class assistant would answer this query right now — used as a proxy for whether your brand
 naturally surfaces in conversational AI search. Captured by sending the keyword to an LLM with a research-assistant
 system prompt and scanning the response for the brand and competitor mentions.
 </p>

 {chatgptEntityMatch === false && (
 <div className="mb-4 rounded-lg border border-orange-500/30 bg-orange-500/10 p-3">
 <p className="text-xs font-bold text-orange-400 uppercase tracking-wider mb-1">Brand-name collision detected</p>
 <p className="text-xs text-orange-200 leading-relaxed">
 ChatGPT&rsquo;s answer mentions the brand name but appears to describe{" "}
 <strong>{chatgptActualEntity ?? "a different organisation"}</strong> — not the tracked brand.
 Treat &ldquo;mentioned&rdquo; as a false positive for this snapshot. The recommended move is brand-disambiguation
 content (a clear &ldquo;about us&rdquo; page, Wikipedia / Wikidata entry, sameAs schema) so the model can tell the
 two entities apart.
 </p>
 </div>
 )}

 {latest.chatgpt_response && (
 <div className="rounded-lg bg-card/5 border border-white/10 p-4 text-sm text-gray-300 leading-relaxed whitespace-pre-wrap max-h-96 overflow-y-auto">
 {latest.chatgpt_response}
 </div>
 )}

 {(latest.chatgpt_cited_urls?.length ?? 0) > 0 && (
 <div className="mt-4">
 <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
 ChatGPT Cited Sources ({latest.chatgpt_cited_urls.length})
 </p>
 <div className="space-y-1">
 {latest.chatgpt_cited_urls.map((url: string, i: number) => {
 let host = "";
 try { host = new URL(url).hostname.replace(/^www\./, "").toLowerCase(); } catch {}
 const clientHost = (client.website ?? "")
 .toLowerCase()
 .replace(/^[a-z]+:\/+/, "")
 .replace(/^www\./, "")
 .split(/[\/?#]/)[0];
 const validClientHost = clientHost.includes(".") ? clientHost : "";
 const isClient = !!validClientHost && (host === validClientHost || host.endsWith(`.${validClientHost}`));
 return (
 <a
 key={i}
 href={url}
 target="_blank"
 rel="noopener noreferrer"
 className={`block rounded-lg border px-3 py-2 text-xs hover:bg-card/10 transition-colors ${
 isClient
 ? "border-amber-500/30 bg-amber-500/10 text-amber-400"
 : "border-white/10 bg-card/5 text-gray-300"
 }`}
 >
 <span className="font-medium">{host || url}</span>
 {isClient && <span className="ml-2 text-amber-500">★ client</span>}
 </a>
 );
 })}
 </div>
 </div>
 )}

 {(latest.chatgpt_competitors?.length ?? 0) > 0 && (
 <div className="mt-4">
 <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
 Competitors mentioned ({latest.chatgpt_competitors.length})
 </p>
 <div className="flex flex-wrap gap-1.5">
 {latest.chatgpt_competitors.map((c: string, i: number) => (
 <span key={i} className="rounded-full border border-white/10 bg-card/5 px-2.5 py-0.5 text-xs text-gray-300">
 {c}
 </span>
 ))}
 </div>
 </div>
 )}
 </div>
 )}

 {/* 4. Citation Strategy — the blueprint (scrapes top 10 + client page) */}
 {latest && (() => {
 // Count competitor citations using a fresh host comparison against
 // the current client.website. Old snapshots may have stale isClient
 // flags from when brand-token fuzzy match was on; ignore those and
 // recompute here.
 const clientHostNorm = (client.website ?? "")
 .toLowerCase()
 .replace(/^[a-z]+:\/+/, "")
 .replace(/^www\./, "")
 .split(/[\/?#]/)[0];
 const validClientHostStrat = clientHostNorm.includes(".") ? clientHostNorm : "";
 const competitorCount = ((latest.citations_json as { url?: string; domain?: string }[] | null) ?? [])
 .filter((c) => {
 if (!c.url || !/^https?:\/\//.test(c.url)) return false;
 const d = (c.domain ?? "").toLowerCase();
 if (!validClientHostStrat) return true;
 return d !== validClientHostStrat
 && !d.endsWith(`.${validClientHostStrat}`)
 && !validClientHostStrat.endsWith(`.${d}`);
 })
 .length;
 return (
 <CitationStrategyPanel
 snapshotId={latest.id}
 initial={(latest.citation_strategy as CitationStrategy | null) ?? null}
 competitorCount={competitorCount}
 />
 );
 })()}

 {/* 5. Reports — Task List grounds in the Citation Strategy above */}
 {latest && (
 <KeywordReportButton
 trackedKeywordId={keyword.id}
 priorReports={priorReports}
 hasCitationStrategy={!!latest.citation_strategy}
 />
 )}

 {/* 6. Tasks — the imported execution tickets */}
 {latest && (
 <KeywordTasksPanel
 clientId={id}
 trackedKeywordId={keyword.id}
 tasks={tasksForKeyword}
 currentSignals={{
 rankPosition: latest.rank_position,
 gapLabel: latest.gap_label,
 aioPresent: latest.aio_present,
 clientCited: latest.client_cited,
 citedDomainCount: (latest.cited_domains ?? []).length,
 }}
 />
 )}

 {!latest && (
 <div className="rounded-[20px] border border-dashed border-white/10 bg-card/[0.01] p-10 text-center">
 <p className="text-sm text-gray-400">No checks yet for this keyword</p>
 <p className="text-xs text-gray-500 mt-1">Hit Run to capture the first snapshot</p>
 </div>
 )}

 {/* History — collapsed by default; users open it when they want the audit trail */}
 {history.length > 1 && (
 <details className="group rounded-[20px] border border-white/5 bg-card/[0.02] p-6 backdrop-blur-md [&_summary::-webkit-details-marker]:hidden">
 <summary className="flex items-center justify-between cursor-pointer list-none">
 <h2 className="text-base font-semibold text-white">
 History — {history.length} check{history.length !== 1 ? "s" : ""}
 </h2>
 <span className="flex items-center gap-1.5 text-xs text-gray-500 group-hover:text-gray-300 transition-colors">
 <span className="group-open:hidden">Show</span>
 <span className="hidden group-open:inline">Hide</span>
 <svg
 className="h-3.5 w-3.5 transition-transform duration-200 group-open:rotate-180"
 viewBox="0 0 20 20" fill="currentColor" aria-hidden
 >
 <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.06l3.71-3.83a.75.75 0 111.08 1.04l-4.25 4.39a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z" clipRule="evenodd"/>
 </svg>
 </span>
 </summary>
 <div className="mt-4 rounded-lg border border-white/10 overflow-hidden">
 <div className="grid grid-cols-12 gap-2 px-4 py-2.5 bg-card/5 text-xs text-gray-400 font-medium">
 <div className="col-span-2">Date</div>
 <div className="col-span-1 text-center">Rank</div>
 <div className="col-span-1 text-center">AIO</div>
 <div className="col-span-1 text-center">Cited</div>
 <div className="col-span-1 text-center">Citations</div>
 <div className="col-span-6">Gap Status</div>
 </div>
 {history.map((r, i) => {
 const rGap = GAP_CLASSIFICATIONS[r.gap_label as GapLabel];
 const isLatest = i === 0;
 return (
 <div
 key={r.id}
 className={`grid grid-cols-12 gap-2 px-4 py-2.5 border-t border-white/5 items-center text-xs ${
 isLatest ? "bg-amber-500/10" : "hover:bg-card/5"
 }`}
 >
 <div className="col-span-2">
 <p className="text-white font-medium">
 {new Date(r.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
 </p>
 <p className="text-gray-500 text-xs">
 {new Date(r.created_at).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
 </p>
 </div>
 <div className="col-span-1 text-center font-semibold">
 {r.rank_position ? <span className="text-cyan-400">#{r.rank_position}</span> : <span className="text-gray-600 text-[10px]">Not&nbsp;top&nbsp;10</span>}
 </div>
 <div className="col-span-1 text-center">
 {r.aio_present === null ? <span className="text-gray-600">—</span>
 : r.aio_present ? <span className="text-amber-400">Yes</span>
 : <span className="text-gray-500">No</span>}
 </div>
 <div className="col-span-1 text-center">
 {r.client_cited === null ? <span className="text-gray-600">—</span>
 : r.client_cited ? <span className="text-emerald-400">✓</span>
 : r.mentioned_in_text ? <span className="text-cyan-400">~</span>
 : <span className="text-gray-500">✗</span>}
 </div>
 <div className="col-span-1 text-center text-gray-300">
 {r.cited_domains?.length ?? 0}
 </div>
 <div className="col-span-6 flex items-center gap-2">
 {rGap && <StatusDot color={rGap.dot} />}
 <span className="font-medium text-gray-300">
 {rGap?.title ?? r.gap_label?.replace(/_/g, " ")}
 </span>
 {isLatest && <span className="ml-2 text-xs text-amber-500 font-semibold border border-amber-500/30 rounded px-1 py-0.5">latest</span>}
 </div>
 </div>
 );
 })}
 </div>
 </details>
 )}
 </div>
 );
}
