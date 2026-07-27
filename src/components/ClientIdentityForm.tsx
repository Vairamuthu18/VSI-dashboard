"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { isValidDomain } from "@/lib/url-input";
import { Shield, Globe, Tag } from "lucide-react";

interface Props {
 clientId: string;
 initial: {
 website: string | null;
 brand_name: string | null;
 };
 scope?: "admin" | "agency";
}

export default function ClientIdentityForm({ clientId, initial, scope = "agency" }: Props) {
 const router = useRouter();
 const [, startTransition] = useTransition();
 const [website, setWebsite] = useState(initial.website ?? "");
 const [brand, setBrand] = useState(initial.brand_name ?? "");
 const [saving, setSaving] = useState(false);
 const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

 const websiteOk = isValidDomain(website);
 const dirty =
 website.trim() !== (initial.website ?? "") || brand.trim() !== (initial.brand_name ?? "");
 const endpoint =
 scope === "admin"
 ? `/api/admin/clients/${clientId}/identity`
 : `/api/clients/${clientId}/identity`;

 async function save() {
 setSaving(true);
 setMsg(null);
 try {
 const res = await fetch(endpoint, {
 method: "POST",
 headers: { "Content-Type": "application/json" },
 body: JSON.stringify({ website: website.trim(), brand_name: brand.trim() }),
 });
 const data = (await res.json().catch(() => ({}))) as { error?: string };
 if (!res.ok) {
 setMsg({ kind: "err", text: data.error ?? "Failed to save" });
 return;
 }
 setMsg({ kind: "ok", text: "Saved. Re-run keyword scan to refresh citation status." });
 startTransition(() => router.refresh());
 } finally {
 setSaving(false);
 }
 }

 return (
    <div className="rounded-[20px] border border-border bg-card p-6 shadow-xl relative overflow-hidden">
      <div className="flex items-baseline justify-between mb-5">
        <div>
          <h2 className="text-sm font-bold text-foreground uppercase tracking-widest flex items-center gap-2">
            <Shield size={14} className="text-amber-500" />
            <span>Tracked Brand Identity Signals</span>
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">Primary domains and brand names used by AI agents to detect citations and answer mentions.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <label className="block">
          <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-foreground mb-2">
            <Tag size={12} className="text-amber-500" /> Brand Name Anchor
          </span>
          <input
            type="text"
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            placeholder="e.g. United SEO"
            className="w-full rounded-[20px] border border-border bg-background text-foreground px-4 py-3 text-sm focus:border-amber-500 focus:outline-none placeholder:text-muted-foreground/70 transition-colors"
          />
        </label>

        <label className="block">
          <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-foreground mb-2">
            <Globe size={12} className="text-amber-500" /> Primary Domain
          </span>
          <input
            type="text"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            placeholder="e.g. unitedseo.ae"
            className={`w-full rounded-[20px] border bg-background text-foreground px-4 py-3 text-sm focus:outline-none placeholder:text-muted-foreground/70 transition-colors ${
              website.trim() && !websiteOk
                ? "border-rose-500 focus:border-rose-500"
                : "border-border focus:border-amber-500"
            }`}
          />
          {website.trim() && !websiteOk && (
            <span className="mt-1.5 block text-xs font-mono text-rose-500">
              Invalid domain format. Use bare host like <span className="underline">example.com</span> without https://.
            </span>
          )}
        </label>
 </div>

 <div className="mt-6 pt-4 border-t border-white/[0.05] flex items-center justify-between flex-wrap gap-4">
 <p className="text-[11px] font-mono text-gray-500 max-w-md">
 Updating your identity instantly recalculates brand mentions across all tracked keywords on your next scan.
 </p>
 <div className="flex items-center gap-3">
 {msg && (
 <span className={`text-xs font-mono font-bold ${msg.kind === "ok" ? "text-emerald-400" : "text-rose-400"}`}>
 {msg.text}
 </span>
 )}
 <button
 onClick={save}
 disabled={saving || !dirty || !websiteOk || !brand.trim()}
 className="rounded-[20px] bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-2 text-xs font-mono font-bold text-black hover:from-amber-600 hover:to-orange-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-[0_0_15px_rgba(245,158,11,0.3)]"
 >
 {saving ? "SAVING…" : "UPDATE IDENTITY"}
 </button>
 </div>
 </div>
 </div>
 );
}
