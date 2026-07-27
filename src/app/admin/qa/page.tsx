import { createClient } from "@/lib/supabase/server";
import { requireSuperAdmin } from "@/lib/auth";
import { QA_SECTIONS } from "@/lib/qa-checklist";

export const dynamic = "force-dynamic";

interface CheckRow {
 tester_id: string;
 tester_name: string;
 item_key: string;
 status: string;
 notes: string | null;
 updated_at: string;
}

export default async function AdminQAPage() {
 await requireSuperAdmin();
 const supabase = await createClient();
 const { data } = await supabase.rpc("qa_all_checks_admin");
 const rows = (data ?? []) as CheckRow[];

 // index by tester → item
 const byTester = new Map<string, { name: string; items: Map<string, CheckRow> }>();
 for (const r of rows) {
 if (!byTester.has(r.tester_id)) {
 byTester.set(r.tester_id, { name: r.tester_name, items: new Map() });
 }
 byTester.get(r.tester_id)!.items.set(r.item_key, r);
 }

 const allItems = QA_SECTIONS.flatMap((s) => s.tests.map((t) => ({ section: s.title, id: t.id, label: t.label })));

 const statusChip = (s: string | undefined) =>
 s === "pass" ? "bg-green-600 text-white" :
 s === "fail" ? "bg-red-600 text-white" :
 s === "skipped" ? "bg-gray-600 text-white" :
 "bg-[#111111] border border-[#333] text-gray-500";

 return (
 <div className="p-4 sm:p-8 max-w-6xl space-y-6 text-white">
 <div>
 <h1 className="text-xl font-semibold text-white">QA progress</h1>
 <p className="text-xs text-gray-400 mt-1">
 Per-tester status for every checklist item. Each tester signs in at <code className="bg-[#1C1C1E] border border-[#333] px-1 rounded">/qa</code> with their code; their changes save server-side and show up here.
 </p>
 </div>

 {byTester.size === 0 ? (
 <div className="rounded-[20px] border border-dashed border-[#333] p-10 text-center">
 <p className="text-sm text-gray-400">No QA submissions yet.</p>
 </div>
 ) : (
 <>
 <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
 {Array.from(byTester.entries()).map(([id, t]) => {
 const items = Array.from(t.items.values());
 const pass = items.filter((i) => i.status === "pass").length;
 const fail = items.filter((i) => i.status === "fail").length;
 return (
 <div key={id} className="rounded-[20px] border border-[#333] bg-[#1C1C1E] p-4 text-white">
 <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{t.name}</p>
 <p className="text-2xl font-bold text-white mt-1">{items.length}</p>
 <p className="text-[11px] text-gray-500 mt-1">
 <span className="text-green-400 font-semibold">{pass} pass</span> · <span className="text-red-400 font-semibold">{fail} fail</span>
 </p>
 </div>
 );
 })}
 </div>

 <div className="rounded-[20px] border border-[#333] bg-[#111111] overflow-hidden">
 <div className="grid grid-cols-12 gap-2 px-4 py-2.5 bg-[#1C1C1E] text-xs text-gray-400 font-medium border-b border-[#333]">
 <div className="col-span-1">ID</div>
 <div className="col-span-5">Test</div>
 {Array.from(byTester.entries()).map(([id, t]) => (
 <div key={id} className="col-span-3 text-center">{t.name}</div>
 ))}
 </div>
 {allItems.map((it) => (
 <div key={it.id} className="grid grid-cols-12 gap-2 px-4 py-2 border-b border-[#333] last:border-0 text-xs items-center">
 <div className="col-span-1 font-mono text-gray-500">{it.id}</div>
 <div className="col-span-5 text-gray-300">{it.label}</div>
 {Array.from(byTester.entries()).map(([id, t]) => {
 const row = t.items.get(it.id);
 return (
 <div key={id} className="col-span-3 flex justify-center">
 <span
 className={`rounded px-2 py-0.5 text-[10px] font-semibold ${statusChip(row?.status)}`}
 title={row?.notes ?? ""}
 >
 {row?.status ?? "—"}
 </span>
 </div>
 );
 })}
 </div>
 ))}
 </div>
 </>
 )}
 </div>
 );
}
