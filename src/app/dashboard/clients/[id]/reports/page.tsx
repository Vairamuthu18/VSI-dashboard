import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireAgency } from "@/lib/auth";
import GenerateReportButton from "@/components/GenerateReportButton";
import { Sparkles, ArrowLeft, ExternalLink, FileText } from "lucide-react";

export default async function ClientReportsPage({ params }: { params: Promise<{ id: string }> }) {
 const { id } = await params;
 const supabase = await createClient();
 const session = await requireAgency();

 const isSuperAdmin = session.role === "super_admin";
 const clientQ = supabase.from("clients").select("id, name").eq("id", id);
 const { data: client } = await (isSuperAdmin ? clientQ : clientQ.eq("agency_id", session.agencyId)).single();
 if (!client) notFound();

 const reportsQ = supabase
 .from("reports")
 .select("id, type, share_token, generated_at, expires_at, tracked_keyword_id, tracked_keywords(keyword)")
 .eq("client_id", id)
 .order("generated_at", { ascending: false })
 .limit(50);
 const { data: reports } = await (isSuperAdmin ? reportsQ : reportsQ.eq("agency_id", session.agencyId));

 const TYPE_LABEL: Record<string, string> = {
 weekly: "Weekly Snapshot Report",
 keyword_summary: "Keyword · Executive Summary",
 keyword_detailed: "Keyword · Detailed Diagnostic",
 keyword_tasks: "Keyword · Task Execution Log",
 };

 const rows = (reports ?? []).map((r) => {
 const kw = (r.tracked_keywords as unknown as { keyword: string }[] | { keyword: string } | null);
 const keyword = Array.isArray(kw) ? kw[0]?.keyword : kw?.keyword;
 return { ...r, _keyword: keyword ?? null, _label: TYPE_LABEL[r.type as string] ?? r.type };
 });

 return (
 <div className="p-4 sm:p-8 max-w-6xl mx-auto space-y-6">
 <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/[0.05] pb-6">
 <div>
 <div className="flex items-center gap-2 mb-1.5 text-xs font-mono text-gray-500">
 <Link href={`/dashboard/clients/${id}`} className="hover:text-amber-400 transition-colors flex items-center gap-1">
 <ArrowLeft size={13} />
 <span>{client.name}</span>
 </Link>
 <span className="text-gray-600">/</span>
 <span className="text-white font-bold">Branded Reports</span>
 </div>
 <h1 className="text-2xl font-heading font-black text-white tracking-tight">Executive Intelligence Reports</h1>
 <p className="text-xs font-mono text-gray-400 mt-1 max-w-2xl">
 Snapshot AI visibility and rank tracking into shareable, white-labeled client briefs. Reports can be exported directly as high-resolution PDFs.
 </p>
 </div>
 <GenerateReportButton clientId={id} />
 </div>

 {rows.length === 0 ? (
 <div className="rounded-[20px] border border-dashed border-white/15 bg-[#121215] p-16 text-center shadow-2xl">
 <FileText size={36} className="text-amber-500 mx-auto mb-4 animate-pulse" />
 <p className="text-lg font-heading font-bold text-white mb-1">No Reports Generated Yet</p>
 <p className="text-xs text-gray-400 max-w-md mx-auto">
 Click &ldquo;Generate Report&rdquo; above to build your first shareable AI & search intelligence overview.
 </p>
 </div>
 ) : (
 <div className="rounded-[20px] border border-white/[0.08] bg-[#121215] overflow-hidden shadow-2xl">
 <div className="hidden sm:grid grid-cols-12 gap-3 px-6 py-3.5 bg-black/40 text-xs font-mono font-bold text-gray-400 uppercase tracking-wider border-b border-white/[0.06]">
 <div className="col-span-4">Report Type</div>
 <div className="col-span-3">Generated Date</div>
 <div className="col-span-3">Public Share Link</div>
 <div className="col-span-2 text-right">Actions</div>
 </div>
 {rows.map((r) => {
 const shareUrl = `/r/${r.share_token}`;
 return (
 <div
 key={r.id}
 className="border-t border-white/[0.05] hover:bg-card/[0.04] transition-all px-6 py-4 text-xs flex flex-col gap-2 sm:grid sm:grid-cols-12 sm:gap-3 sm:items-center"
 >
 <div className="sm:col-span-4 min-w-0">
 <p className="text-sm font-heading font-bold text-white">{r._label}</p>
 {r._keyword && <p className="text-xs font-mono text-amber-400/80 truncate mt-0.5">&ldquo;{r._keyword}&rdquo;</p>}
 </div>
 <div className="sm:col-span-3 font-mono text-gray-400">
 {new Date(r.generated_at).toLocaleDateString("en-GB", {
 day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit"
 })}
 </div>
 <div className="sm:col-span-3 min-w-0">
 <Link href={shareUrl} className="text-cyan-400 hover:text-cyan-300 transition-colors font-mono truncate flex items-center gap-1.5">
 <span>{shareUrl}</span>
 <ExternalLink size={12} className="shrink-0" />
 </Link>
 </div>
 <div className="sm:col-span-2 sm:text-right flex sm:justify-end gap-2">
 <Link
 href={shareUrl}
 target="_blank"
 className="inline-flex items-center gap-1.5 rounded-[20px] border border-white/10 bg-card/[0.03] hover:bg-card/[0.08] px-3.5 py-1.5 text-xs font-mono font-bold text-gray-300 hover:text-white transition-all"
 >
 <span>View Report</span>
 <ExternalLink size={12} />
 </Link>
 </div>
 </div>
 );
 })}
 </div>
 )}
 </div>
 );
}
