"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient as createSupabase } from "@/lib/supabase/client";
import { TRACK_TYPE_CONFIG, LOCATIONS } from "@/types/search";
import type { TrackType, Location } from "@/types/search";

interface KeywordRow {
 keyword: string;
 track_type: TrackType;
 location: Location;
}

interface ClientMeta {
 id: string;
 name: string;
 service_type: string;
 website: string;
 brand_name: string;
 default_location: Location;
}

export default function AddKeywordsPage() {
 const router = useRouter();
 const params = useParams();
 const clientId = params.id as string;

 const [client, setClient] = useState<ClientMeta | null>(null);
 const [loaded, setLoaded] = useState(false);
 const [pasteInput, setPasteInput] = useState("");
 const [keywords, setKeywords] = useState<KeywordRow[]>([]);
 const [parsed, setParsed] = useState(false);
 const [saving, setSaving] = useState(false);
 const [error, setError] = useState<string | null>(null);

 // Load client metadata on mount
 if (!loaded) {
 setLoaded(true);
 createSupabase()
 .from("clients")
 .select("id, name, service_type, website, brand_name, default_location")
 .eq("id", clientId)
 .single()
 .then(({ data }) => { if (data) setClient(data as ClientMeta); });
 }

 const defaultTrackType: TrackType =
 client?.service_type === "seo" ? "seo" :
 client?.service_type === "geo" ? "geo" : "both";

 const defaultLocation: Location = client?.default_location ?? "ae";

 function parseKeywords() {
 const lines = pasteInput.split("\n").map((l) => l.trim()).filter(Boolean);
 const unique = [...new Set(lines)];
 setKeywords(unique.map((kw) => ({
 keyword: kw,
 track_type: defaultTrackType,
 location: defaultLocation,
 })));
 setParsed(true);
 }

 function updateKeyword(i: number, field: keyof KeywordRow, value: string) {
 setKeywords((prev) => {
 const next = [...prev];
 next[i] = { ...next[i], [field]: value };
 return next;
 });
 }

 function removeKeyword(i: number) {
 setKeywords((prev) => prev.filter((_, idx) => idx !== i));
 }

 async function handleSave() {
 if (!client || keywords.length === 0) return;
 setSaving(true);
 setError(null);

 const supabase = createSupabase();

 const { data: { user } } = await supabase.auth.getUser();
 if (!user) {
 setError("Not signed in");
 setSaving(false);
 return;
 }
 const { data: profile } = await supabase
 .from("profiles")
 .select("agency_id")
 .eq("id", user.id)
 .single();
 const agencyId = profile?.agency_id;
 if (!agencyId) {
 setError("Agency not configured — complete onboarding first");
 setSaving(false);
 return;
 }

 const rows = keywords.map((kw) => ({
 client_id: clientId,
 agency_id: agencyId,
 keyword: kw.keyword,
 domain: client.website,
 brand: client.brand_name ?? client.name,
 track_type: kw.track_type,
 location: kw.location,
 }));

 const { error: err } = await supabase
 .from("tracked_keywords")
 .upsert(rows, { onConflict: "client_id,keyword,domain,location", ignoreDuplicates: true });

 if (err) {
 setError(err.message);
 setSaving(false);
 return;
 }

 router.push(`/dashboard/clients/${clientId}/keywords`);
 router.refresh();
 }

 if (!client) {
 return <div className="p-8 text-sm text-gray-500 animate-pulse">Loading...</div>;
 }

 const isSeoGeo = client.service_type === "seo_geo";
 const isGeoOnly = client.service_type === "geo";

 return (
 <div className="p-8 max-w-3xl space-y-6">
 <div>
 <div className="flex items-center gap-2 mb-0.5 text-sm text-gray-500">
 <a href={`/dashboard/clients/${clientId}`} className="hover:text-gray-600">{client.name}</a>
 <span className="text-gray-400">/</span>
 <a href={`/dashboard/clients/${clientId}/keywords`} className="hover:text-gray-600">Keywords</a>
 <span className="text-gray-400">/</span>
 <span className="text-gray-900">Add</span>
 </div>
 <h1 className="text-xl font-semibold text-gray-900">
 {isGeoOnly ? "Add Queries" : "Add Keywords"}
 </h1>
 <p className="text-xs text-gray-500 mt-1">
 {isGeoOnly
 ? "Paste conversational queries that trigger AI Mode, one per line."
 : isSeoGeo
 ? "Paste keywords or queries. Set track type per keyword after parsing."
 : "Paste rank-trackable keywords, one per line."}
 </p>
 </div>

 {error && (
 <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
 )}

 <div className="rounded-[20px] border border-gray-200 bg-card p-5 space-y-4">
 <textarea
 value={pasteInput}
 onChange={(e) => { setPasteInput(e.target.value); setParsed(false); }}
 rows={8}
 placeholder={
 isGeoOnly
 ? "what are the best seo agencies in dubai?\nwho should I hire for seo?\nbest digital marketing consultants uae"
 : "best seo agency dubai\nseo consultant dubai\ntop seo company uae"
 }
 className="w-full rounded-lg border border-gray-300 bg-gray-100 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-amber-400 focus:outline-none font-mono"
 />
 <div className="flex items-center justify-between">
 <span className="text-xs text-gray-500">
 {pasteInput.split("\n").filter((l) => l.trim()).length} lines
 </span>
 <button
 onClick={parseKeywords}
 disabled={!pasteInput.trim()}
 className="rounded-lg bg-gray-200 px-3 py-1.5 text-xs font-medium text-gray-800 hover:bg-gray-600 disabled:opacity-40 transition-colors"
 >
 Parse & Preview
 </button>
 </div>
 </div>

 {parsed && keywords.length > 0 && (
 <div className="rounded-[20px] border border-gray-200 overflow-hidden">
 <div className="grid grid-cols-12 gap-2 px-4 py-2.5 bg-gray-100 text-xs text-gray-500 font-medium">
 <div className="col-span-6">Keyword / Query</div>
 <div className="col-span-3">Track Type</div>
 <div className="col-span-2">Location</div>
 <div className="col-span-1" />
 </div>
 {keywords.map((kw, i) => (
 <div key={i} className="grid grid-cols-12 gap-2 px-4 py-2.5 border-t border-gray-200 items-center">
 <div className="col-span-6 text-xs text-gray-800 truncate">{kw.keyword}</div>
 <div className="col-span-3">
 {isSeoGeo ? (
 <select
 value={kw.track_type}
 onChange={(e) => updateKeyword(i, "track_type", e.target.value)}
 className="w-full rounded border border-gray-300 bg-gray-100 px-1.5 py-1 text-xs text-gray-800 focus:outline-none"
 >
 {(Object.entries(TRACK_TYPE_CONFIG) as [TrackType, typeof TRACK_TYPE_CONFIG[TrackType]][]).map(([k, v]) => (
 <option key={k} value={k}>{v.label}</option>
 ))}
 </select>
 ) : (
 <span className={`rounded px-1.5 py-0.5 text-xs font-medium ${TRACK_TYPE_CONFIG[kw.track_type].color}`}>
 {TRACK_TYPE_CONFIG[kw.track_type].label}
 </span>
 )}
 </div>
 <div className="col-span-2">
 <select
 value={kw.location}
 onChange={(e) => updateKeyword(i, "location", e.target.value)}
 className="w-full rounded border border-gray-300 bg-gray-100 px-1.5 py-1 text-xs text-gray-800 focus:outline-none"
 >
 {(Object.entries(LOCATIONS) as [Location, typeof LOCATIONS[Location]][]).map(([k, v]) => (
 <option key={k} value={k}>{v.label}</option>
 ))}
 </select>
 </div>
 <div className="col-span-1 flex justify-end">
 <button onClick={() => removeKeyword(i)} className="text-gray-500 hover:text-red-700 text-xs transition-colors">✕</button>
 </div>
 </div>
 ))}
 </div>
 )}

 {parsed && keywords.length > 0 && (
 <div className="flex items-center justify-between">
 <button
 onClick={() => router.back()}
 className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-500 hover:text-gray-900 transition-colors"
 >
 Cancel
 </button>
 <button
 onClick={handleSave}
 disabled={saving}
 className="rounded-lg bg-amber-500 px-5 py-2 text-sm font-semibold text-white hover:bg-amber-600 disabled:opacity-40 transition-colors"
 >
 {saving ? "Saving..." : `Save ${keywords.length} keyword${keywords.length !== 1 ? "s" : ""}`}
 </button>
 </div>
 )}
 </div>
 );
}
