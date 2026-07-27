"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function GenerateReportButton({ clientId }: { clientId: string }) {
 const router = useRouter();
 const [loading, setLoading] = useState(false);
 const [error, setError] = useState<string | null>(null);
 const [success, setSuccess] = useState<{ url: string } | null>(null);

 async function generate() {
 if (loading) return;
 setLoading(true);
 setError(null);
 setSuccess(null);
 try {
 const res = await fetch("/api/reports/generate", {
 method: "POST",
 headers: { "Content-Type": "application/json" },
 body: JSON.stringify({ client_id: clientId }),
 });
 const data = await res.json();
 if (!res.ok) {
 setError(data.error ?? "Failed to generate report");
 return;
 }
 setSuccess({ url: data.share_url });
 router.refresh();
 } catch (e) {
 setError(e instanceof Error ? e.message : "Network error");
 } finally {
 setLoading(false);
 }
 }

 return (
 <div className="flex flex-col items-end gap-1.5">
 <button
 onClick={generate}
 disabled={loading}
 className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-600 disabled:opacity-50"
 >
 {loading ? "Generating..." : "+ Generate weekly report"}
 </button>
 {error && <p className="text-xs text-red-600 max-w-xs text-right">{error}</p>}
 {success && (
 <div className="text-xs text-green-700">
 ✓ Report ready —{" "}
 <a href={success.url} target="_blank" rel="noopener noreferrer" className="underline">
 open it
 </a>
 </div>
 )}
 </div>
 );
}
