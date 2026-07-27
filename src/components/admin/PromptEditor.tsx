"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
 promptKey: string;
 title: string;
 defaultTemplate: string;
 currentTemplate: string;
 variables: string[];
 outputFormat: string;
 isOverride: boolean;
}

export default function PromptEditor({
 promptKey,
 defaultTemplate,
 currentTemplate,
 variables,
 outputFormat,
 isOverride,
}: Props) {
 const router = useRouter();
 const [draft, setDraft] = useState(currentTemplate);
 const [saving, setSaving] = useState(false);
 const [saved, setSaved] = useState(false);
 const [error, setError] = useState<string | null>(null);
 const [previewOpen, setPreviewOpen] = useState(false);

 const placeholdersUsed = useMemo(() => {
 const found = new Set<string>();
 const re = /\{\{\s*(\w+)\s*\}\}/g;
 let m: RegExpExecArray | null;
 while ((m = re.exec(draft)) !== null) found.add(m[1]);
 return found;
 }, [draft]);

 const unknownPlaceholders = useMemo(
 () => Array.from(placeholdersUsed).filter((p) => !variables.includes(p)),
 [placeholdersUsed, variables]
 );

 const missingPlaceholders = useMemo(
 () => variables.filter((v) => !placeholdersUsed.has(v)),
 [variables, placeholdersUsed]
 );

 const dirty = draft !== currentTemplate;

 async function save() {
 setSaving(true);
 setError(null);
 setSaved(false);
 const res = await fetch(`/api/admin/prompts/${promptKey}`, {
 method: "POST",
 headers: { "Content-Type": "application/json" },
 body: JSON.stringify({ template: draft }),
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

 async function resetToDefault() {
 if (!confirm("Reset this prompt to the hardcoded default? The current override will be deleted.")) return;
 setSaving(true);
 setError(null);
 const res = await fetch(`/api/admin/prompts/${promptKey}`, { method: "DELETE" });
 setSaving(false);
 if (!res.ok) {
 const data = await res.json().catch(() => ({}));
 setError(data.error ?? "Failed to reset");
 return;
 }
 setDraft(defaultTemplate);
 router.refresh();
 }

 // Preview: substitute placeholders with example values so the user
 // can sanity-check the rendered prompt before saving.
 const samplePreview = useMemo(() => {
 const samples: Record<string, string> = {
 todayLabel: "1 January 2026",
 currentYear: "2026",
 clientBrand: "Sample Brand",
 clientDomain: "samplebrand.com",
 keyword: "best example agency dubai",
 rankPosition: "#4",
 aioPresent: "Yes",
 clientCited: "No",
 mentionedInText: "No",
 gapLabel: "geo invisible",
 competitorList: "competitor-a.com, competitor-b.com, competitor-c.com",
 aioSnippet: "- AIO body excerpt: \"Sample AI Mode response text...\"",
 sourceCount: "3",
 sourceBlocks: "--- Source 1: Example Page\nURL: https://example.com/article\nWord count: 1200\nExcerpt:\n[truncated content excerpt]\n",
 };
 return draft.replace(/\{\{\s*(\w+)\s*\}\}/g, (_m, name: string) => samples[name] ?? `«${name}»`);
 }, [draft]);

 return (
 <div className="space-y-4">
 {/* Variables reference */}
 <div className="rounded-[20px] border border-[#333] bg-[#1C1C1E] p-4 text-white">
 <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Available template variables</p>
 <div className="flex flex-wrap gap-1.5">
 {variables.map((v) => {
 const used = placeholdersUsed.has(v);
 return (
 <code
 key={v}
 className={`rounded px-2 py-0.5 text-xs font-mono ${
 used ? "bg-green-900/30 text-green-400 border border-green-800" : "bg-[#111111] text-gray-400 border border-[#333]"
 }`}
 title={used ? "In use" : "Not yet referenced in template"}
 >
 {`{{${v}}}`}
 </code>
 );
 })}
 </div>
 <p className="text-xs text-gray-400 mt-3">
 <span className="font-medium text-gray-300">Expected output:</span> {outputFormat}
 </p>
 </div>

 {/* Editor */}
 <div className="rounded-[20px] border border-[#333] bg-[#1C1C1E] p-4 space-y-3">
 <div className="flex items-center justify-between">
 <p className="text-sm font-semibold text-white">Template</p>
 <div className="flex items-center gap-2">
 <span className={`text-xs ${isOverride ? "text-[#FF4500]" : "text-gray-500"}`}>
 {isOverride ? "Editing override" : "Editing default copy"}
 </span>
 </div>
 </div>
 <textarea
 value={draft}
 onChange={(e) => setDraft(e.target.value)}
 rows={24}
 spellCheck={false}
 className="w-full rounded-lg border border-[#333] bg-[#111111] px-3 py-2 text-xs text-white font-mono leading-relaxed focus:border-[#FF4500] focus:outline-none"
 />

 {unknownPlaceholders.length > 0 && (
 <div className="rounded-lg border border-red-800 bg-red-900/30 px-3 py-2 text-xs text-red-400">
 <strong>Unknown placeholders:</strong>{" "}
 {unknownPlaceholders.map((p) => `{{${p}}}`).join(", ")} — these will render as empty strings. Remove or fix them.
 </div>
 )}
 {missingPlaceholders.length > 0 && (
 <div className="rounded-lg border border-[#FF4500]/50 bg-[#FF4500]/10 px-3 py-2 text-xs text-[#FF4500]">
 <strong>Not referenced:</strong>{" "}
 {missingPlaceholders.map((p) => `{{${p}}}`).join(", ")} — these variables won&rsquo;t appear in the prompt. That&rsquo;s fine if intentional.
 </div>
 )}
 </div>

 {/* Preview */}
 <div className="rounded-[20px] border border-[#333] bg-[#1C1C1E] p-4">
 <button
 onClick={() => setPreviewOpen((v) => !v)}
 className="flex items-center gap-2 text-sm font-semibold text-white hover:text-[#FF4500]"
 >
 <span>{previewOpen ? "▼" : "▶"}</span>
 Preview rendered prompt (with sample values)
 </button>
 {previewOpen && (
 <pre className="mt-3 text-xs text-gray-300 bg-[#111111] border border-[#333] rounded-lg p-3 overflow-x-auto max-h-96 overflow-y-auto whitespace-pre-wrap leading-relaxed font-mono">
 {samplePreview}
 </pre>
 )}
 </div>

 {error && (
 <div className="rounded-lg border border-red-800 bg-red-900/30 px-3 py-2 text-sm text-red-400">{error}</div>
 )}

 <div className="flex flex-wrap items-center justify-between gap-3">
 <button
 onClick={resetToDefault}
 disabled={saving || !isOverride}
 className="rounded-lg border border-[#333] bg-[#111111] px-3 py-2 text-xs text-white hover:bg-[#2C2C2E] disabled:opacity-50"
 >
 Reset to default
 </button>
 <div className="flex items-center gap-3">
 {saved && <span className="text-xs text-green-400 font-medium">✓ Saved</span>}
 <button
 onClick={save}
 disabled={saving || !dirty}
 className="rounded-lg bg-[#FF4500] px-4 py-2 text-sm font-semibold text-white hover:bg-[#E03E00] disabled:opacity-50 transition-colors"
 >
 {saving ? "Saving..." : dirty ? "Save override" : "No changes"}
 </button>
 </div>
 </div>
 </div>
 );
}
