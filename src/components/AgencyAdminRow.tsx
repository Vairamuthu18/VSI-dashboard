"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { isValidDomain } from "@/lib/url-input";

interface Client {
 id: string;
 name: string;
 brand_name: string | null;
 website: string | null;
 service_type: string;
}

interface Agency {
 id: string;
 name: string;
 slug: string;
 is_pilot: boolean;
 is_disabled?: boolean;
 max_clients: number | null;
 max_keywords: number;
 created_at: string;
}

interface Props {
 agency: Agency;
 clients: Client[];
 clientCount: number;
 keywordCount: number;
}

export default function AgencyAdminRow({ agency, clients, clientCount, keywordCount }: Props) {
 const router = useRouter();
 const [, startTransition] = useTransition();
 const [open, setOpen] = useState(false);
 const [editing, setEditing] = useState(false);
 const [saving, setSaving] = useState(false);
 const [err, setErr] = useState<string | null>(null);
 const [maxClients, setMaxClients] = useState<string>(agency.max_clients == null ? "" : String(agency.max_clients));
 const [maxKeywords, setMaxKeywords] = useState<string>(String(agency.max_keywords));
 const [isPilot, setIsPilot] = useState<boolean>(agency.is_pilot);

 async function save() {
 setSaving(true);
 setErr(null);
 try {
 const body: Record<string, unknown> = {
 max_clients: maxClients.trim() === "" ? null : Number(maxClients),
 max_keywords: Number(maxKeywords),
 is_pilot: isPilot,
 };
 const res = await fetch(`/api/admin/agencies/${agency.id}`, {
 method: "PATCH",
 headers: { "Content-Type": "application/json" },
 body: JSON.stringify(body),
 });
 const data = await res.json().catch(() => ({})) as { error?: string };
 if (!res.ok) {
 setErr(data.error ?? "Failed to save");
 return;
 }
 setEditing(false);
 startTransition(() => router.refresh());
 } finally {
 setSaving(false);
 }
 }

 async function toggleDisable() {
 const next = !agency.is_disabled;
 if (next && !confirm(`Disable ${agency.name}? Every user in this agency loses access until you re-enable.`)) return;
 setSaving(true);
 try {
 const res = await fetch(`/api/admin/agencies/${agency.id}`, {
 method: "PATCH",
 headers: { "Content-Type": "application/json" },
 body: JSON.stringify({ is_disabled: next }),
 });
 if (res.ok) startTransition(() => router.refresh());
 } finally {
 setSaving(false);
 }
 }

 async function remove() {
 if (!confirm(`Permanently delete ${agency.name}? This removes the agency, its clients, keywords, snapshots, reports, and tasks. Cannot be undone.`)) return;
 setSaving(true);
 try {
 const res = await fetch(`/api/admin/agencies/${agency.id}`, { method: "DELETE" });
 if (res.ok) startTransition(() => router.refresh());
 } finally {
 setSaving(false);
 }
 }

 return (
 <div className="rounded-[20px] border border-gray-200 bg-card overflow-hidden">
 {/* Header row */}
 <button
 onClick={() => setOpen((v) => !v)}
 className="w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-gray-50 transition-colors"
 >
 <span className="shrink-0 h-9 w-9 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-sm">
 {agency.name.charAt(0).toUpperCase()}
 </span>
 <div className="flex-1 min-w-0">
 <div className="flex items-center gap-2 flex-wrap">
 <p className="text-sm font-semibold text-gray-900 truncate">{agency.name}</p>
 {agency.is_pilot ? (
 <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700 uppercase tracking-wider">
 Pilot
 </span>
 ) : (
 <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700 uppercase tracking-wider">
 Paid
 </span>
 )}
 </div>
 <p className="text-[11px] text-gray-500 mt-0.5 truncate">{agency.slug}</p>
 </div>
 <div className="hidden sm:flex items-center gap-5 text-xs text-gray-500">
 <div className="text-center">
 <p className="font-semibold text-gray-800">{clientCount}{agency.max_clients != null && <span className="text-gray-400">/{agency.max_clients}</span>}</p>
 <p className="text-[10px] uppercase tracking-wider">Clients</p>
 </div>
 <div className="text-center">
 <p className="font-semibold text-gray-800">{keywordCount}<span className="text-gray-400">/{agency.max_keywords}</span></p>
 <p className="text-[10px] uppercase tracking-wider">Keywords</p>
 </div>
 <div className="text-center min-w-[60px]">
 <p className="text-[11px] text-gray-500">{new Date(agency.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</p>
 <p className="text-[10px] uppercase tracking-wider">Created</p>
 </div>
 </div>
 <svg className={`shrink-0 h-4 w-4 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.06l3.71-3.83a.75.75 0 111.08 1.04l-4.25 4.39a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z" clipRule="evenodd"/></svg>
 </button>

 {open && (
 <div className="border-t border-gray-200 bg-gray-50 px-4 py-4 space-y-4">
 {/* Danger zone — disable + delete */}
 <div className="rounded-lg bg-card border border-gray-200 p-3">
 <div className="flex items-center justify-between gap-3 flex-wrap">
 <div className="min-w-0">
 <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Access</p>
 <p className="text-[11px] text-gray-500 mt-0.5">
 {agency.is_disabled
 ? "Disabled — every user in this agency is locked out until re-enabled."
 : "Active — users can sign in and use the workspace."}
 </p>
 </div>
 <div className="flex items-center gap-2">
 <button
 onClick={toggleDisable}
 disabled={saving}
 className={`rounded-md border px-2.5 py-1 text-[11px] font-semibold transition-colors disabled:opacity-50 ${
 agency.is_disabled
 ? "border-green-300 bg-green-50 text-green-700 hover:bg-green-100"
 : "border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100"
 }`}
 >
 {agency.is_disabled ? "Re-enable" : "Disable"}
 </button>
 <button
 onClick={remove}
 disabled={saving}
 className="rounded-md border border-red-300 bg-card px-2.5 py-1 text-[11px] font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50 transition-colors"
 >
 Delete agency
 </button>
 </div>
 </div>
 </div>

 {/* Plan controls */}
 <div className="rounded-lg bg-card border border-gray-200 p-3">
 <div className="flex items-center justify-between mb-3">
 <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Plan</p>
 {editing ? (
 <div className="flex items-center gap-2">
 <button onClick={save} disabled={saving} className="rounded-md bg-amber-500 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-amber-600 transition-colors disabled:opacity-50">
 {saving ? "Saving…" : "Save"}
 </button>
 <button onClick={() => { setEditing(false); setErr(null); }} className="text-[11px] text-gray-500 hover:text-gray-700">Cancel</button>
 </div>
 ) : (
 <button onClick={() => setEditing(true)} className="text-[11px] text-amber-700 hover:text-amber-800 font-semibold">Edit</button>
 )}
 </div>

 {editing ? (
 <>
 <div className="grid grid-cols-2 gap-3">
 <label className="block">
 <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">Max clients (blank = unlimited)</span>
 <input
 type="number" min={0}
 value={maxClients}
 onChange={(e) => setMaxClients(e.target.value)}
 placeholder="Unlimited"
 className="w-full rounded-md border border-gray-300 px-2.5 py-1.5 text-sm"
 />
 </label>
 <label className="block">
 <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">Max keywords</span>
 <input
 type="number" min={0}
 value={maxKeywords}
 onChange={(e) => setMaxKeywords(e.target.value)}
 className="w-full rounded-md border border-gray-300 px-2.5 py-1.5 text-sm"
 />
 </label>
 </div>
 <label className="mt-3 flex items-center gap-2 text-xs text-gray-700">
 <input type="checkbox" checked={isPilot} onChange={(e) => setIsPilot(e.target.checked)} className="rounded border-gray-300" />
 Pilot account
 </label>
 {err && <p className="mt-2 text-xs text-red-700">{err}</p>}
 </>
 ) : (
 <div className="grid grid-cols-3 gap-3 text-xs">
 <div>
 <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Max clients</p>
 <p className="text-sm font-semibold text-gray-900 mt-0.5">{agency.max_clients ?? "Unlimited"}</p>
 </div>
 <div>
 <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Max keywords</p>
 <p className="text-sm font-semibold text-gray-900 mt-0.5">{agency.max_keywords}</p>
 </div>
 <div>
 <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Account type</p>
 <p className="text-sm font-semibold text-gray-900 mt-0.5">{agency.is_pilot ? "Pilot" : "Paid"}</p>
 </div>
 </div>
 )}
 </div>

 {/* Clients */}
 <div className="rounded-lg bg-card border border-gray-200 p-3">
 <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">Clients ({clients.length})</p>
 {clients.length === 0 ? (
 <p className="text-xs text-gray-500">No clients yet.</p>
 ) : (
 <div className="space-y-1.5">
 {clients.map((c) => {
 const websiteOk = !!c.website && isValidDomain(c.website);
 return (
 <div
 key={c.id}
 className="flex items-center justify-between gap-2 rounded-md px-2.5 py-2 hover:bg-gray-50 transition-colors"
 >
 <div className="min-w-0">
 <p className="text-xs font-semibold text-gray-900 truncate">
 {c.brand_name ?? c.name}
 {!c.brand_name && (
 <span className="ml-1.5 text-[10px] font-normal text-amber-600" title="No brand name set — using client name as fallback">⚠ no brand</span>
 )}
 </p>
 <p className={`text-[11px] truncate ${websiteOk ? "text-gray-500" : "text-red-600 font-medium"}`}>
 {c.website || "— no website —"}
 {!websiteOk && <span className="ml-1.5 text-[10px]" title="Stored value is not a valid domain. Have the agency re-enter the website to fix citation detection.">⚠ invalid</span>}
 </p>
 </div>
 <div className="shrink-0 flex items-center gap-1.5">
 <span className="text-[10px] uppercase tracking-wider rounded bg-gray-100 text-gray-600 px-1.5 py-0.5 font-bold">{c.service_type}</span>
 <Link
 href={`/admin/clients/${c.id}`}
 className="rounded border border-amber-300 bg-amber-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-700 hover:bg-amber-100 transition-colors"
 title="Configure engines (super-admin only)"
 >Engines</Link>
 <Link
 href={`/dashboard/clients/${c.id}`}
 className="rounded border border-gray-300 bg-card px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-gray-700 hover:bg-gray-50 transition-colors"
 >Open →</Link>
 </div>
 </div>
 );
 })}
 </div>
 )}
 </div>
 </div>
 )}
 </div>
 );
}
