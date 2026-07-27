"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function AddClientForm({ agencyId }: { agencyId: string }) {
 const router = useRouter();
 const [name, setName] = useState("");
 const [website, setWebsite] = useState("");
 const [brandName, setBrandName] = useState("");
 const [loading, setLoading] = useState(false);
 const [error, setError] = useState<string | null>(null);

 async function handleSubmit(e: React.FormEvent) {
 e.preventDefault();
 if (!name.trim() || !agencyId) return;

 setLoading(true);
 setError(null);

 const supabase = createClient();
 const { error } = await supabase.from("clients").insert({
 agency_id: agencyId,
 name: name.trim(),
 website: website.trim() || null,
 brand_name: brandName.trim() || null,
 });

 if (error) {
 if (error.message?.includes("AGENCY_CLIENT_CAP_REACHED")) {
 setError("Your plan only allows a limited number of clients. Contact your account manager to upgrade.");
 } else {
 setError("Failed to add client.");
 }
 setLoading(false);
 return;
 }

 setName("");
 setWebsite("");
 setBrandName("");
 setLoading(false);
 router.refresh();
 }

 return (
 <div className="rounded-[20px] border border-gray-200 bg-card p-5">
 <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">
 Add Client
 </h2>

 <form onSubmit={handleSubmit} className="space-y-3">
 {error && (
 <div className="rounded-lg bg-red-50 border border-red-300 px-3 py-2 text-xs text-red-700">
 {error}
 </div>
 )}

 <div>
 <label className="block text-xs text-gray-500 mb-1">Client Name *</label>
 <input
 type="text"
 value={name}
 onChange={(e) => setName(e.target.value)}
 placeholder="e.g. United SEO"
 required
 className="w-full rounded-lg border border-gray-300 bg-gray-100 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-amber-400 focus:outline-none"
 />
 </div>

 <div>
 <label className="block text-xs text-gray-500 mb-1">Website</label>
 <input
 type="text"
 value={website}
 onChange={(e) => setWebsite(e.target.value)}
 placeholder="e.g. unitedseo.ae"
 className="w-full rounded-lg border border-gray-300 bg-gray-100 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-amber-400 focus:outline-none"
 />
 </div>

 <div>
 <label className="block text-xs text-gray-500 mb-1">
 Brand Name
 <span className="ml-1 text-gray-500">(for AIO text detection)</span>
 </label>
 <input
 type="text"
 value={brandName}
 onChange={(e) => setBrandName(e.target.value)}
 placeholder="e.g. United SEO"
 className="w-full rounded-lg border border-gray-300 bg-gray-100 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-amber-400 focus:outline-none"
 />
 </div>

 <button
 type="submit"
 disabled={loading}
 className="w-full rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
 >
 {loading ? "Adding..." : "Add Client"}
 </button>
 </form>
 </div>
 );
}
