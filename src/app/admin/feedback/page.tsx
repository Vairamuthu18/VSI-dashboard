import { createClient } from "@/lib/supabase/server";
import { requireSuperAdmin } from "@/lib/auth";
import FeedbackAdminRow from "@/components/FeedbackAdminRow";

export const dynamic = "force-dynamic";

interface SearchParams { status?: string; category?: string }

export default async function AdminFeedbackPage({
 searchParams,
}: {
 searchParams: Promise<SearchParams>;
}) {
 await requireSuperAdmin();
 const sp = await searchParams;
 const supabase = await createClient();

 const { data } = await supabase
 .from("feedback")
 .select("*, agencies(name, display_name), profiles(full_name)")
 .order("created_at", { ascending: false })
 .limit(500);

 type Row = {
 id: string;
 agency_id: string | null;
 user_id: string | null;
 category: string;
 message: string;
 page_url: string | null;
 status: string;
 admin_notes: string | null;
 context_data: unknown;
 user_agent: string | null;
 created_at: string;
 agencies: { name: string | null; display_name: string | null } | { name: string | null; display_name: string | null }[] | null;
 profiles: { full_name: string | null } | { full_name: string | null }[] | null;
 };
 const rows = (data ?? []) as Row[];

 const filtered = rows.filter((r) => {
 if (sp.status && sp.status !== "all" && r.status !== sp.status) return false;
 if (sp.category && r.category !== sp.category) return false;
 return true;
 });

 const counts = {
 all: rows.length,
 new: rows.filter((r) => r.status === "new").length,
 triaged: rows.filter((r) => r.status === "triaged").length,
 done: rows.filter((r) => r.status === "done").length,
 };

 const STATUS_CHIPS: Array<{ value: string; label: string; count: number }> = [
 { value: "all", label: "All", count: counts.all },
 { value: "new", label: "New", count: counts.new },
 { value: "triaged", label: "Triaged", count: counts.triaged },
 { value: "done", label: "Done", count: counts.done },
 ];

 return (
 <div className="p-4 sm:p-8 max-w-5xl space-y-6 text-white">
 <div>
 <h1 className="text-xl font-semibold text-white">User feedback</h1>
 <p className="text-xs text-gray-400 mt-1">
 Everything pilot testers and paid agencies have sent. Update status inline; notes are private to admins.
 </p>
 </div>

 <div className="flex flex-wrap items-center gap-2">
 {STATUS_CHIPS.map((s) => {
 const active = (sp.status ?? "new") === s.value || (!sp.status && s.value === "new");
 const href = s.value === "new" ? "/admin/feedback" : `/admin/feedback?status=${s.value}`;
 return (
 <a
 key={s.value}
 href={href}
 className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
 active ? "bg-[#FF4500] text-white" : "bg-[#1C1C1E] text-gray-400 hover:bg-[#2C2C2E] hover:text-white"
 }`}
 >
 {s.label} <span className="ml-1 opacity-75">({s.count})</span>
 </a>
 );
 })}
 </div>

 {filtered.length === 0 ? (
 <div className="rounded-[20px] border border-dashed border-[#333] p-10 text-center">
 <p className="text-sm text-gray-400">No feedback in this view yet.</p>
 </div>
 ) : (
 <div className="space-y-3">
 {filtered.map((r) => {
 const agency = Array.isArray(r.agencies) ? r.agencies[0] : r.agencies;
 const profile = Array.isArray(r.profiles) ? r.profiles[0] : r.profiles;
 return (
 <FeedbackAdminRow
 key={r.id}
 row={{
 id: r.id,
 category: r.category,
 message: r.message,
 status: r.status,
 page_url: r.page_url,
 admin_notes: r.admin_notes,
 created_at: r.created_at,
 agency_name: agency?.display_name ?? agency?.name ?? "Unknown agency",
 user_name: profile?.full_name ?? null,
 }}
 />
 );
 })}
 </div>
 )}
 </div>
 );
}
