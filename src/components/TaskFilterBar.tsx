"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback } from "react";

interface Props {
 counts: { all: number; todo: number; in_progress: number; done: number };
 groups: Array<{ value: string; label: string }>;
 owners: Array<{ value: string; label: string }>;
}

export default function TaskFilterBar({ counts, groups, owners }: Props) {
 const router = useRouter();
 const pathname = usePathname();
 const params = useSearchParams();

 const setParam = useCallback((key: string, value: string | null) => {
 const next = new URLSearchParams(Array.from(params.entries()));
 if (value === null || value === "") next.delete(key);
 else next.set(key, value);
 const qs = next.toString();
 router.push(qs ? `${pathname}?${qs}` : pathname);
 }, [params, pathname, router]);

 const status = params.get("status") ?? "open";
 const group = params.get("group") ?? "";
 const owner = params.get("owner") ?? "";

 const statusChips = [
 { value: "open", label: "Open", count: counts.todo + counts.in_progress },
 { value: "todo", label: "To do", count: counts.todo },
 { value: "in_progress", label: "In progress", count: counts.in_progress },
 { value: "done", label: "Done", count: counts.done },
 { value: "all", label: "All", count: counts.all },
 ];

 return (
 <div className="space-y-3">
 {/* Status row */}
 <div className="flex flex-wrap items-center gap-1.5">
 {statusChips.map((s) => (
 <button
 key={s.value}
 onClick={() => setParam("status", s.value === "open" ? null : s.value)}
 className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
 status === s.value
 ? "bg-amber-500 text-white"
 : "bg-gray-100 text-gray-700 hover:bg-gray-200"
 }`}
 >
 {s.label}
 <span className="ml-1.5 opacity-75">({s.count})</span>
 </button>
 ))}
 </div>

 {/* Secondary filters */}
 <div className="flex flex-wrap items-center gap-2 text-xs">
 <select
 value={group}
 onChange={(e) => setParam("group", e.target.value || null)}
 className="rounded-md border border-gray-300 bg-card px-2.5 py-1.5 text-xs text-gray-700 focus:ring-2 focus:ring-amber-400 focus:border-transparent"
 >
 <option value="">All groups</option>
 {groups.map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}
 </select>

 <select
 value={owner}
 onChange={(e) => setParam("owner", e.target.value || null)}
 className="rounded-md border border-gray-300 bg-card px-2.5 py-1.5 text-xs text-gray-700 focus:ring-2 focus:ring-amber-400 focus:border-transparent"
 >
 <option value="">All owners</option>
 {owners.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
 </select>

 {(group || owner) && (
 <button
 onClick={() => { setParam("group", null); setParam("owner", null); }}
 className="text-gray-500 hover:text-gray-900 transition-colors"
 >
 Clear filters
 </button>
 )}
 </div>
 </div>
 );
}
