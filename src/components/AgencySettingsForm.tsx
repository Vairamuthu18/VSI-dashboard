"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface Initial {
 legal_name: string; // agency.name — readonly here
 display_name: string;
 logo_url: string;
 primary_color: string;
 support_email: string;
 report_footer: string;
}

export default function AgencySettingsForm({ agencyId, initial }: { agencyId: string; initial: Initial }) {
 const router = useRouter();
 const [state, setState] = useState<Initial>(initial);
 const [saving, setSaving] = useState(false);
 const [uploading, setUploading] = useState(false);
 const [saved, setSaved] = useState(false);
 const [error, setError] = useState<string | null>(null);

 async function uploadLogo(file: File) {
 if (!file) return;
 if (file.size > 1024 * 1024) {
 setError("Logo must be under 1 MB");
 return;
 }
 setUploading(true);
 setError(null);
 try {
 const supabase = createClient();
 const ext = file.name.split(".").pop()?.toLowerCase() || "png";
 const path = `${agencyId}/logo-${Date.now()}.${ext}`;
 const { error: upErr } = await supabase.storage
 .from("agency-logos")
 .upload(path, file, { contentType: file.type, upsert: true });
 if (upErr) {
 setError(upErr.message);
 return;
 }
 const { data } = supabase.storage.from("agency-logos").getPublicUrl(path);
 setState((s) => ({ ...s, logo_url: data.publicUrl }));
 } catch (e) {
 setError(e instanceof Error ? e.message : "Upload failed");
 } finally {
 setUploading(false);
 }
 }

 async function save() {
 setSaving(true);
 setError(null);
 setSaved(false);
 const res = await fetch("/api/agency/settings", {
 method: "POST",
 headers: { "Content-Type": "application/json" },
 body: JSON.stringify({
 display_name: state.display_name || null,
 logo_url: state.logo_url || null,
 primary_color: state.primary_color || null,
 support_email: state.support_email || null,
 report_footer: state.report_footer || null,
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

 return (
 <div className="space-y-4">
 <div className="rounded-[20px] border border-gray-200 bg-card p-5 space-y-3">
 <div>
 <label className="block text-xs text-gray-500 mb-1">Legal name (internal)</label>
 <input
 type="text"
 value={state.legal_name}
 disabled
 className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-500"
 />
 <p className="mt-1 text-xs text-gray-400">Internal record. Contact support to change.</p>
 </div>

 <div>
 <label className="block text-xs text-gray-500 mb-1">Display name</label>
 <input
 type="text"
 value={state.display_name}
 onChange={(e) => setState((s) => ({ ...s, display_name: e.target.value }))}
 placeholder={state.legal_name}
 maxLength={80}
 className="w-full rounded-lg border border-gray-300 bg-gray-100 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-amber-400 focus:outline-none"
 />
 <p className="mt-1 text-xs text-gray-500">Used wherever your agency name appears to a client. Defaults to your legal name.</p>
 </div>

 <div>
 <label className="block text-xs text-gray-500 mb-1">Support email</label>
 <input
 type="email"
 value={state.support_email}
 onChange={(e) => setState((s) => ({ ...s, support_email: e.target.value }))}
 placeholder="hello@youragency.com"
 className="w-full rounded-lg border border-gray-300 bg-gray-100 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-amber-400 focus:outline-none"
 />
 <p className="mt-1 text-xs text-gray-500">Where clients reply when they receive a report from you.</p>
 </div>
 </div>

 <div className="rounded-[20px] border border-gray-200 bg-card p-5 space-y-4">
 <div>
 <label className="block text-xs text-gray-500 mb-2">Logo</label>
 <div className="flex items-center gap-4">
 <div className="h-16 w-16 rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden shrink-0">
 {state.logo_url ? (
 <Image src={state.logo_url} alt="Logo" width={64} height={64} className="object-contain" unoptimized />
 ) : (
 <span className="text-xs text-gray-400">No logo</span>
 )}
 </div>
 <div className="flex-1 min-w-0">
 <label className="inline-block rounded-lg border border-gray-300 px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50 cursor-pointer">
 {uploading ? "Uploading..." : "Upload logo"}
 <input
 type="file"
 accept="image/png,image/jpeg,image/svg+xml,image/webp"
 className="hidden"
 disabled={uploading}
 onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadLogo(f); }}
 />
 </label>
 {state.logo_url && (
 <button
 type="button"
 onClick={() => setState((s) => ({ ...s, logo_url: "" }))}
 className="ml-2 text-xs text-red-600 hover:underline"
 >
 Remove
 </button>
 )}
 <p className="mt-1 text-xs text-gray-500">PNG/SVG/JPEG, under 1MB. Square works best.</p>
 </div>
 </div>
 </div>

 <div>
 <label className="block text-xs text-gray-500 mb-1">Brand colour</label>
 <div className="flex items-center gap-3">
 <input
 type="color"
 value={state.primary_color}
 onChange={(e) => setState((s) => ({ ...s, primary_color: e.target.value.toUpperCase() }))}
 className="h-10 w-14 rounded border border-gray-300 bg-card"
 />
 <input
 type="text"
 value={state.primary_color}
 onChange={(e) => setState((s) => ({ ...s, primary_color: e.target.value.toUpperCase() }))}
 maxLength={7}
 placeholder="#F59E0B"
 className="rounded-lg border border-gray-300 bg-gray-100 px-3 py-2 text-sm text-gray-900 font-mono w-32 focus:border-amber-400 focus:outline-none"
 />
 <div
 className="rounded-md px-3 py-1.5 text-xs font-semibold text-white"
 style={{ backgroundColor: state.primary_color }}
 >
 Preview button
 </div>
 </div>
 <p className="mt-1 text-xs text-gray-500">Used in client-facing reports — buttons, headings, accents.</p>
 </div>
 </div>

 <div className="rounded-[20px] border border-gray-200 bg-card p-5">
 <label className="block text-xs text-gray-500 mb-1">Report footer text</label>
 <textarea
 value={state.report_footer}
 onChange={(e) => setState((s) => ({ ...s, report_footer: e.target.value }))}
 rows={3}
 maxLength={500}
 placeholder="e.g. Prepared by [Agency] for our valued clients. Questions? Reply to this email."
 className="w-full rounded-lg border border-gray-300 bg-gray-100 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-amber-400 focus:outline-none"
 />
 <p className="mt-1 text-xs text-gray-500">Shown at the bottom of every report you generate. Plain text. Keep it short.</p>
 </div>

 {error && (
 <div className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
 )}

 <div className="flex items-center justify-end gap-3">
 {saved && <span className="text-xs text-green-700 font-medium">✓ Saved</span>}
 <button
 onClick={save}
 disabled={saving || uploading}
 className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-600 disabled:opacity-50"
 >
 {saving ? "Saving..." : "Save branding"}
 </button>
 </div>
 </div>
 );
}
