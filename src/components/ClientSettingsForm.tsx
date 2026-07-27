"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Settings, Sliders, Clock, Cpu, MapPin } from "lucide-react";

type Tri = boolean | null;

interface Initial {
 ai_mode_enabled: Tri;
 ai_overview_enabled: Tri;
 rank_tracking_enabled: Tri;
 chatgpt_enabled: Tri;
 llm_mentions_enabled: Tri;
 check_frequency: string;
 brief_model_override: string;
 location_override: string;
}

const FREQUENCIES: { value: string; label: string }[] = [
 { value: "manual", label: "Manual Only" },
 { value: "daily", label: "Daily automated scan" },
 { value: "every_3_days", label: "Every 3 Days" },
 { value: "weekly", label: "Weekly audit" },
];

function TriToggle({
 value,
 onChange,
 label,
 description,
}: {
 value: Tri;
 onChange: (v: Tri) => void;
 label: string;
 description: string;
}) {
 const options: { v: Tri; text: string }[] = [
 { v: null, text: "Inherit" },
 { v: true, text: "On" },
 { v: false, text: "Off" },
 ];
 return (
 <div className="rounded-[20px] border border-white/[0.08] bg-[#121215] p-5 shadow-xl">
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
 <div className="flex-1 min-w-0">
 <p className="text-sm font-heading font-bold text-white">{label}</p>
 <p className="text-xs font-mono text-gray-400 mt-0.5 leading-relaxed">{description}</p>
 </div>
 <div className="shrink-0 flex rounded-[20px] border border-white/10 bg-black/40 p-1">
 {options.map((o) => (
 <button
 key={String(o.v)}
 type="button"
 onClick={() => onChange(o.v)}
 className={`rounded-lg px-3 py-1.5 text-xs font-mono font-bold transition-all ${
 value === o.v
 ? o.v === true
 ? "bg-emerald-500 text-black shadow-[0_0_12px_rgba(16,185,129,0.3)]"
 : o.v === false
 ? "bg-rose-500 text-black shadow-[0_0_12px_rgba(244,63,94,0.3)]"
 : "bg-amber-500 text-black shadow-[0_0_12px_rgba(245,158,11,0.3)]"
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

export default function ClientSettingsForm({ clientId, initial }: { clientId: string; initial: Initial }) {
 const router = useRouter();
 const [state, setState] = useState<Initial>(initial);
 const [saving, setSaving] = useState(false);
 const [saved, setSaved] = useState(false);
 const [error, setError] = useState<string | null>(null);

 async function save() {
 setSaving(true);
 setError(null);
 setSaved(false);
 const res = await fetch(`/api/clients/${clientId}/settings`, {
 method: "POST",
 headers: { "Content-Type": "application/json" },
 body: JSON.stringify({
 ai_mode_enabled: state.ai_mode_enabled,
 ai_overview_enabled: state.ai_overview_enabled,
 rank_tracking_enabled: state.rank_tracking_enabled,
 chatgpt_enabled: state.chatgpt_enabled,
 llm_mentions_enabled: state.llm_mentions_enabled,
 check_frequency: state.check_frequency,
 brief_model_override: state.brief_model_override.trim() || null,
 location_override: state.location_override.trim() || null,
 }),
 });
 setSaving(false);
 if (!res.ok) {
 const data = await res.json().catch(() => ({}));
 setError(data.error ?? "Failed to save");
 return;
 }
 setSaved(true);
 router.refresh();
 setTimeout(() => setSaved(false), 3000);
 }

 const engineRows: { label: string; value: Tri }[] = [
 { label: "Google Rank Tracking", value: state.rank_tracking_enabled },
 { label: "AI Mode Citations", value: state.ai_mode_enabled },
 { label: "AI Overview (AIO Engine)", value: state.ai_overview_enabled },
 { label: "ChatGPT Visibility Audit", value: state.chatgpt_enabled },
 { label: "LLM Brand Mentions", value: state.llm_mentions_enabled },
 ];
 function statusOf(v: Tri): string {
 if (v === true) return "Enabled";
 if (v === false) return "Disabled";
 return "Inherit Default";
 }
 function statusColor(v: Tri): string {
 if (v === true) return "text-emerald-400 bg-emerald-500/10 border-emerald-500/30";
 if (v === false) return "text-gray-400 bg-card/5 border-white/10";
 return "text-amber-400 bg-amber-500/10 border-amber-500/30";
 }

 return (
 <div className="space-y-6">
 {/* Engines Summary */}
 <div className="space-y-3">
 <div className="flex items-baseline justify-between gap-2">
 <p className="text-xs font-heading font-black text-white uppercase tracking-widest flex items-center gap-2">
 <Sliders size={14} className="text-amber-500" />
 <span>Tracking Engines Summary</span>
 </p>
 <p className="text-[11px] font-mono text-gray-500">Managed centrally by VSI Super Administration</p>
 </div>
 <div className="rounded-[20px] border border-white/[0.08] bg-[#121215] divide-y divide-white/[0.05] shadow-xl overflow-hidden">
 {engineRows.map((row) => (
 <div key={row.label} className="flex items-center justify-between gap-3 px-5 py-3.5">
 <p className="text-sm font-heading font-bold text-gray-200">{row.label}</p>
 <span className={`rounded-lg border px-3 py-1 text-[11px] font-mono font-bold uppercase tracking-wider ${statusColor(row.value)}`}>
 {statusOf(row.value)}
 </span>
 </div>
 ))}
 </div>
 </div>

 {/* Automation Frequency */}
 <div className="space-y-3">
 <p className="text-xs font-heading font-black text-white uppercase tracking-widest flex items-center gap-2">
 <Clock size={14} className="text-amber-500" />
 <span>Automation Schedule</span>
 </p>
 <div className="rounded-[20px] border border-white/[0.08] bg-[#121215] p-6 shadow-xl">
 <p className="text-sm font-heading font-bold text-white mb-1">Check Frequency & Cron Schedule</p>
 <p className="text-xs font-mono text-gray-400 mb-4">Select how frequently our AI agents audit keywords and citations automatically for this client.</p>
 <div className="flex flex-wrap gap-2.5">
 {FREQUENCIES.map((f) => {
 const active = state.check_frequency === f.value;
 return (
 <button
 key={f.value}
 type="button"
 onClick={() => setState((s) => ({ ...s, check_frequency: f.value }))}
 className={`rounded-[20px] px-4 py-2 text-xs font-mono font-bold transition-all ${
 active
 ? "bg-gradient-to-r from-amber-500 to-orange-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.35)] scale-105"
 : "border border-white/10 bg-card/[0.03] text-gray-300 hover:text-white hover:bg-card/[0.08]"
 }`}
 >
 {f.label}
 </button>
 );
 })}
 </div>
 </div>
 </div>

 {/* Advanced Overrides */}
 <div className="space-y-3">
 <p className="text-xs font-heading font-black text-white uppercase tracking-widest flex items-center gap-2">
 <Cpu size={14} className="text-amber-500" />
 <span>Advanced Diagnostic Overrides</span>
 </p>
 <div className="rounded-[20px] border border-white/[0.08] bg-[#121215] p-6 space-y-5 shadow-xl">
 <div>
 <label className="block text-xs font-mono font-bold text-gray-300 uppercase tracking-wider mb-2">AI Brief Model Override</label>
 <input
 type="text"
 value={state.brief_model_override}
 onChange={(e) => setState((s) => ({ ...s, brief_model_override: e.target.value }))}
 placeholder="e.g. openrouter/auto · z-ai/glm-4.5-air:free · empty to inherit default"
 className="w-full rounded-[20px] border border-white/10 bg-black/40 px-4 py-3 text-sm font-mono text-white placeholder-gray-600 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500/50"
 />
 <p className="mt-1.5 text-xs font-mono text-gray-500">Override which LLM generates AI Briefs for this specific client. Leave blank to use the agency default.</p>
 </div>
 <div>
 <label className="block text-xs font-mono font-bold text-gray-300 uppercase tracking-wider mb-2">Target Country Code Override (GL)</label>
 <input
 type="text"
 value={state.location_override}
 onChange={(e) => setState((s) => ({ ...s, location_override: e.target.value }))}
 placeholder="e.g. ae · us · uk · empty to use per-keyword location"
 maxLength={4}
 className="w-full rounded-[20px] border border-white/10 bg-black/40 px-4 py-3 text-sm font-mono text-white placeholder-gray-600 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500/50"
 />
 <p className="mt-1.5 text-xs font-mono text-gray-500">Force a specific location code for all checks belonging to this client.</p>
 </div>
 </div>
 </div>

 {error && (
 <div className="rounded-[20px] border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-xs font-mono text-rose-300">{error}</div>
 )}

 <div className="flex items-center justify-end gap-4 pt-2">
 {saved && <span className="text-xs font-mono font-bold text-emerald-400">✓ Settings Successfully Updated</span>}
 <button
 onClick={save}
 disabled={saving}
 className="rounded-[20px] bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 px-6 py-2.5 text-xs font-mono font-bold text-black shadow-[0_0_20px_rgba(245,158,11,0.35)] transition-all scale-100 hover:scale-[1.02] disabled:opacity-50"
 >
 {saving ? "SAVING CHANGES..." : "SAVE SETTINGS"}
 </button>
 </div>
 </div>
 );
}
