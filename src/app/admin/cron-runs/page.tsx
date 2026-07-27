import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function CronRunsPage() {
 const supabase = await createClient();
 const { data: runs } = await supabase
 .from("cron_runs")
 .select("id, started_at, finished_at, clients_processed, keywords_processed, errors")
 .order("started_at", { ascending: false })
 .limit(50);

 const rows = runs ?? [];

 return (
 <div className="p-4 sm:p-8 max-w-5xl text-white">
 <div className="mb-6">
 <h1 className="text-xl font-semibold text-white">Cron history</h1>
 <p className="text-xs text-gray-400 mt-1">Last 50 automatic runs of <code className="text-[#FF4500]">/api/cron/run-due-clients</code>. Useful for verifying the scheduler is firing and spotting failing clients.</p>
 </div>

 {rows.length === 0 ? (
 <div className="rounded-[20px] border border-dashed border-[#333] p-10 text-center">
 <p className="text-sm text-gray-400">No cron runs yet.</p>
 <p className="text-xs text-gray-500 mt-1">Configure the Coolify scheduled task to hit the cron endpoint hourly.</p>
 </div>
 ) : (
 <div className="rounded-[20px] border border-[#333] bg-[#111111] overflow-hidden">
 <div className="hidden sm:grid grid-cols-12 gap-2 px-4 py-2.5 bg-[#1C1C1E] border-b border-[#333] text-xs text-gray-400 font-medium">
 <div className="col-span-3">Started</div>
 <div className="col-span-2">Duration</div>
 <div className="col-span-2 text-center">Clients</div>
 <div className="col-span-2 text-center">Keywords</div>
 <div className="col-span-3">Errors</div>
 </div>
 {rows.map((r) => {
 const start = new Date(r.started_at);
 const end = r.finished_at ? new Date(r.finished_at) : null;
 const durationMs = end ? end.getTime() - start.getTime() : null;
 const duration = durationMs != null
 ? durationMs < 1000
 ? `${durationMs}ms`
 : `${Math.round(durationMs / 1000)}s`
 : "running…";

 return (
 <div key={r.id} className="border-b border-[#333] last:border-0 px-4 py-3 text-xs flex flex-col gap-1.5 sm:grid sm:grid-cols-12 sm:gap-2 sm:items-center">
 <div className="sm:col-span-3 text-white font-medium">
 {start.toLocaleDateString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
 </div>
 <div className="sm:col-span-2 text-gray-400">{duration}</div>
 <div className="sm:col-span-2 sm:text-center">
 <span className="text-gray-500 sm:hidden">Clients: </span>
 <span className="text-white font-medium">{r.clients_processed ?? 0}</span>
 </div>
 <div className="sm:col-span-2 sm:text-center">
 <span className="text-gray-500 sm:hidden">Keywords: </span>
 <span className="text-white font-medium">{r.keywords_processed ?? 0}</span>
 </div>
 <div className="sm:col-span-3 text-xs">
 {(r.errors?.length ?? 0) === 0 ? (
 <span className="text-green-400">No errors</span>
 ) : (
 <details>
 <summary className="cursor-pointer text-red-400">
 {r.errors!.length} error{r.errors!.length !== 1 ? "s" : ""}
 </summary>
 <ul className="mt-1 space-y-0.5 list-disc list-inside text-gray-400">
 {r.errors!.map((e: string, i: number) => (
 <li key={i} className="truncate" title={e}>{e}</li>
 ))}
 </ul>
 </details>
 )}
 </div>
 </div>
 );
 })}
 </div>
 )}
 </div>
 );
}
