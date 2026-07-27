"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

type Tri = boolean | null;

interface Initial {
 ai_mode_enabled: Tri;
 ai_overview_enabled: Tri;
 rank_tracking_enabled: Tri;
 chatgpt_enabled: Tri;
 llm_mentions_enabled: Tri;
}

interface Props { clientId: string; initial: Initial }

const ENGINES: { key: keyof Initial; label: string; description: string; tag?: string }[] = [
 { key: "rank_tracking_enabled", label: "Google rank tracking",
 description: "Captures the client&rsquo;s organic position in Google search results, plus the top-10 SERP." },
 { key: "ai_mode_enabled", label: "AI Mode citations",
 description: "Google AI Mode answer + ranked citation list. The core visibility signal — default for every client." },
 { key: "ai_overview_enabled", label: "AI Overview", tag: "PREMIUM",
 description: "Google&rsquo;s personalised AI Overview surface. Requires the VSI browser extension for reliable capture. Bill as add-on credits." },
 { key: "chatgpt_enabled", label: "ChatGPT visibility",
 description: "Sends the query to a ChatGPT-class assistant and scans the response for the brand. A second AI surface in the gap calculation." },
 { key: "llm_mentions_enabled", label: "LLM mentions", tag: "BETA",
 description: "Brand mentions across multiple LLMs (Claude, Gemini, Perplexity). Provider-pending — leave off until enabled platform-wide." },
];

function TriToggle({
 value, onChange, label, description, tag,
}: { value: Tri; onChange: (v: Tri) => void; label: string; description: string; tag?: string }) {
 const options: { v: Tri; text: string }[] = [
 { v: null, text: "Default" },
 { v: true, text: "Force ON" },
 { v: false, text: "Force OFF" },
 ];
 return (
 <div className="rounded-[20px] border border-[#333] bg-[#1C1C1E] p-4 text-white">
 <div className="flex items-start justify-between gap-4">
 <div className="flex-1 min-w-0">
 <div className="flex items-baseline gap-2">
 <p className="text-sm font-semibold text-white">{label}</p>
 {tag && (
 <span className="rounded-full bg-[#FF4500]/20 text-[#FF4500] text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5">
 {tag}
 </span>
 )}
 </div>
 <p className="text-xs text-gray-400 mt-1 leading-relaxed" dangerouslySetInnerHTML={{ __html: description }} />
 </div>
 <div className="shrink-0 flex rounded-lg border border-[#333] bg-[#111111] p-0.5">
 {options.map((o) => (
 <button
 key={String(o.v)}
 type="button"
 onClick={() => onChange(o.v)}
 className={`rounded px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap ${
 value === o.v
 ? o.v === true
 ? "bg-green-600 text-white"
 : o.v === false
 ? "bg-red-600 text-white"
 : "bg-[#FF4500] text-white"
 : "text-gray-400 hover:text-white"
 }`}
 >
 {o.text}
 </button>
 ))}
 </div>
 </div>
 </div>
 );
}

export default function AdminClientEnginesForm({ clientId, initial }: Props) {
 const router = useRouter();
 const [, startTransition] = useTransition();
 const [state, setState] = useState<Initial>(initial);
 const [saving, setSaving] = useState(false);
 const [saved, setSaved] = useState(false);
 const [error, setError] = useState<string | null>(null);

 async function save() {
 setSaving(true);
 setError(null);
 setSaved(false);
 try {
 const res = await fetch(`/api/admin/clients/${clientId}/engines`, {
 method: "POST",
 headers: { "Content-Type": "application/json" },
 body: JSON.stringify(state),
 });
 if (!res.ok) {
 const data = await res.json().catch(() => ({}));
 setError(data.error ?? "Failed to save");
 return;
 }
 setSaved(true);
 startTransition(() => router.refresh());
 setTimeout(() => setSaved(false), 3000);
 } finally {
 setSaving(false);
 }
 }

 return (
 <div className="space-y-3">
 <div className="flex items-baseline justify-between gap-2">
 <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Tracking engines</p>
 <p className="text-[11px] text-gray-500">Default = inherit platform default. Force ON / OFF locks the engine for this client only.</p>
 </div>

 {ENGINES.map((e) => (
 <TriToggle
 key={e.key}
 label={e.label}
 description={e.description}
 tag={e.tag}
 value={state[e.key]}
 onChange={(v) => setState((s) => ({ ...s, [e.key]: v }))}
 />
 ))}

 <div className="flex items-center gap-3 pt-2">
 <button
 onClick={save}
 disabled={saving}
 className="rounded-lg bg-[#FF4500] px-4 py-2 text-sm font-semibold text-white hover:bg-[#E03E00] disabled:opacity-50 transition-colors"
 >
 {saving ? "Saving…" : "Save changes"}
 </button>
 {saved && <span className="text-xs text-green-400 font-semibold">Saved · changes apply to the next pipeline run.</span>}
 {error && <span className="text-xs text-red-400">{error}</span>}
 </div>
 </div>
 );
}
