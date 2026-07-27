"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function QALogin() {
 const router = useRouter();
 const [code, setCode] = useState("");
 const [loading, setLoading] = useState(false);
 const [err, setErr] = useState<string | null>(null);

 async function submit(e: React.FormEvent) {
 e.preventDefault();
 setLoading(true);
 setErr(null);
 try {
 const res = await fetch("/api/qa/login", {
 method: "POST",
 headers: { "Content-Type": "application/json" },
 body: JSON.stringify({ code: code.trim() }),
 });
 const data = await res.json().catch(() => ({})) as { tester?: { id: string; name: string }; error?: string };
 if (!res.ok || !data.tester) {
 setErr(data.error ?? "Couldn't sign in");
 setLoading(false);
 return;
 }
 router.refresh();
 } catch (e) {
 setErr(e instanceof Error ? e.message : "Network error");
 setLoading(false);
 }
 }

 return (
 <div className="max-w-sm mx-auto rounded-[20px] border border-gray-200 bg-card p-6 shadow-sm">
 <h2 className="text-base font-semibold text-gray-900">Sign in as tester</h2>
 <p className="text-xs text-gray-500 mt-1">Enter the code your admin gave you.</p>
 <form onSubmit={submit} className="mt-5 space-y-3">
 <input
 type="text"
 value={code}
 onChange={(e) => setCode(e.target.value)}
 placeholder="e.g. 1122"
 autoComplete="off"
 autoFocus
 className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-base font-mono tracking-widest text-center focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
 />
 {err && <p className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">{err}</p>}
 <button
 type="submit"
 disabled={loading || !code.trim()}
 className="w-full rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-600 disabled:opacity-50 transition-colors"
 >
 {loading ? "Checking…" : "Continue"}
 </button>
 </form>
 </div>
 );
}
