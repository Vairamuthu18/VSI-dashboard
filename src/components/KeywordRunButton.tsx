"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
 clientId: string;
 keywordId: string;
}

export default function KeywordRunButton({ clientId, keywordId }: Props) {
 const router = useRouter();
 const [running, setRunning] = useState(false);
 const [done, setDone] = useState(false);
 const [error, setError] = useState<string | null>(null);
 const [summary, setSummary] = useState<string | null>(null);

 async function handleRun() {
 if (running) return;
 setRunning(true);
 setDone(false);
 setError(null);
 setSummary(null);

 try {
 const res = await fetch("/api/run-client", {
 method: "POST",
 headers: { "Content-Type": "application/json" },
 body: JSON.stringify({ client_id: clientId, keyword_ids: [keywordId] }),
 });
 const data = await res.json().catch(() => ({}));
 if (!res.ok) {
 setError(data.error ?? `Run failed (${res.status})`);
 return;
 }
 // /api/run-client returns { total, completed, failed, results: [...] }
 const completed = data.completed ?? 0;
 const failed = data.failed ?? 0;
 const firstErr = data.results?.find((r: { status: string; error?: string }) => r.status === "error")?.error;
 if (completed > 0) {
 setDone(true);
 setSummary(failed > 0 ? `Captured (${failed} sub-step failed)` : null);
 router.refresh();
 setTimeout(() => { setDone(false); setSummary(null); }, 5000);
 } else {
 setError(firstErr ?? "Server captured no data. Use 'Run with Browser' for brand or low-volume queries.");
 }
 } catch (e) {
 setError(e instanceof Error ? e.message : "Network error");
 } finally {
 setRunning(false);
 }
 }

 if (running) {
 return (
 <div className="flex items-center gap-2 rounded-lg border border-amber-300 bg-amber-50 px-4 py-2">
 <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
 <span className="text-sm text-amber-700 font-medium">Running...</span>
 </div>
 );
 }

 if (done) {
 return (
 <div className="rounded-lg border border-green-300 bg-green-50 px-4 py-2 text-sm font-medium text-green-700">
 ✓ Snapshot captured{summary ? ` — ${summary}` : ""}
 </div>
 );
 }

 return (
 <div className="flex flex-col items-end gap-1.5">
 <button
 onClick={handleRun}
 className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 transition-colors"
 >
 <span>▶</span>
 Re-run this keyword
 </button>
 {error && <div className="text-xs text-red-600 max-w-xs text-right">{error}</div>}
 </div>
 );
}
