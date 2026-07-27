"use client";

import { useState } from "react";
import Link from "next/link";
import { Building2, Users, Key, Globe, ChevronDown, ChevronUp, Plus, ExternalLink } from "lucide-react";

const MOCK_AGENCIES = [
 {
 id: "ag1", name: "ValGrow Digital", slug: "valgrow-digital", is_pilot: false, is_disabled: false, max_keywords: 500, max_clients: null, created_at: "2025-01-15",
 clients: [
 { id: "c1", name: "VG Digital", brand_name: "VG Digital", website: "vgdigital.com", service_type: "seo" },
 { id: "c2", name: "Athariw", brand_name: "Athariw", website: "athariw.com", service_type: "seo" },
 { id: "c3", name: "ValGrow Labs", brand_name: "ValGrow Labs", website: "valgrowing.com", service_type: "geo" },
 ], keywords: 35,
 },
 {
 id: "ag2", name: "AB Agency", slug: "ab-agency", is_pilot: true, is_disabled: false, max_keywords: 100, max_clients: 5, created_at: "2025-03-10",
 clients: [{ id: "c4", name: "Tap Payments", brand_name: "Tap Payments", website: "tap.company", service_type: "geo" }], keywords: 10,
 },
 {
 id: "ag3", name: "ALEX Co.", slug: "alex-co", is_pilot: true, is_disabled: false, max_keywords: 100, max_clients: 3, created_at: "2025-04-01",
 clients: [{ id: "c5", name: "ALEX", brand_name: "ALEX", website: "alex.sa", service_type: "geo" }], keywords: 6,
 },
 {
 id: "ag4", name: "Afaaf Test", slug: "afaaf-test", is_pilot: true, is_disabled: false, max_keywords: 50, max_clients: 2, created_at: "2025-04-18",
 clients: [{ id: "c6", name: "ValGrow Trial", brand_name: "ValGrow Trial", website: "trial.valgrow.com", service_type: "geo" }], keywords: 4,
 },
 {
 id: "ag5", name: "Salma Agency", slug: "salma-agency", is_pilot: true, is_disabled: false, max_keywords: 100, max_clients: 5, created_at: "2025-05-02",
 clients: [{ id: "c7", name: "MENA Cyber Wire", brand_name: "MENA Cyber Wire", website: "menacyberwire.com", service_type: "geo" }], keywords: 9,
 },
 {
 id: "ag6", name: "McElroy Digital", slug: "mcelroy", is_pilot: true, is_disabled: false, max_keywords: 100, max_clients: 3, created_at: "2025-05-20",
 clients: [{ id: "c9", name: "Chris McElroy", brand_name: "Chris McElroy", website: "chrismcelroy.com", service_type: "geo" }], keywords: 7,
 },
 {
 id: "ag7", name: "TestB4 Labs", slug: "testb4", is_pilot: true, is_disabled: true, max_keywords: 50, max_clients: 1, created_at: "2025-06-01",
 clients: [{ id: "c8", name: "TestB4Pilot", brand_name: "TestB4Pilot", website: "testb4pilot.com", service_type: "geo" }], keywords: 3,
 },
];

const SERVICE_COLORS: Record<string, string> = {
 seo: "bg-blue-500/10 text-blue-400 border-blue-500/20",
 geo: "bg-[#FF4500]/10 text-[#FF4500] border-[#FF4500]/20",
};

export default function AgenciesPage() {
 const [expanded, setExpanded] = useState<Set<string>>(new Set());
 const totalClients = MOCK_AGENCIES.reduce((s, a) => s + a.clients.length, 0);
 const totalKeywords = MOCK_AGENCIES.reduce((s, a) => s + a.keywords, 0);

 function toggleExpand(id: string) {
 setExpanded(prev => {
 const next = new Set(prev);
 if (next.has(id)) next.delete(id);
 else next.add(id);
 return next;
 });
 }

 return (
 <div className="space-y-6">

 {/* Header */}
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-3">
 <div className="w-10 h-10 rounded-[20px] bg-[#FF4500]/10 border border-[#FF4500]/20 flex items-center justify-center">
 <Building2 className="w-5 h-5 text-[#FF4500]" />
 </div>
 <div>
 <h1 className="text-2xl font-semibold text-white tracking-tight">Agencies</h1>
 <p className="text-sm text-gray-500 mt-0.5">Every tenant on the platform. Click a row to see clients.</p>
 </div>
 </div>
 <Link
 href="/admin/invites"
 className="flex items-center gap-2 bg-[#FF4500] hover:bg-[#e03d00] text-white text-sm font-medium px-4 py-2.5 rounded-[20px] transition-colors shadow-lg shadow-[#FF4500]/20"
 >
 <Plus className="w-4 h-4" />
 New Invite
 </Link>
 </div>

 {/* Stats */}
 <div className="grid grid-cols-3 gap-4">
 {[
 { label: "Agencies", value: MOCK_AGENCIES.length, sub: `${MOCK_AGENCIES.filter(a => a.is_pilot).length} pilot`, color: "text-[#FF4500]", bg: "bg-[#FF4500]/10", border: "border-[#FF4500]/20", Icon: Building2 },
 { label: "Total Clients", value: totalClients, sub: "across all agencies", color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20", Icon: Users },
 { label: "Keywords", value: totalKeywords, sub: "being tracked", color: "text-[#00E676]", bg: "bg-[#00E676]/10", border: "border-[#00E676]/20", Icon: Key },
 ].map(({ label, value, sub, color, bg, border, Icon }) => (
 <div key={label} className={`bg-[#161616] border ${border} rounded-[20px] p-5 flex items-center gap-4 hover:bg-card transition-colors`}>
 <div className={`w-10 h-10 rounded-[20px] ${bg} flex items-center justify-center shrink-0`}>
 <Icon className={`w-5 h-5 ${color}`} />
 </div>
 <div>
 <p className="text-2xl font-bold text-white">{value}</p>
 <p className="text-[11px] text-gray-500 font-medium uppercase tracking-wide">{label}</p>
 <p className="text-[11px] text-gray-600">{sub}</p>
 </div>
 </div>
 ))}
 </div>

 {/* Agencies list */}
 <div className="space-y-3">
 {MOCK_AGENCIES.map((agency) => {
 const isOpen = expanded.has(agency.id);
 return (
 <div key={agency.id} className="bg-[#161616] border border-white/5 rounded-[20px] overflow-hidden hover:border-white/10 transition-colors">
 {/* Row header — clickable */}
 <button
 onClick={() => toggleExpand(agency.id)}
 className="flex items-center gap-4 px-6 py-4 w-full text-left cursor-pointer group"
 >
 <div className="w-10 h-10 rounded-[20px] bg-[#1C1C1E] border border-white/5 flex items-center justify-center shrink-0 group-hover:border-[#FF4500]/30 transition-colors">
 <span className="text-base font-bold text-[#FF4500]">{agency.name.charAt(0)}</span>
 </div>
 <div className="flex-1 min-w-0">
 <div className="flex items-center gap-2 flex-wrap">
 <h3 className="text-[15px] font-semibold text-white">{agency.name}</h3>
 <span className="text-[11px] text-gray-600">/{agency.slug}</span>
 {agency.is_pilot && (
 <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#FFD600]/10 text-[#FFD600] border border-[#FFD600]/20 font-medium">Pilot</span>
 )}
 {agency.is_disabled && (
 <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#FF4500]/10 text-[#FF4500] border border-[#FF4500]/20 font-medium">Disabled</span>
 )}
 {!agency.is_disabled && !agency.is_pilot && (
 <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#00E676]/10 text-[#00E676] border border-[#00E676]/20 font-medium">Active</span>
 )}
 </div>
 <p className="text-[12px] text-gray-600 mt-0.5">Created {agency.created_at}</p>
 </div>
 <div className="flex items-center gap-6 text-center shrink-0">
 <div>
 <p className="text-xl font-bold text-white">{agency.clients.length}</p>
 <p className="text-[10px] text-gray-600 uppercase tracking-wide">Clients</p>
 </div>
 <div>
 <p className="text-xl font-bold text-white">{agency.keywords}</p>
 <p className="text-[10px] text-gray-600 uppercase tracking-wide">Keywords</p>
 </div>
 <div>
 <p className="text-[13px] font-semibold text-white">{agency.max_keywords}</p>
 <p className="text-[10px] text-gray-600 uppercase tracking-wide">Max KW</p>
 </div>
 </div>
 <div className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}>
 <ChevronDown className="w-4 h-4 text-gray-500" />
 </div>
 </button>

 {/* Clients sub-list — expandable */}
 {isOpen && agency.clients.length > 0 && (
 <div className="border-t border-white/5 px-6 py-4 bg-[#111111] animate-in slide-in-from-top-1 duration-200">
 <p className="text-[10px] text-gray-500 uppercase tracking-wider font-medium mb-3">Clients ({agency.clients.length})</p>
 <div className="flex flex-wrap gap-2">
 {agency.clients.map(c => (
 <Link
 key={c.id}
 href={`/admin/clients/${c.id}`}
 className={`flex items-center gap-1.5 text-[12px] px-3 py-1.5 rounded-full border ${SERVICE_COLORS[c.service_type] ?? SERVICE_COLORS.seo} hover:opacity-80 transition-all hover:scale-[1.02]`}
 >
 <Globe className="w-3 h-3" />
 {c.brand_name ?? c.name}
 <span className="text-[10px] opacity-60">· {c.service_type.toUpperCase()}</span>
 <ExternalLink className="w-2.5 h-2.5 opacity-40" />
 </Link>
 ))}
 </div>
 </div>
 )}

 {isOpen && agency.clients.length === 0 && (
 <div className="border-t border-white/5 px-6 py-4 bg-[#111111]">
 <p className="text-[12px] text-gray-500">No clients registered yet.</p>
 </div>
 )}
 </div>
 );
 })}
 </div>
 </div>
 );
}
