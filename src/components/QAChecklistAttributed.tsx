"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { QASection } from "@/lib/qa-checklist";

type Status = "todo" | "pass" | "fail" | "skipped";

interface SavedCheck { status: string; notes: string | null; updated_at: string }

interface Props {
 sections: QASection[];
 tester: { id: string; name: string };
 initialChecks: Record<string, SavedCheck>;
}

const STATUS_META: Record<Status, { label: string; cls: string }> = {
 todo: { label: "—", cls: "bg-gray-100 text-gray-500" },
 pass: { label: "Pass", cls: "bg-green-500 text-white" },
 fail: { label: "Fail", cls: "bg-red-500 text-white" },
 skipped: { label: "Skipped", cls: "bg-gray-400 text-white" },
};

export default function QAChecklistAttributed({ sections, tester, initialChecks }: Props) {
 const router = useRouter();
 const [, startTransition] = useTransition();
 const [checks, setChecks] = useState(initialChecks);
 const [savingKey, setSavingKey] = useState<string | null>(null);

 async function setStatus(itemKey: string, status: Status, notes?: string) {
 setSavingKey(itemKey);
 setChecks((prev) => ({
 ...prev,
 [itemKey]: { status, notes: notes ?? prev[itemKey]?.notes ?? null, updated_at: new Date().toISOString() },
 }));
 try {
 await fetch("/api/qa/check", {
 method: "POST",
 headers: { "Content-Type": "application/json" },
 body: JSON.stringify({ item_key: itemKey, status, notes: notes ?? checks[itemKey]?.notes ?? null }),
 });
 } finally {
 setSavingKey(null);
 }
 }

 async function setNotes(itemKey: string, notes: string) {
 const existingStatus = (checks[itemKey]?.status as Status) ?? "todo";
 await setStatus(itemKey, existingStatus, notes);
 }

 async function signOut() {
 await fetch("/api/qa/login", { method: "DELETE" });
 startTransition(() => router.refresh());
 }

 // Aggregate counts
 const totals = sections.flatMap((s) => s.tests).reduce(
 (acc, t) => {
 const status = (checks[t.id]?.status as Status) ?? "todo";
 acc[status]++;
 acc.total++;
 return acc;
 },
 { total: 0, todo: 0, pass: 0, fail: 0, skipped: 0 } as Record<string, number>,
 );

 return (
 <div className="space-y-5">
 {/* Header / signed-in strip */}
 <div className="rounded-[20px] border border-gray-200 bg-card p-4 flex flex-wrap items-center justify-between gap-3">
 <div className="flex items-center gap-3">
 <span className="inline-flex h-9 w-9 rounded-full bg-amber-100 text-amber-700 font-bold items-center justify-center text-sm">
 {tester.name.charAt(0).toUpperCase()}
 </span>
 <div>
 <p className="text-sm font-semibold text-gray-900">Signed in as {tester.name}</p>
 <p className="text-[11px] text-gray-500">Your checks save to the server automatically and attribute to you.</p>
 </div>
 </div>
 <div className="flex items-center gap-3 text-xs">
 <div className="text-right">
 <p className="text-gray-700"><span className="font-bold text-green-700">{totals.pass}</span> pass · <span className="font-bold text-red-700">{totals.fail}</span> fail · {totals.skipped} skipped · {totals.todo} pending</p>
 <p className="text-[11px] text-gray-500">{totals.total} total</p>
 </div>
 <button
 onClick={signOut}
 className="rounded-md border border-gray-300 bg-card px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
 >Sign out</button>
 </div>
 </div>

 {/* Sections */}
 {sections.map((s) => (
 <details key={s.id} open className="group rounded-[20px] border border-gray-200 bg-card [&_summary::-webkit-details-marker]:hidden">
 <summary className="px-5 py-3 cursor-pointer list-none flex items-center justify-between gap-3">
 <div>
 <p className="text-sm font-bold text-gray-900">{s.title}</p>
 {s.description && <p className="text-[11px] text-gray-500 mt-0.5">{s.description}</p>}
 </div>
 <span className="text-[11px] text-gray-500">{s.tests.length} tests</span>
 </summary>
 <div className="border-t border-gray-200 divide-y divide-gray-100">
 {s.tests.map((t) => {
 const current = (checks[t.id]?.status as Status) ?? "todo";
 return (
 <div key={t.id} className="px-5 py-3">
 <div className="flex items-start gap-3">
 <span className="shrink-0 text-[11px] font-mono text-gray-400 w-12">{t.id}</span>
 <div className="flex-1 min-w-0">
 <p className="text-sm text-gray-900">{t.label}</p>
 {t.hint && <p className="text-[11px] text-gray-500 mt-0.5">{t.hint}</p>}
 {checks[t.id]?.notes && (
 <p className="mt-1.5 rounded-md bg-amber-50 border border-amber-200 px-2 py-1 text-[11px] text-amber-900 leading-relaxed">
 {checks[t.id].notes}
 </p>
 )}
 </div>
 <div className="shrink-0 flex flex-wrap items-center gap-1 self-start">
 {(["pass", "fail", "skipped"] as Status[]).map((s) => (
 <button
 key={s}
 onClick={() => setStatus(t.id, s)}
 disabled={savingKey === t.id}
 className={`rounded-md px-2 py-1 text-[11px] font-bold transition-colors ${
 current === s ? STATUS_META[s].cls : "border border-gray-200 text-gray-500 hover:bg-gray-50"
 }`}
 >
 {STATUS_META[s].label}
 </button>
 ))}
 <button
 onClick={() => {
 const note = window.prompt("Add a note (optional):", checks[t.id]?.notes ?? "");
 if (note !== null) setNotes(t.id, note);
 }}
 className="rounded-md border border-gray-200 bg-card px-2 py-1 text-[11px] text-gray-500 hover:bg-gray-50 transition-colors"
 title="Add a note"
 >+ Note</button>
 </div>
 </div>
 </div>
 );
 })}
 </div>
 </details>
 ))}
 </div>
 );
}
