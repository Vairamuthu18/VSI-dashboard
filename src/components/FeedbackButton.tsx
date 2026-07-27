"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { MessageSquarePlus } from "lucide-react";

type Category = "bug" | "idea" | "question" | "praise" | "general";

const OPTIONS: { value: Category; label: string; emoji: string; helper: string }[] = [
 { value: "bug", label: "Bug", emoji: "🐞", helper: "Something is broken or behaves unexpectedly" },
 { value: "idea", label: "Idea", emoji: "💡", helper: "A feature or improvement you'd like" },
 { value: "question", label: "Question", emoji: "❓", helper: "How does something work?" },
 { value: "praise", label: "Praise", emoji: "🙌", helper: "Something you like — we read these too" },
 { value: "general", label: "Other", emoji: "✍️", helper: "Anything else" },
];

export default function FeedbackButton() {
 const pathname = usePathname();
 const [open, setOpen] = useState(false);
 const [category, setCategory] = useState<Category>("idea");
 const [message, setMessage] = useState("");
 const [saving, setSaving] = useState(false);
 const [err, setErr] = useState<string | null>(null);
 const [success, setSuccess] = useState(false);

 function close() {
 if (saving) return;
 setOpen(false);
 setErr(null);
 if (success) {
 setMessage("");
 setSuccess(false);
 }
 }

 async function submit() {
 if (saving) return;
 if (message.trim().length < 4) { setErr("Write a few words first"); return; }
 setSaving(true); setErr(null);
 try {
 const res = await fetch("/api/feedback", {
 method: "POST",
 headers: { "Content-Type": "application/json" },
 body: JSON.stringify({
 category,
 message,
 page_url: typeof window !== "undefined" ? window.location.pathname : null,
 }),
 });
 const data = await res.json().catch(() => ({})) as { error?: string };
 if (!res.ok) {
 setErr(data.error ?? "Failed to submit");
 return;
 }
 setSuccess(true);
 // Auto-close after a beat
 setTimeout(() => { setOpen(false); setMessage(""); setSuccess(false); }, 1600);
 } catch (e) {
 setErr(e instanceof Error ? e.message : "Network error");
 } finally {
 setSaving(false);
 }
 }

 return (
 <>
 {/* Bottom-left floating launcher — clear of the bottom-right chat icon */}
 {!open && (
 <button
 onClick={() => setOpen(true)}
 aria-label="Send feedback"
 className="fixed bottom-6 left-6 z-40 group inline-flex items-center gap-2 rounded-full bg-card border border-gray-300 pl-3 pr-4 py-2.5 text-gray-700 shadow-lg hover:shadow-xl hover:border-amber-400 hover:text-amber-700 hover:-translate-y-0.5 transition-all"
 >
 <span className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-100 text-amber-700 group-hover:bg-amber-500 group-hover:text-white transition-colors">
 <MessageSquarePlus size={15} strokeWidth={2.25} />
 </span>
 <span className="text-sm font-semibold whitespace-nowrap">Feedback</span>
 </button>
 )}

 {open && (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" onClick={close}>
 <div
 className="w-full max-w-md rounded-[20px] bg-card shadow-2xl border border-gray-200 overflow-hidden"
 onClick={(e) => e.stopPropagation()}
 >
 <div className="px-5 py-3.5 border-b border-gray-200 flex items-center justify-between">
 <div>
 <h2 className="text-base font-semibold text-gray-900">Send feedback</h2>
 <p className="text-[11px] text-gray-500 mt-0.5">{pathname}</p>
 </div>
 <button onClick={close} aria-label="Close" className="h-7 w-7 rounded hover:bg-gray-100 flex items-center justify-center text-gray-500">✕</button>
 </div>

 <div className="px-5 py-4 space-y-3">
 {success ? (
 <div className="rounded-[20px] bg-green-50 border border-green-200 p-4 text-center">
 <p className="text-sm font-semibold text-green-800">Thanks — we got it.</p>
 <p className="text-xs text-green-700 mt-1">We read every piece of feedback during the pilot.</p>
 </div>
 ) : (
 <>
 <div>
 <p className="text-xs font-semibold text-gray-700 mb-1.5">What kind of feedback?</p>
 <div className="grid grid-cols-5 gap-1">
 {OPTIONS.map((o) => (
 <button
 key={o.value}
 onClick={() => setCategory(o.value)}
 className={`flex flex-col items-center justify-center rounded-lg border px-1 py-2 transition-colors ${
 category === o.value
 ? "border-amber-400 bg-amber-50"
 : "border-gray-200 bg-card hover:bg-gray-50"
 }`}
 >
 <span className="text-lg leading-none">{o.emoji}</span>
 <span className={`mt-1 text-[10px] font-semibold ${category === o.value ? "text-amber-800" : "text-gray-600"}`}>{o.label}</span>
 </button>
 ))}
 </div>
 <p className="text-[11px] text-gray-500 mt-1.5">{OPTIONS.find((o) => o.value === category)?.helper}</p>
 </div>

 <div>
 <label className="block">
 <span className="block text-xs font-semibold text-gray-700 mb-1">Tell us what you saw / what you want</span>
 <textarea
 value={message}
 onChange={(e) => setMessage(e.target.value)}
 placeholder={
 category === "bug" ? "What did you do, what did you expect, what actually happened?"
 : category === "idea" ? "Describe the workflow this would help with…"
 : "Type as much detail as you like — we read it."
 }
 rows={5}
 maxLength={5000}
 className="w-full rounded-md border border-gray-300 px-2.5 py-1.5 text-sm focus:ring-2 focus:ring-amber-400 focus:border-transparent resize-none"
 />
 </label>
 <p className="text-[11px] text-gray-400 mt-0.5">{message.length}/5000</p>
 </div>

 {err && <p className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">{err}</p>}
 </>
 )}
 </div>

 {!success && (
 <div className="px-5 py-3 border-t border-gray-200 bg-gray-50 flex items-center justify-end gap-2">
 <button onClick={close} disabled={saving} className="rounded-lg border border-gray-300 bg-card px-3 py-1.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">Cancel</button>
 <button onClick={submit} disabled={saving} className="rounded-lg bg-amber-500 px-4 py-1.5 text-sm font-semibold text-white hover:bg-amber-600 disabled:opacity-50 transition-colors">
 {saving ? "Sending…" : "Send feedback"}
 </button>
 </div>
 )}
 </div>
 </div>
 )}
 </>
 );
}
