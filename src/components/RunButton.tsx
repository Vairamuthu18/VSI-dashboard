"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { RunResult } from "@/lib/run-pipeline";
import { Sparkles, Play, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";

interface Props {
 clientId: string;
 keywordCount: number;
 keywordIds?: string[]; // optional: run subset only
}

type RunState = "idle" | "running" | "done" | "error";

export default function RunButton({ clientId, keywordCount, keywordIds }: Props) {
 const router = useRouter();
 const [state, setState] = useState<RunState>("idle");
 const [result, setResult] = useState<RunResult | null>(null);
 const [error, setError] = useState<string | null>(null);

 async function handleRun() {
 if (state === "running" || keywordCount === 0) return;
 setState("running");
 setResult(null);
 setError(null);

 try {
 const res = await fetch("/api/run-client", {
 method: "POST",
 headers: { "Content-Type": "application/json" },
 body: JSON.stringify({ client_id: clientId, keyword_ids: keywordIds }),
 });

 const data = await res.json();

 if (!res.ok) {
 throw new Error(data.error ?? "Run failed");
 }

 setResult(data as RunResult);
 setState("done");
 // Refresh page data to show new results
 router.refresh();
 } catch (err) {
 setError(err instanceof Error ? err.message : "Run failed");
 setState("error");
 }
 }

 function reset() {
 setState("idle");
 setResult(null);
 setError(null);
 }

 if (state === "running") {
 return (
 <div className="flex items-center gap-2.5 rounded-[20px] border border-amber-500/40 bg-[#121215] px-4 py-2 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
 <RefreshCw size={14} className="text-amber-400 animate-spin" />
 <span className="text-xs font-mono font-bold text-amber-300 uppercase tracking-wider">
 Running {keywordCount} KW...
 </span>
 </div>
 );
 }

 if (state === "done" && result) {
 return (
 <div className="flex items-center gap-2">
 <div className="flex items-center gap-2 rounded-[20px] border border-emerald-500/40 bg-emerald-500/10 px-3.5 py-1.5 shadow-[0_0_12px_rgba(16,185,129,0.25)]">
 <CheckCircle2 size={14} className="text-emerald-400" />
 <span className="text-xs font-mono font-bold text-emerald-300">
 {result.completed} Done
 {result.failed > 0 && <span className="text-rose-400 ml-1.5">· {result.failed} Failed</span>}
 </span>
 </div>
 <button
 onClick={reset}
 className="rounded-[20px] border border-white/10 bg-card/[0.03] hover:bg-card/[0.08] px-3 py-1.5 text-xs font-mono text-gray-300 hover:text-white transition-all"
 title="Run pipeline again"
 >
 Run Again
 </button>
 </div>
 );
 }

 if (state === "error") {
 return (
 <div className="flex items-center gap-2">
 <div className="flex items-center gap-2 rounded-[20px] border border-rose-500/40 bg-rose-500/10 px-3.5 py-1.5 text-xs text-rose-300 font-mono">
 <AlertCircle size={14} className="text-rose-400 shrink-0" />
 <span>{error}</span>
 </div>
 <button
 onClick={reset}
 className="rounded-[20px] border border-white/10 bg-card/[0.03] hover:bg-card/[0.08] px-3 py-1.5 text-xs font-mono text-gray-300 hover:text-white transition-all"
 >
 Retry
 </button>
 </div>
 );
 }

 return (
 <button
 onClick={handleRun}
 disabled={keywordCount === 0}
 className="group flex items-center gap-2 rounded-[20px] bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 px-4 py-2 text-xs font-mono font-bold text-black shadow-[0_0_20px_rgba(245,158,11,0.35)] hover:shadow-[0_0_25px_rgba(245,158,11,0.55)] disabled:opacity-40 disabled:cursor-not-allowed transition-all scale-100 hover:scale-[1.02] active:scale-[0.98]"
 title="Trigger AI Scan & Citation Diagnostics"
 >
 <Play size={13} className="fill-black text-black group-hover:scale-110 transition-transform" />
 <span>RUN SCAN</span>
 {keywordCount > 0 && (
 <span className="rounded-full bg-black/20 border border-black/10 px-2 py-0.5 text-[10px] font-black text-black">
 {keywordCount}
 </span>
 )}
 </button>
 );
}
