import Link from "next/link";
import { DEFAULT_PROMPTS, getSavedPrompt, type PromptKey } from "@/lib/prompts";

export const dynamic = "force-dynamic";

export default async function PromptsListPage() {
 const keys = Object.keys(DEFAULT_PROMPTS) as PromptKey[];
 const rows = await Promise.all(
 keys.map(async (key) => {
 const def = DEFAULT_PROMPTS[key];
 const saved = await getSavedPrompt(key);
 return { def, saved };
 })
 );

 return (
 <div className="p-4 sm:p-8 max-w-4xl space-y-4 text-white">
 <div>
 <h1 className="text-xl font-semibold text-white">Prompts</h1>
 <p className="text-xs text-gray-400 mt-1">
 Edit the LLM prompts that power AI Brief and Citation Strategy without redeploying. If a saved override is broken or removed, the system falls back to the hardcoded default automatically — the pipeline never breaks because of a prompt edit.
 </p>
 </div>

 <div className="space-y-3">
 {rows.map(({ def, saved }) => (
 <Link
 key={def.key}
 href={`/admin/prompts/${def.key}`}
 className="block rounded-[20px] border border-[#333] bg-[#1C1C1E] p-4 hover:bg-[#2C2C2E] transition-colors"
 >
 <div className="flex items-start justify-between gap-3">
 <div className="flex-1 min-w-0">
 <div className="flex items-center gap-2 flex-wrap">
 <p className="text-sm font-semibold text-white">{def.title}</p>
 {saved ? (
 <span className="rounded-full bg-[#FF4500]/20 px-2 py-0.5 text-[10px] font-semibold text-[#FF4500] uppercase tracking-wider">Override active</span>
 ) : (
 <span className="rounded-full bg-[#111111] border border-[#333] px-2 py-0.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Default</span>
 )}
 </div>
 <p className="text-xs text-gray-400 mt-1 leading-relaxed">{def.description}</p>
 {saved && (
 <p className="text-xs text-gray-500 mt-1.5">
 Last edited {new Date(saved.updated_at).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
 </p>
 )}
 </div>
 <span className="text-xs text-gray-500 shrink-0">Edit →</span>
 </div>
 </Link>
 ))}
 </div>
 </div>
 );
}
