"use client";

import { useState } from "react";

interface EngineResult {
 status: number;
 tookMs: number;
 creditsUsed: number;
 expanded?: boolean;
 bodyExcerpt: {
 ai_overview?: unknown;
 text_blocks?: unknown;
 references?: unknown;
 reconstructed_markdown?: unknown;
 error?: string;
 search_metadata?: { status?: string };
 };
 error?: string;
}

interface TestResponse {
 keyword: string;
 gl: string;
 hl: string;
 ai_mode: EngineResult;
}

function summarise(r: EngineResult): { label: string; tone: "ok" | "empty" | "fail" } {
 if (r.error) return { label: `error: ${r.error}`, tone: "fail" };
 if (r.status >= 400) return { label: `HTTP ${r.status}`, tone: "fail" };

 const b = r.bodyExcerpt;
 const blocks = Array.isArray(b.text_blocks) ? b.text_blocks.length : 0;
 const refs = Array.isArray(b.references) ? b.references.length : 0;
 if (blocks === 0 && refs === 0) return { label: "no AI Mode data for this query", tone: "empty" };
 return { label: `${blocks} blocks · ${refs} references`, tone: "ok" };
}

export default function TestSerpApiClient() {
 const [keyword, setKeyword] = useState("");
 const [gl, setGl] = useState("ae");
 const [hl, setHl] = useState("en");
 const [loading, setLoading] = useState(false);
 const [error, setError] = useState<string | null>(null);
 const [result, setResult] = useState<TestResponse | null>(null);

 async function run(e: React.FormEvent) {
 e.preventDefault();
 if (!keyword.trim()) return;
 setLoading(true);
 setError(null);
 setResult(null);
 try {
 const res = await fetch("/api/admin/test-serpapi", {
 method: "POST",
 headers: { "Content-Type": "application/json" },
 body: JSON.stringify({ keyword: keyword.trim(), gl, hl }),
 });
 if (!res.ok) {
 const data = await res.json().catch(() => ({}));
 setError(data.error ?? `HTTP ${res.status}`);
 } else {
 setResult(await res.json());
 }
 } catch (e) {
 setError(e instanceof Error ? e.message : "Request failed");
 } finally {
 setLoading(false);
 }
 }

 const toneClass: Record<"ok" | "empty" | "fail", string> = {
 ok: "bg-green-900/30 border-green-800 text-green-400",
 empty: "bg-yellow-900/30 border-yellow-800 text-yellow-400",
 fail: "bg-red-900/30 border-red-800 text-red-400",
 };

 const cards = result
 ? [
 {
 key: "ai_mode" as const,
 data: result.ai_mode,
 title: "AI Mode response",
 subtitle: "engine=google_ai_mode — the production signal every Run Now uses",
 },
 ]
 : [];

 return (
 <div className="space-y-5 text-white">
 <form onSubmit={run} className="rounded-[20px] border border-[#333] bg-[#1C1C1E] p-5 text-white">
 <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
 <div className="sm:col-span-7">
 <label className="block text-xs text-gray-400 mb-1">Query</label>
 <input
 type="text"
 value={keyword}
 onChange={(e) => setKeyword(e.target.value)}
 placeholder="best seo agency dubai"
 className="w-full rounded-lg border border-[#333] bg-[#111111] px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-[#FF4500] focus:outline-none"
 />
 </div>
 <div className="sm:col-span-2">
 <label className="block text-xs text-gray-400 mb-1">gl</label>
 <input
 type="text"
 value={gl}
 onChange={(e) => setGl(e.target.value)}
 className="w-full rounded-lg border border-[#333] bg-[#111111] px-3 py-2 text-sm text-white focus:border-[#FF4500] focus:outline-none"
 />
 </div>
 <div className="sm:col-span-2">
 <label className="block text-xs text-gray-400 mb-1">hl</label>
 <input
 type="text"
 value={hl}
 onChange={(e) => setHl(e.target.value)}
 className="w-full rounded-lg border border-[#333] bg-[#111111] px-3 py-2 text-sm text-white focus:border-[#FF4500] focus:outline-none"
 />
 </div>
 <div className="sm:col-span-1 flex items-end">
 <button
 type="submit"
 disabled={loading || !keyword.trim()}
 className="w-full rounded-lg bg-[#FF4500] px-3 py-2 text-sm font-semibold text-white hover:bg-[#E03E00] disabled:opacity-50"
 >
 {loading ? "..." : "Test"}
 </button>
 </div>
 </div>
 <p className="text-xs text-gray-500 mt-2">
 Burns 1 SerpApi credit per test. Same query within 1h is free (SerpApi cache).
 </p>
 </form>

 {error && (
 <div className="rounded-lg border border-red-800 bg-red-900/30 px-4 py-3 text-sm text-red-400">{error}</div>
 )}

 {result && (
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
 {cards.map(({ key, data, title, subtitle }) => {
 const s = summarise(data);
 return (
 <div key={key} className="rounded-[20px] border border-[#333] bg-[#1C1C1E] p-5 text-white">
 <div className="flex items-start justify-between gap-3 mb-3">
 <div>
 <p className="text-sm font-semibold text-white">{title}</p>
 <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>
 </div>
 <div className="text-right shrink-0 text-xs text-gray-500">
 <p>{data.tookMs}ms · HTTP {data.status || "—"}</p>
 <p className="mt-0.5 text-[#FF4500] font-medium">{data.creditsUsed} credit{data.creditsUsed !== 1 ? "s" : ""}</p>
 </div>
 </div>
 <div className={`rounded-lg border px-3 py-2 text-xs font-medium mb-3 ${toneClass[s.tone]}`}>
 {s.label}
 </div>
 <pre className="text-xs text-gray-300 bg-[#111111] border border-[#333] rounded-lg p-3 overflow-x-auto max-h-96 overflow-y-auto font-mono">
 {JSON.stringify(data.bodyExcerpt, null, 2)}
 </pre>
 </div>
 );
 })}
 </div>
 )}
 </div>
 );
}
