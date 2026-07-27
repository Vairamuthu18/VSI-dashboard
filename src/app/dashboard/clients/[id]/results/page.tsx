import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireAgency } from "@/lib/auth";
import { SERVICE_TYPE_LABELS, TRACK_TYPE_CONFIG } from "@/types/search";
import type { ServiceType, TrackType, StatusColor } from "@/types/search";
import StatusDot from "@/components/ui/StatusDot";
import { Sparkles, ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";

const GAP_LABELS: Record<string, { dot: StatusColor; label: string; color: string; badge: string }> = {
 aligned: { dot: "green", label: "Aligned", color: "text-emerald-400", badge: "border-emerald-500/30 bg-emerald-500/10" },
 aligned_no_mention: { dot: "blue", label: "Cited, Unnamed", color: "text-cyan-400", badge: "border-cyan-500/30 bg-cyan-500/10" },
 ai_mentioned: { dot: "blue", label: "AI-Mentioned", color: "text-cyan-400", badge: "border-cyan-500/30 bg-cyan-500/10" },
 search_strong_ai_invisible: { dot: "yellow", label: "AI-Invisible", color: "text-amber-400", badge: "border-amber-500/30 bg-amber-500/10" },
 weak_double_loss: { dot: "red", label: "Double Loss", color: "text-rose-400", badge: "border-rose-500/30 bg-rose-500/10" },
 geo_cited: { dot: "green", label: "GEO Cited & Named", color: "text-emerald-400", badge: "border-emerald-500/30 bg-emerald-500/10" },
 geo_cited_no_mention: { dot: "blue", label: "GEO Cited, Unnamed", color: "text-cyan-400", badge: "border-cyan-500/30 bg-cyan-500/10" },
 geo_mentioned: { dot: "blue", label: "GEO Mentioned", color: "text-cyan-400", badge: "border-cyan-500/30 bg-cyan-500/10" },
 geo_invisible: { dot: "yellow", label: "GEO Invisible", color: "text-amber-400", badge: "border-amber-500/30 bg-amber-500/10" },
 geo_no_aio: { dot: "gray", label: "No AIO Trigger", color: "text-gray-400", badge: "border-white/10 bg-card/5" },
 seo_ranked: { dot: "green", label: "Ranked", color: "text-emerald-400", badge: "border-emerald-500/30 bg-emerald-500/10" },
 seo_ranked_no_aio: { dot: "green", label: "Ranked, No AIO", color: "text-emerald-400", badge: "border-emerald-500/30 bg-emerald-500/10" },
 seo_not_ranked: { dot: "red", label: "Not Ranked", color: "text-rose-400", badge: "border-rose-500/30 bg-rose-500/10" },
};

export default async function ResultsPage({
 params,
 searchParams,
}: {
 params: Promise<{ id: string }>;
 searchParams: Promise<{ page?: string; track?: string }>;
}) {
 const { id } = await params;
 const { page: pageParam, track: trackFilter } = await searchParams;
 const page = Math.max(1, parseInt(pageParam ?? "1", 10));
 const perPage = 30;
 const from = (page - 1) * perPage;

 const supabase = await createClient();
 const session = await requireAgency();

 const isSuperAdmin = session.role === "super_admin";
 const clientQ = supabase.from("clients").select("id, name, service_type").eq("id", id);
 const { data: client } = await (isSuperAdmin ? clientQ : clientQ.eq("agency_id", session.agencyId)).single();

 if (!client) notFound();

 const svc = SERVICE_TYPE_LABELS[client.service_type as ServiceType];

 let query = supabase
 .from("search_results")
 .select("*", { count: "exact" })
 .eq("client_id", id)
 .order("created_at", { ascending: false })
 .range(from, from + perPage - 1);

 if (trackFilter && trackFilter !== "all") {
 query = query.eq("track_type", trackFilter);
 }

 const { data: results, count } = await query;
 const rows = results ?? [];
 const totalPages = Math.ceil((count ?? 0) / perPage);

 return (
 <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6">
 {/* Header */}
 <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-white/[0.05] pb-6">
 <div>
 <div className="flex items-center gap-2 mb-1.5 text-xs font-mono text-gray-500">
 <Link href={`/dashboard/clients/${id}`} className="hover:text-amber-400 transition-colors flex items-center gap-1">
 <ArrowLeft size={13} />
 <span>{client.name}</span>
 </Link>
 <span className="text-gray-600">/</span>
 <span className="text-white font-bold">Citation Diagnostics</span>
 </div>
 <div className="flex items-center gap-3">
 <h1 className="text-2xl font-heading font-black text-white tracking-tight">AI & Search Results Log</h1>
 <span className="rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 px-3 py-0.5 text-[10px] font-mono font-bold uppercase tracking-widest shadow-[0_0_10px_rgba(245,158,11,0.2)]">
 {svc.short}
 </span>
 <span className="text-xs font-mono text-gray-400">{count ?? 0} Total Snapshots</span>
 </div>
 </div>

 {/* Track type filter */}
 <div className="flex items-center gap-1.5 bg-[#121215] border border-white/[0.08] p-1.5 rounded-[20px] shadow-xl w-fit">
 {["all", "seo", "geo", "both"].map((t) => {
 const active = (trackFilter ?? "all") === t;
 return (
 <Link
 key={t}
 href={`/dashboard/clients/${id}/results?track=${t}`}
 className={`rounded-[20px] px-4 py-1.5 text-xs font-mono font-bold transition-all uppercase ${
 active
 ? "bg-gradient-to-r from-amber-500 to-orange-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.35)] scale-105"
 : "text-gray-400 hover:text-white hover:bg-card/5"
 }`}
 >
 {t === "all" ? "All Tracks" : TRACK_TYPE_CONFIG[t as TrackType]?.label ?? t}
 </Link>
 );
 })}
 </div>
 </div>

 {rows.length === 0 ? (
 <div className="rounded-[20px] border border-dashed border-white/15 bg-[#121215] p-16 text-center shadow-2xl">
 <Sparkles size={36} className="text-amber-500 mx-auto mb-4 animate-bounce" />
 <p className="text-lg font-heading font-bold text-white mb-1">No Diagnostic Results Found</p>
 <p className="text-xs text-gray-400 max-w-md mx-auto mb-6">
 Run the AI answer audit from the client overview to generate detailed rank position and citation snapshots.
 </p>
 <Link
 href={`/dashboard/clients/${id}`}
 className="inline-flex items-center gap-2 rounded-[20px] bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-3 text-xs font-mono font-bold text-black shadow-[0_0_20px_rgba(245,158,11,0.4)] transition-all"
 >
 ← BACK TO CLIENT OVERVIEW
 </Link>
 </div>
 ) : (
 <>
 <div className="rounded-[20px] border border-white/[0.08] bg-[#121215] overflow-hidden shadow-2xl">
 {/* Table header */}
 <div className="hidden sm:grid grid-cols-12 gap-2 px-6 py-3.5 bg-black/40 text-xs font-mono font-bold text-gray-400 uppercase tracking-wider border-b border-white/[0.06]">
 <div className="col-span-3">Keyword</div>
 <div className="col-span-1 text-center">Track</div>
 <div className="col-span-1 text-center">Google Rank</div>
 <div className="col-span-1 text-center">AIO Present</div>
 <div className="col-span-1 text-center">Client Cited</div>
 <div className="col-span-1 text-center">ChatGPT</div>
 <div className="col-span-3">Diagnostic Gap</div>
 <div className="col-span-1 text-right">Date</div>
 </div>

 {rows.map((r) => {
 const gap = GAP_LABELS[r.gap_label] ?? { dot: "gray" as StatusColor, label: r.gap_label, color: "text-gray-400", badge: "border-white/10 bg-card/5" };
 const tt = TRACK_TYPE_CONFIG[r.track_type as TrackType];
 return (
 <div
 key={r.id}
 className="border-t border-white/[0.05] hover:bg-card/[0.04] transition-all px-6 py-4 text-xs flex flex-col gap-2 sm:grid sm:grid-cols-12 sm:gap-2 sm:items-center"
 >
 {/* Keyword + domain */}
 <div className="sm:col-span-3 min-w-0">
 <p className="text-sm font-heading font-bold text-white sm:truncate">{r.keyword}</p>
 <p className="text-xs font-mono text-gray-500 truncate mt-0.5">{r.domain}</p>
 </div>

 {/* Metrics columns */}
 <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 sm:contents font-mono">
 <div className="sm:col-span-1 sm:flex sm:justify-center">
 <span className="text-gray-400 sm:hidden">Track:</span>
 <span className={`rounded-md px-2 py-0.5 text-xs font-bold uppercase bg-card/5 border border-white/10 ${tt?.color ?? "text-gray-400"}`}>
 {tt?.label ?? r.track_type}
 </span>
 </div>
 <div className="sm:col-span-1 sm:text-center font-bold text-sm">
 <span className="text-gray-400 font-normal sm:hidden">Rank:</span>{" "}
 {r.rank_position
 ? <span className="text-cyan-400">#{r.rank_position}</span>
 : <span className="text-gray-600">—</span>}
 </div>
 <div className="sm:col-span-1 sm:text-center font-bold">
 <span className="text-gray-400 font-normal sm:hidden">AIO:</span>{" "}
 {r.aio_present === null
 ? <span className="text-gray-600">—</span>
 : r.aio_present
 ? <span className="text-amber-400">Yes</span>
 : <span className="text-gray-500">No</span>}
 </div>
 <div className="sm:col-span-1 sm:text-center font-bold">
 <span className="text-gray-400 font-normal sm:hidden">Cited:</span>{" "}
 {r.client_cited === null
 ? <span className="text-gray-600">—</span>
 : r.client_cited
 ? <span className="text-emerald-400 text-sm">✓</span>
 : r.mentioned_in_text
 ? <span className="text-cyan-400">~</span>
 : <span className="text-rose-400/80">✗</span>}
 </div>
 <div className="sm:col-span-1 sm:text-center font-bold">
 <span className="text-gray-400 font-normal sm:hidden">ChatGPT:</span>{" "}
 {!r.chatgpt_checked
 ? <span className="text-gray-600">—</span>
 : r.chatgpt_brand_cited
 ? <span className="text-emerald-400 text-sm">✓</span>
 : r.chatgpt_brand_mentioned
 ? <span className="text-cyan-400">~</span>
 : <span className="text-rose-400/80">✗</span>}
 </div>
 </div>

 <div className="sm:col-span-3 flex items-center gap-2">
 <span className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-mono font-bold border ${gap.badge}`}>
 <StatusDot color={gap.dot} />
 <span className={gap.color}>{gap.label}</span>
 </span>
 </div>
 <div className="sm:col-span-1 sm:text-right font-mono text-gray-500">
 {new Date(r.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
 </div>
 </div>
 );
 })}
 </div>

 {/* Pagination */}
 {totalPages > 1 && (
 <div className="flex items-center justify-between pt-2 border-t border-white/[0.05]">
 <span className="text-xs font-mono text-gray-400">Page {page} of {totalPages}</span>
 <div className="flex gap-2">
 {page > 1 && (
 <Link
 href={`/dashboard/clients/${id}/results?page=${page - 1}&track=${trackFilter ?? "all"}`}
 className="inline-flex items-center gap-1 rounded-[20px] border border-white/10 bg-[#121215] hover:bg-card/[0.06] px-3.5 py-1.5 text-xs font-mono font-bold text-gray-300 transition-all"
 >
 <ChevronLeft size={14} /> Prev
 </Link>
 )}
 {page < totalPages && (
 <Link
 href={`/dashboard/clients/${id}/results?page=${page + 1}&track=${trackFilter ?? "all"}`}
 className="inline-flex items-center gap-1 rounded-[20px] border border-white/10 bg-[#121215] hover:bg-card/[0.06] px-3.5 py-1.5 text-xs font-mono font-bold text-gray-300 transition-all"
 >
 Next <ChevronRight size={14} />
 </Link>
 )}
 </div>
 </div>
 )}
 </>
 )}
 </div>
 );
}
