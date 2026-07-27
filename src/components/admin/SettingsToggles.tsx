"use client";

import { useState } from "react";

interface ToggleConfig {
 key: string;
 title: string;
 description: string;
 experimental?: boolean;
}

interface SelectConfig {
 key: string;
 title: string;
 description: string;
 options: { value: string; label: string }[];
}

const TOGGLES: ToggleConfig[] = [
 {
 key: "chatgpt_api_enabled",
 title: "ChatGPT visibility check",
 description:
 "Master switch for the ChatGPT brand-visibility check across the platform. Each client can still override this from their own engine settings.",
 },
 {
 key: "openai_search_enabled",
 title: "OpenAI live web search",
 description:
 "Uses gpt-4o-mini-search-preview, which grounds answers in live search results (+$30 per 1,000 searches). Leave off for the pilot — the plain gpt-4o-mini model is roughly 75× cheaper and still produces a useful visibility signal.",
 experimental: true,
 },
 {
 key: "openai_reports_enabled",
 title: "Route keyword reports through OpenAI",
 description:
 "Master switch for sending keyword reports (Summary, Detailed, Task List) to OpenAI. Each report type uses the model configured below — typically a cheap model for Summary/Detailed and a stronger one for Task Lists.",
 },
 {
 key: "openai_citation_enabled",
 title: "Route Citation Strategy through OpenAI",
 description:
 "Use OpenAI directly for the Citation Strategy analyser. This is the blueprint every Task List grounds in, so a stronger model is worth the spend.",
 },
];

const SELECTS: SelectConfig[] = [
 {
 key: "default_check_frequency",
 title: "Default cron frequency for new clients",
 description:
 "When a new client is created, this is the schedule cron uses. Each client can override this individually from their Settings tab.",
 options: [
 { value: "manual", label: "Manual only" },
 { value: "daily", label: "Daily" },
 { value: "every_3_days", label: "Every 3 days" },
 { value: "weekly", label: "Weekly (recommended)" },
 ],
 },
 {
 key: "openai_chatgpt_model",
 title: "OpenAI model for ChatGPT visibility",
 description:
 "Active model used for the ChatGPT-visibility check when an OpenAI key is configured. Ignored if the live-web-search toggle is on (that forces the search-preview model).",
 options: [
 { value: "gpt-4o-mini", label: "gpt-4o-mini · cheapest" },
 { value: "gpt-4o", label: "gpt-4o · highest quality" },
 ],
 },
 {
 key: "openai_summary_model",
 title: "OpenAI model · Executive Summary + Detailed Strategy",
 description:
 "These reports are short and conversational; the cheap model handles them well. Only used when 'Route keyword reports through OpenAI' is on.",
 options: [
 { value: "gpt-4o-mini", label: "gpt-4o-mini · cheapest (recommended)" },
 { value: "gpt-4o", label: "gpt-4o · overkill for these reports" },
 ],
 },
 {
 key: "openai_tasks_model",
 title: "OpenAI model · Task List reports",
 description:
 "Task tickets need owners, effort, impact, and acceptance criteria. The stronger model produces materially better tickets — worth the spend for the report your team will actually execute.",
 options: [
 { value: "gpt-4o-mini", label: "gpt-4o-mini · cheapest" },
 { value: "gpt-4o", label: "gpt-4o · recommended" },
 ],
 },
 {
 key: "openai_citation_model",
 title: "OpenAI model · Citation Strategy",
 description:
 "The Citation Strategy is the blueprint every Task List grounds in. Stronger model = better patterns and gaps. Only used when 'Route Citation Strategy through OpenAI' is on.",
 options: [
 { value: "gpt-4o-mini", label: "gpt-4o-mini · cheapest" },
 { value: "gpt-4o", label: "gpt-4o · recommended" },
 ],
 },
];

export default function SettingsToggles({ initial }: { initial: Record<string, unknown> }) {
 const [state, setState] = useState<Record<string, unknown>>(initial);
 const [saving, setSaving] = useState<string | null>(null);
 const [error, setError] = useState<string | null>(null);

 async function setKey(key: string, value: unknown) {
 const prev = state[key];
 setState((s) => ({ ...s, [key]: value }));
 setSaving(key);
 setError(null);
 const res = await fetch("/api/admin/settings", {
 method: "POST",
 headers: { "Content-Type": "application/json" },
 body: JSON.stringify({ key, value }),
 });
 setSaving(null);
 if (!res.ok) {
 setState((s) => ({ ...s, [key]: prev }));
 const data = await res.json().catch(() => ({}));
 setError(data.error ?? "Failed to save");
 }
 }

 return (
 <div className="space-y-3">
 {error && (
 <div className="rounded-lg border border-red-800 bg-red-900/30 px-4 py-2 text-sm text-red-400">
 {error}
 </div>
 )}

 {TOGGLES.map((t) => {
 const value = !!state[t.key];
 return (
 <div key={t.key} className="flex items-start justify-between gap-4 rounded-[20px] border border-[#333] bg-[#1C1C1E] p-4 text-white">
 <div className="flex-1">
 <div className="flex items-center gap-2">
 <p className="text-sm font-semibold text-white">{t.title}</p>
 {t.experimental && (
 <span className="rounded-full bg-[#FF4500]/20 px-2 py-0.5 text-[10px] font-semibold text-[#FF4500] uppercase tracking-wider">
 Experimental
 </span>
 )}
 </div>
 <p className="mt-1 text-xs text-gray-400 leading-relaxed">{t.description}</p>
 </div>
 <button
 onClick={() => setKey(t.key, !value)}
 disabled={saving === t.key}
 className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
 value ? "bg-[#FF4500]" : "bg-gray-600"
 } disabled:opacity-50`}
 aria-pressed={value}
 >
 <span
 className={`inline-block h-4 w-4 transform rounded-full bg-card transition-transform ${
 value ? "translate-x-6" : "translate-x-1"
 }`}
 />
 </button>
 </div>
 );
 })}

 {SELECTS.map((s) => {
 const current = typeof state[s.key] === "string" ? (state[s.key] as string) : "";
 return (
 <div key={s.key} className="rounded-[20px] border border-[#333] bg-[#1C1C1E] p-4 text-white">
 <p className="text-sm font-semibold text-white">{s.title}</p>
 <p className="mt-1 text-xs text-gray-400 leading-relaxed">{s.description}</p>
 <div className="mt-3 flex flex-wrap gap-2">
 {s.options.map((opt) => (
 <button
 key={opt.value}
 onClick={() => setKey(s.key, opt.value)}
 disabled={saving === s.key}
 className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
 current === opt.value
 ? "bg-[#FF4500] text-white"
 : "border border-[#333] bg-[#111111] text-gray-300 hover:bg-[#2C2C2E] hover:text-white"
 } disabled:opacity-50`}
 >
 {opt.label}
 </button>
 ))}
 </div>
 </div>
 );
 })}
 </div>
 );
}
