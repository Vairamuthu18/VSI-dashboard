"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function InviteCreator() {
 const router = useRouter();
 const [email, setEmail] = useState("");
 const [note, setNote] = useState("");
 const [role, setRole] = useState<"pilot" | "super_admin">("pilot");
 const [maxKeywords, setMaxKeywords] = useState(10);
 const [submitting, setSubmitting] = useState(false);
 const [created, setCreated] = useState<{ code: string } | null>(null);
 const [error, setError] = useState<string | null>(null);

 async function handleCreate(e: React.FormEvent) {
 e.preventDefault();
 setSubmitting(true);
 setError(null);
 setCreated(null);

 const res = await fetch("/api/admin/invites", {
 method: "POST",
 headers: { "Content-Type": "application/json" },
 body: JSON.stringify({
 email: email.trim() || null,
 note: note.trim() || null,
 role,
 max_keywords: role === "super_admin" ? 999999 : maxKeywords,
 }),
 });

 setSubmitting(false);

 if (!res.ok) {
 const data = await res.json().catch(() => ({}));
 setError(data.error ?? "Failed to create invite");
 return;
 }

 const data = await res.json() as { code: string };
 setCreated(data);
 setEmail("");
 setNote("");
 router.refresh();
 }

 return (
 <div className="rounded-[20px] border border-[#333] bg-[#1C1C1E] p-5">
 <p className="text-sm font-medium text-white mb-3">Generate invite code</p>

 {created && (
 <div className="mb-4 rounded-lg bg-green-900/30 border border-green-800 px-4 py-3">
 <p className="text-xs text-green-400">New invite created — share this code:</p>
 <p className="font-mono text-lg font-bold text-green-300 tracking-wider mt-1">{created.code}</p>
 </div>
 )}

 {error && (
 <div className="mb-4 rounded-lg bg-red-900/30 border border-red-800 px-3 py-2 text-sm text-red-400">{error}</div>
 )}

 <form onSubmit={handleCreate} className="grid grid-cols-12 gap-3 items-end">
 <div className="col-span-4">
 <label className="block text-xs text-gray-500 mb-1">Email (optional)</label>
 <input
 type="email"
 value={email}
 onChange={(e) => setEmail(e.target.value)}
 placeholder="lock to one address"
 className="w-full rounded-lg border border-[#333] bg-[#111111] px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-[#FF4500] focus:outline-none"
 />
 </div>
 <div className="col-span-3">
 <label className="block text-xs text-gray-500 mb-1">Note</label>
 <input
 type="text"
 value={note}
 onChange={(e) => setNote(e.target.value)}
 placeholder="who is this for?"
 className="w-full rounded-lg border border-[#333] bg-[#111111] px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-[#FF4500] focus:outline-none"
 />
 </div>
 <div className="col-span-2">
 <label className="block text-xs text-gray-500 mb-1">Role</label>
 <select
 value={role}
 onChange={(e) => setRole(e.target.value as "pilot" | "super_admin")}
 className="w-full rounded-lg border border-[#333] bg-[#111111] px-3 py-2 text-sm text-white focus:border-[#FF4500] focus:outline-none"
 >
 <option value="pilot">Pilot</option>
 <option value="super_admin">Super Admin</option>
 </select>
 </div>
 <div className="col-span-1">
 <label className="block text-xs text-gray-500 mb-1">Max KW</label>
 <input
 type="number"
 min={1}
 value={maxKeywords}
 disabled={role === "super_admin"}
 onChange={(e) => setMaxKeywords(parseInt(e.target.value, 10) || 10)}
 className="w-full rounded-lg border border-[#333] bg-[#111111] px-2 py-2 text-sm text-white focus:border-[#FF4500] focus:outline-none disabled:opacity-50"
 />
 </div>
 <div className="col-span-2">
 <button
 type="submit"
 disabled={submitting}
 className="w-full rounded-lg bg-[#FF4500] px-4 py-2 text-sm font-semibold text-white hover:bg-[#E03E00] disabled:opacity-50 transition-colors"
 >
 {submitting ? "Generating..." : "Generate"}
 </button>
 </div>
 </form>
 </div>
 );
}
