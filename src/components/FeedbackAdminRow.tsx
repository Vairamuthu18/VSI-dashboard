"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

const CATEGORY_META: Record<string, { label: string; emoji: string; chip: string }> = {
 bug: { label: "Bug", emoji: "🐞", chip: "bg-red-900/30 text-red-400" },
 idea: { label: "Idea", emoji: "💡", chip: "bg-amber-900/30 text-amber-400" },
 question: { label: "Question", emoji: "❓", chip: "bg-blue-900/30 text-blue-400" },
 praise: { label: "Praise", emoji: "🙌", chip: "bg-green-900/30 text-green-400" },
 general: { label: "Other", emoji: "✍️", chip: "bg-[#1C1C1E] text-gray-400" },
};

const STATUS_OPTIONS = ["new", "triaged", "in_progress", "done", "archived"] as const;

interface RowProps {
 row: {
 id: string;
 category: string;
 message: string;
 status: string;
 page_url: string | null;
 admin_notes: string | null;
 created_at: string;
 agency_name: string;
 user_name: string | null;
 };
}

export default function FeedbackAdminRow({ row }: RowProps) {
 const router = useRouter();
 const [pending, startTransition] = useTransition();
 const [saving, setSaving] = useState(false);
 const [status, setStatus] = useState(row.status);
 const [notes, setNotes] = useState(row.admin_notes ?? "");
 const [editingNotes, setEditingNotes] = useState(false);

 const cat = CATEGORY_META[row.category] ?? CATEGORY_META.general;

 async function patch(body: Record<string, unknown>) {
 setSaving(true);
 try {
 const res = await fetch(`/api/admin/feedback/${row.id}`, {
 method: "PATCH",
 headers: { "Content-Type": "application/json" },
 body: JSON.stringify(body),
 });
 if (res.ok) startTransition(() => router.refresh());
 } finally {
 setSaving(false);
 }
 }

 async function setStatusValue(s: string) {
 setStatus(s);
 await patch({ status: s });
 }

 async function saveNotes() {
 await patch({ admin_notes: notes });
 setEditingNotes(false);
 }

 return (
 <div className="rounded-[20px] border border-[#333] bg-[#1C1C1E] p-4 text-white">
 <div className="flex items-start gap-3">
 <div className={`shrink-0 h-9 w-9 rounded-lg flex items-center justify-center text-base ${cat.chip}`}>
 {cat.emoji}
 </div>
 <div className="flex-1 min-w-0">
 <div className="flex items-baseline gap-2 flex-wrap">
 <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${cat.chip}`}>{cat.label}</span>
 <span className="text-sm font-semibold text-white">{row.agency_name}</span>
 {row.user_name && <span className="text-xs text-gray-400">· {row.user_name}</span>}
 <span className="text-[11px] text-gray-500">
 · {new Date(row.created_at).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
 </span>
 </div>
 <p className="mt-2 text-sm text-gray-200 leading-relaxed whitespace-pre-line">{row.message}</p>
 {row.page_url && (
 <p className="mt-1.5 text-[11px] text-gray-400">From: <code className="bg-[#2C2C2E] px-1 rounded">{row.page_url}</code></p>
 )}

 {/* Admin controls */}
 <div className="mt-3 flex flex-wrap items-center gap-2">
 <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Status</span>
 <div className="flex items-center gap-1">
 {STATUS_OPTIONS.map((s) => (
 <button
 key={s}
 onClick={() => setStatusValue(s)}
 disabled={saving || s === status}
 className={`rounded-md px-2 py-0.5 text-[11px] font-semibold capitalize transition-colors ${
 s === status
 ? "bg-[#FF4500] text-white"
 : "border border-[#333] text-gray-400 hover:bg-[#2C2C2E] hover:text-white"
 }`}
 >
 {s.replace("_", " ")}
 </button>
 ))}
 </div>
 </div>

 <div className="mt-2">
 {editingNotes ? (
 <div className="space-y-1.5">
 <textarea
 value={notes}
 onChange={(e) => setNotes(e.target.value)}
 rows={2}
 placeholder="Admin-only notes…"
 className="w-full rounded-md border border-[#333] bg-[#111111] text-white px-2.5 py-1.5 text-xs focus:ring-2 focus:ring-[#FF4500] focus:border-transparent resize-none"
 />
 <div className="flex items-center gap-2">
 <button onClick={saveNotes} disabled={saving} className="rounded-md bg-[#FF4500] px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-[#E03E00] transition-colors">Save</button>
 <button onClick={() => { setEditingNotes(false); setNotes(row.admin_notes ?? ""); }} className="text-[11px] text-gray-400 hover:text-gray-200">Cancel</button>
 </div>
 </div>
 ) : (
 <button
 onClick={() => setEditingNotes(true)}
 className="text-[11px] text-[#FF4500] hover:text-[#E03E00] transition-colors"
 >
 {row.admin_notes ? "Edit admin notes" : "+ Add admin notes"}
 </button>
 )}
 {!editingNotes && row.admin_notes && (
 <p className="mt-1 rounded-md bg-[#111111] border border-[#333] px-2.5 py-1.5 text-[11px] text-gray-300 whitespace-pre-line">{row.admin_notes}</p>
 )}
 </div>
 </div>
 </div>
 {pending && <div className="mt-2 h-0.5 w-full bg-[#FF4500]/50 animate-pulse rounded" />}
 </div>
 );
}
