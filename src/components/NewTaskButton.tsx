"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { TaskGroup, TaskOwner, TaskEffort, TaskImpact } from "@/lib/tasks";

interface Props {
 clientId: string;
 trackedKeywordId?: string | null;
 label?: string;
 // Optional list of clients so we can show a picker on the agency-wide view.
 clientOptions?: { id: string; name: string }[];
}

const GROUPS: TaskGroup[] = ["Content", "Technical", "Off-page"];
const OWNERS: TaskOwner[] = ["Writer", "Developer", "SEO", "Outreach"];
const EFFORTS: TaskEffort[] = ["S", "M", "L"];
const IMPACTS: TaskImpact[] = ["low", "medium", "high"];

export default function NewTaskButton({
 clientId, trackedKeywordId = null, label = "+ New task", clientOptions,
}: Props) {
 const router = useRouter();
 const [pending, startTransition] = useTransition();
 const [open, setOpen] = useState(false);
 const [saving, setSaving] = useState(false);
 const [err, setErr] = useState<string | null>(null);

 const [title, setTitle] = useState("");
 const [group, setGroup] = useState<TaskGroup>("Content");
 const [owner, setOwner] = useState<TaskOwner | "">("");
 const [effort, setEffort] = useState<TaskEffort | "">("");
 const [impact, setImpact] = useState<TaskImpact | "">("");
 const [description, setDescription] = useState("");
 const [acceptanceText, setAcceptanceText] = useState("");
 const [dueDate, setDueDate] = useState("");
 const [selectedClientId, setSelectedClientId] = useState(clientId);

 function reset() {
 setTitle(""); setGroup("Content"); setOwner(""); setEffort(""); setImpact("");
 setDescription(""); setAcceptanceText(""); setDueDate("");
 setErr(null);
 }

 async function submit() {
 if (!title.trim()) { setErr("Title is required"); return; }
 if (!selectedClientId) { setErr("Pick a client"); return; }
 setSaving(true); setErr(null);
 try {
 const acceptance = acceptanceText
 .split("\n")
 .map((l) => l.trim())
 .filter(Boolean)
 .map((text) => ({ text, done: false }));

 const res = await fetch("/api/tasks", {
 method: "POST",
 headers: { "Content-Type": "application/json" },
 body: JSON.stringify({
 client_id: selectedClientId,
 tracked_keyword_id: trackedKeywordId,
 title: title.trim(),
 group_name: group,
 owner: owner || null,
 effort: effort || null,
 impact: impact || null,
 description: description.trim() || null,
 acceptance,
 due_date: dueDate || null,
 }),
 });
 const data = await res.json().catch(() => ({})) as { error?: string };
 if (!res.ok) {
 setErr(data.error ?? "Failed to create task");
 return;
 }
 setOpen(false); reset();
 startTransition(() => router.refresh());
 } catch (e) {
 setErr(e instanceof Error ? e.message : "Network error");
 } finally {
 setSaving(false);
 }
 }

 return (
 <>
 <button
 onClick={() => setOpen(true)}
 className="rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-600 transition-colors"
 >
 {label}
 </button>

 {open && (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" onClick={() => !saving && setOpen(false)}>
 <div
 className="w-full max-w-lg rounded-[20px] bg-card shadow-2xl border border-gray-200 overflow-hidden"
 onClick={(e) => e.stopPropagation()}
 >
 <div className="px-5 py-3.5 border-b border-gray-200 flex items-center justify-between">
 <h2 className="text-base font-semibold text-gray-900">New task</h2>
 <button
 onClick={() => !saving && setOpen(false)}
 aria-label="Close"
 className="h-7 w-7 rounded hover:bg-gray-100 flex items-center justify-center text-gray-500"
 >✕</button>
 </div>

 <div className="px-5 py-4 space-y-3 max-h-[70vh] overflow-y-auto">
 {clientOptions && clientOptions.length > 0 && (
 <Field label="Client">
 <select
 value={selectedClientId}
 onChange={(e) => setSelectedClientId(e.target.value)}
 className="w-full rounded-md border border-gray-300 bg-card px-2.5 py-1.5 text-sm focus:ring-2 focus:ring-amber-400 focus:border-transparent"
 >
 {clientOptions.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
 </select>
 </Field>
 )}

 <Field label="Title" required>
 <input
 value={title}
 onChange={(e) => setTitle(e.target.value)}
 placeholder="e.g. Publish 'Best GEO Agencies in Dubai' listicle"
 className="w-full rounded-md border border-gray-300 px-2.5 py-1.5 text-sm focus:ring-2 focus:ring-amber-400 focus:border-transparent"
 />
 </Field>

 <div className="grid grid-cols-2 gap-3">
 <Field label="Group">
 <select value={group} onChange={(e) => setGroup(e.target.value as TaskGroup)}
 className="w-full rounded-md border border-gray-300 bg-card px-2.5 py-1.5 text-sm">
 {GROUPS.map((g) => <option key={g} value={g}>{g}</option>)}
 </select>
 </Field>
 <Field label="Owner">
 <select value={owner} onChange={(e) => setOwner(e.target.value as TaskOwner | "")}
 className="w-full rounded-md border border-gray-300 bg-card px-2.5 py-1.5 text-sm">
 <option value="">—</option>
 {OWNERS.map((o) => <option key={o} value={o}>{o}</option>)}
 </select>
 </Field>
 </div>

 <div className="grid grid-cols-3 gap-3">
 <Field label="Effort">
 <select value={effort} onChange={(e) => setEffort(e.target.value as TaskEffort | "")}
 className="w-full rounded-md border border-gray-300 bg-card px-2.5 py-1.5 text-sm">
 <option value="">—</option>
 {EFFORTS.map((x) => <option key={x} value={x}>{x}</option>)}
 </select>
 </Field>
 <Field label="Impact">
 <select value={impact} onChange={(e) => setImpact(e.target.value as TaskImpact | "")}
 className="w-full rounded-md border border-gray-300 bg-card px-2.5 py-1.5 text-sm">
 <option value="">—</option>
 {IMPACTS.map((x) => <option key={x} value={x}>{x}</option>)}
 </select>
 </Field>
 <Field label="Due date">
 <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)}
 className="w-full rounded-md border border-gray-300 px-2.5 py-1.5 text-sm" />
 </Field>
 </div>

 <Field label="Description">
 <textarea
 value={description}
 onChange={(e) => setDescription(e.target.value)}
 rows={3}
 placeholder="What needs doing and why. Reference real domains/competitors if relevant."
 className="w-full rounded-md border border-gray-300 px-2.5 py-1.5 text-sm focus:ring-2 focus:ring-amber-400 focus:border-transparent resize-none"
 />
 </Field>

 <Field label="Acceptance criteria (one per line)">
 <textarea
 value={acceptanceText}
 onChange={(e) => setAcceptanceText(e.target.value)}
 rows={4}
 placeholder={"Client appears in top 3 of the listicle\nArticle indexed in Bing Webmaster\nFAQ section answers 3 adjacent queries"}
 className="w-full rounded-md border border-gray-300 px-2.5 py-1.5 text-xs focus:ring-2 focus:ring-amber-400 focus:border-transparent resize-none"
 />
 </Field>

 {err && <p className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">{err}</p>}
 </div>

 <div className="px-5 py-3 border-t border-gray-200 bg-gray-50 flex items-center justify-end gap-2">
 <button
 onClick={() => !saving && setOpen(false)}
 disabled={saving}
 className="rounded-lg border border-gray-300 bg-card px-3 py-1.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
 >Cancel</button>
 <button
 onClick={submit}
 disabled={saving || pending}
 className="rounded-lg bg-amber-500 px-4 py-1.5 text-sm font-semibold text-white hover:bg-amber-600 disabled:opacity-50 transition-colors"
 >
 {saving ? "Creating…" : "Create task"}
 </button>
 </div>
 </div>
 </div>
 )}
 </>
 );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
 return (
 <label className="block">
 <span className="block text-xs font-semibold text-gray-700 mb-1">
 {label}{required && <span className="text-red-600">*</span>}
 </span>
 {children}
 </label>
 );
}
