import { createClient } from "@/lib/supabase/server";
import InviteCreator from "@/components/admin/InviteCreator";

export default async function InvitesPage() {
 const supabase = await createClient();

 const { data: invites } = await supabase
 .from("invites")
 .select("id, code, email, role, max_keywords, note, is_active, used_by, used_at, created_at")
 .order("created_at", { ascending: false });

 const rows = invites ?? [];

 return (
 <div className="p-8 max-w-5xl space-y-6 text-white">
 <div>
 <h1 className="text-xl font-semibold text-white">Invites</h1>
 <p className="text-xs text-gray-400 mt-1">Generate codes to onboard pilot users or new admins.</p>
 </div>

 <InviteCreator />

 <div className="rounded-[20px] border border-[#333] overflow-hidden bg-[#111111]">
 <div className="grid grid-cols-12 gap-2 px-4 py-2.5 bg-[#1C1C1E] text-xs text-gray-400 font-medium border-b border-[#333]">
 <div className="col-span-3">Code</div>
 <div className="col-span-3">Email / Note</div>
 <div className="col-span-1">Role</div>
 <div className="col-span-1 text-center">Max KW</div>
 <div className="col-span-2">Status</div>
 <div className="col-span-2 text-right">Created</div>
 </div>
 {rows.length === 0 ? (
 <div className="px-4 py-8 text-center text-sm text-gray-400">No invites yet.</div>
 ) : (
 rows.map((inv) => (
 <div key={inv.id} className="grid grid-cols-12 gap-2 px-4 py-3 border-b border-[#333] last:border-0 items-center text-xs">
 <div className="col-span-3 font-mono text-gray-200">{inv.code}</div>
 <div className="col-span-3 min-w-0">
 <p className="text-gray-200 truncate">{inv.email ?? <span className="text-gray-500">any email</span>}</p>
 {inv.note && <p className="text-gray-400 truncate">{inv.note}</p>}
 </div>
 <div className="col-span-1 capitalize text-gray-300">{inv.role.replace("_", " ")}</div>
 <div className="col-span-1 text-center text-gray-300">{inv.max_keywords}</div>
 <div className="col-span-2">
 {inv.used_by ? (
 <span className="text-gray-500">Used {inv.used_at ? new Date(inv.used_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : ""}</span>
 ) : inv.is_active ? (
 <span className="text-green-400 font-medium">Open</span>
 ) : (
 <span className="text-red-400">Disabled</span>
 )}
 </div>
 <div className="col-span-2 text-right text-gray-400">
 {new Date(inv.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
 </div>
 </div>
 ))
 )}
 </div>
 </div>
 );
}
