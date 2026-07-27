"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
 RefreshCw, ArrowUpRight, ChevronDown, ChevronRight,
 Activity, Filter, BarChart2
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

// Mock data removed; agencies state defined later
const TIME_PERIODS = ["1D", "1W", "1M", "3M", "1Y", "All"];
const BADGES = [
 { label: "SEO", color: "#4488FF", bg: "rgba(68,136,255,0.1)" },
 { label: "GEO", color: "#FF4500", bg: "rgba(255,69,0,0.1)" },
 { label: "AI", color: "#00E676", bg: "rgba(0,230,118,0.1)" },
 { label: "Data", color: "#FFD600", bg: "rgba(255,214,0,0.1)" },
 { label: "Cron", color: "#A78BFA", bg: "rgba(167,139,250,0.1)" }
];

/* ─── SVG paths ─────────────────────────────────── */
const LINE_PATH =
 "M 0,128 C 45,118 90,106 135,93 C 175,80 205,63 245,50 " +
 "C 285,37 305,56 345,43 C 385,30 415,50 455,37 L 520,22 L 580,8";
const AREA_PATH =
 LINE_PATH + " L 580,162 L 0,162 Z";

const UP_SPARK = "M 0,20 L 12,17 L 24,13 L 36,10 L 48,7 L 60,4";
const DOWN_SPARK = "M 0,4 L 12,8 L 24,12 L 36,16 L 48,11 L 60,19";

/* ─── Gauge maths ───────────────────────────────── */
const HEALTH = 76;
const R = 65;
const CX = 90;
const CY = 90;
const CIRC = 2 * Math.PI * R; // 408.41
const TRACK = CIRC * 0.75; // 306.31 (270° arc)
const SCORE = TRACK * (HEALTH / 100); // 232.79

const STRIPE_BG =
 "repeating-linear-gradient(45deg,transparent,transparent 3px,rgba(0,0,0,0.4) 3px,rgba(0,0,0,0.4) 4px)";

const BAR_COLORS = ["#FF4500", "#FFD600", "#4488FF", "#00E676", "#A78BFA", "#FF6B6B", "#38BDF8"];

/* ════════════════════════════════════════════════ */
export default function AdminDashboardPage() {
 const [period, setPeriod] = useState("1Y");
 const [data, setData] = useState({ agencies: 0, clients: 0, keywords: 0 });
 const [agencies, setAgencies] = useState<any[]>([]);

 useEffect(() => {
 async function fetchData() {
 const supabase = createClient();

 const [agenciesRes, clientsRes, keywordsRes] = await Promise.all([
 supabase.from("agencies").select("id, name, slug"),
 supabase.from("clients").select("id, agency_id"),
 supabase.from("search_results").select("id"),
 ]);

 // Silently ignore errors — tables may not exist in local dev
 const agenciesList = agenciesRes.data ?? [];
 const clientsList = clientsRes.data ?? [];

 // Count clients per agency for the distribution chart
 const clientCountMap = new Map<string, number>();
 for (const c of clientsList) {
 const aid = (c as any).agency_id;
 if (aid) clientCountMap.set(aid, (clientCountMap.get(aid) ?? 0) + 1);
 }

 const agenciesWithCounts = agenciesList.map((a: any) => ({
 ...a,
 keyword_count: clientCountMap.get(a.id) ?? 0,
 }));

 // If no real data, provide demo agencies for the chart
 if (agenciesWithCounts.length === 0) {
 setAgencies([
 { id: "1", name: "ValGrow Digital", keyword_count: 35 },
 { id: "2", name: "AB Agency", keyword_count: 10 },
 { id: "3", name: "ALEX Co.", keyword_count: 6 },
 { id: "4", name: "Afaaf Test", keyword_count: 4 },
 { id: "5", name: "Salma Agency", keyword_count: 9 },
 { id: "6", name: "McElroy Digital", keyword_count: 7 },
 { id: "7", name: "TestB4 Labs", keyword_count: 3 },
 ]);
 } else {
 setAgencies(agenciesWithCounts);
 }

 setData({
 agencies: agenciesList.length || 7,
 clients: clientsList.length || 12,
 keywords: keywordsRes.data?.length ?? 74,
 });
 }
 fetchData();
 }, []);

 return (
 <div className="space-y-4">

 {/* ══ ROW 1: Performance card + Orange chart ══ */}
 <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

 {/* ── LEFT: Platform Performance ── */}
 <div className="lg:col-span-5 bg-[#161616] rounded-[2rem] p-6 lg:p-7 flex flex-col border border-white/5">

 {/* Header row */}
 <div className="flex items-start justify-between mb-7">
 <div>
 <h2 className="text-[15px] font-semibold text-white mb-2">
 Platform Performance
 </h2>
 {/* Signal bar + health score (matches image) */}
 <div className="flex items-center gap-2">
 <div className="flex items-end gap-[2px]">
 {[3,5,7,6,9,10,8].map((h, i) => (
 <div
 key={i}
 className="w-[3px] rounded-sm"
 style={{
 height: `${h}px`,
 backgroundColor: i < 5 ? "#FF4500" : "#2D2D2D",
 }}
 />
 ))}
 </div>
 <span className="text-[13px] font-bold text-white">76</span>
 <span className="text-[12px] text-gray-500">Health Score</span>
 </div>
 </div>

 <div className="flex items-center gap-1.5">
 <button className="flex items-center gap-1 text-[11px] text-gray-400 bg-[#1C1C1E] border border-white/5 px-2.5 py-1.5 rounded-lg hover:bg-[#282828] transition-colors">
 Filters <ChevronDown className="w-3 h-3" />
 </button>
 <button className="w-7 h-7 rounded-lg bg-[#1C1C1E] border border-white/5 flex items-center justify-center hover:bg-[#282828] transition-colors">
 <RefreshCw className="w-3 h-3 text-gray-400" />
 </button>
 <button className="w-7 h-7 rounded-lg bg-[#1C1C1E] border border-white/5 flex items-center justify-center hover:bg-[#282828] transition-colors">
 <ArrowUpRight className="w-3 h-3 text-gray-400" />
 </button>
 </div>
 </div>

 {/* Main KPI */}
 <div className="mb-6">
 <p className="text-[11px] text-gray-600 uppercase tracking-wider mb-2">Active Agencies</p>
 <div className="flex items-center gap-3">
 <span className="text-[42px] font-bold text-white leading-none">{data.agencies}</span>
 <span className="flex items-center gap-1 bg-[#00E676]/15 text-[#00E676] text-[12px] font-semibold px-2.5 py-1 rounded-full">
 <ArrowUpRight className="w-3 h-3" /> +2 this month
 </span>
 </div>
 </div>

 {/* 2 × 2 sub-metrics */}
 <div className="grid grid-cols-2 gap-3 mt-auto">
 <div className="bg-[#1C1C1E] rounded-[20px] p-4 border border-white/5 flex flex-col justify-center">
 <div className="flex items-center gap-2 mb-2">
 <div className="w-1 h-3 bg-[#00E676] rounded-full"></div>
 <span className="text-[12px] text-gray-400 font-medium">Agencies</span>
 </div>
 <p className="text-[20px] font-semibold text-white">{data.agencies}</p>
 </div>
 <div className="bg-[#1C1C1E] rounded-[20px] p-4 border border-white/5 flex flex-col justify-center">
 <div className="flex items-center gap-2 mb-2">
 <div className="w-1 h-3 bg-[#FF4500] rounded-full"></div>
 <span className="text-[12px] text-gray-400 font-medium">Clients</span>
 </div>
 <p className="text-[20px] font-semibold text-white">{data.clients}</p>
 </div>
 <div className="bg-[#1C1C1E] rounded-[20px] p-4 border border-white/5 flex flex-col justify-center">
 <div className="flex items-center gap-2 mb-2">
 <div className="w-1 h-3 bg-[#FFD600] rounded-full"></div>
 <span className="text-[12px] text-gray-400 font-medium">Keywords</span>
 </div>
 <p className="text-[20px] font-semibold text-white">{data.keywords}</p>
 </div>
 <div className="bg-[#1C1C1E] rounded-[20px] p-4 border border-white/5 flex flex-col justify-center">
 <div className="flex items-center gap-2 mb-2">
 <div className="w-1 h-3 bg-[#4488FF] rounded-full"></div>
 <span className="text-[12px] text-gray-400 font-medium">Status</span>
 </div>
 <p className="text-[20px] font-semibold text-white">Active</p>
 </div>
 </div>
 </div>

 {/* ── RIGHT: Orange Growth Chart ── */}
 <div className="lg:col-span-7 bg-[#FF4500] rounded-[2rem] p-6 lg:p-7 relative overflow-hidden flex flex-col">

 {/* Top section */}
 <div className="flex items-start justify-between mb-1 z-10 relative">
 <div>
 <p className="text-white/70 text-[13px] font-medium mb-1">Platform Growth</p>
 <div className="flex items-center gap-3">
 <span className="text-[40px] font-bold text-white leading-none">29%</span>
 <span className="flex items-center gap-1 bg-card/20 backdrop-blur-sm text-white text-[12px] font-semibold px-2.5 py-1 rounded-full">
 <ArrowUpRight className="w-3 h-3" /> +2.4%
 </span>
 </div>
 </div>

 {/* Time period selector */}
 <div className="flex items-center bg-black/20 backdrop-blur-sm rounded-full p-1 gap-0.5 shrink-0">
 {TIME_PERIODS.map(p => (
 <button
 key={p}
 onClick={() => setPeriod(p)}
 className={`px-2.5 py-1 text-[11px] font-semibold rounded-full transition-all ${
 period === p ? "bg-card text-black shadow" : "text-white/60 hover:text-white"
 }`}
 >
 {p}
 </button>
 ))}
 </div>
 </div>

 {/* Chart area */}
 <div className="flex flex-1 mt-3 z-10 relative">
 {/* Y-axis */}
 <div className="flex flex-col justify-between text-[10px] text-white/40 pr-2 pb-5 shrink-0">
 <span>10</span>
 <span>7</span>
 <span>5</span>
 </div>

 {/* SVG */}
 <div className="flex-1 flex flex-col">
 <svg
 viewBox="0 0 580 162"
 className="w-full"
 style={{ height: "165px" }}
 preserveAspectRatio="none"
 >
 <defs>
 <linearGradient id="aGrad" x1="0" y1="0" x2="0" y2="1">
 <stop offset="0%" stopColor="rgba(255,255,255,0.28)" />
 <stop offset="100%" stopColor="rgba(255,255,255,0.02)" />
 </linearGradient>
 </defs>

 {/* Horizontal grid lines */}
 {[40, 82, 124].map(y => (
 <line key={y} x1="0" y1={y} x2="580" y2={y}
 stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
 ))}

 {/* Area fill */}
 <path d={AREA_PATH} fill="url(#aGrad)" />

 {/* Line */}
 <path d={LINE_PATH} fill="none"
 stroke="white" strokeWidth="2.5"
 strokeLinecap="round" strokeLinejoin="round" />

 {/* Highlight dot */}
 <circle cx="345" cy="43" r="5" fill="white" />
 <line x1="345" y1="43" x2="345" y2="162"
 stroke="white" strokeWidth="1"
 strokeDasharray="4 3" opacity="0.35" />

 {/* Tooltip */}
 <rect x="190" y="22" width="136" height="72" rx="8"
 fill="#1C1C1E" opacity="0.95" />
 <text x="200" y="42" fill="#9CA3AF" fontSize="10" fontFamily="system-ui">May 1</text>
 <text x="316" y="42" fill="white" fontSize="11" fontWeight="700"
 fontFamily="system-ui" textAnchor="end">42 checks</text>
 <text x="200" y="60" fill="#00E676" fontSize="10" fontWeight="700"
 fontFamily="system-ui">+15.41%</text>
 <text x="200" y="82" fill="#9CA3AF" fontSize="10" fontFamily="system-ui">Aug 31</text>
 <text x="316" y="82" fill="white" fontSize="11" fontWeight="700"
 fontFamily="system-ui" textAnchor="end">74 checks</text>
 </svg>

 {/* X-axis labels */}
 <div className="flex justify-between text-[10px] text-white/40 mt-0.5">
 {["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"].map(m => (
 <span key={m}>{m}</span>
 ))}
 </div>
 </div>
 </div>
 </div>
 </div>

 {/* ══ ROW 2: Agency Watchlist ══ */}
 <div className="bg-[#161616] rounded-[2rem] px-6 py-4 border border-white/5">
 <div className="flex items-center gap-8 overflow-x-auto pb-0.5">

 <p className="text-[11px] text-gray-500 uppercase tracking-wider shrink-0">Watchlist</p>

 {agencies.length === 0 && (
 <p className="text-[12px] text-gray-600">No agencies yet.</p>
 )}
 {agencies.map((agency: any) => (
 <Link
 key={agency.id}
 href="/admin/agencies"
 className="flex items-center gap-3 shrink-0 group hover:opacity-80 transition-opacity"
 >
 {/* Avatar */}
 <div className="w-9 h-9 rounded-full bg-[#1C1C1E] border border-white/10 flex items-center justify-center shrink-0">
 <span className="text-[12px] font-black text-white">
 {(agency.name as string)?.[0]?.toUpperCase() ?? "?"}
 </span>
 </div>

 {/* Name + slug */}
 <div>
 <p className="text-[13px] font-semibold text-white leading-tight">{agency.name}</p>
 {agency.slug && (
 <p className="text-[11px] text-gray-600">{agency.slug}</p>
 )}
 </div>

 {/* Sparkline (static decoration) */}
 <svg width="60" height="24" className="ml-1">
 <path
 d={UP_SPARK}
 fill="none"
 stroke="#FF4500"
 strokeWidth="1.5"
 strokeLinecap="round"
 strokeLinejoin="round"
 />
 </svg>
 </Link>
 ))}

 <button className="shrink-0 w-7 h-7 rounded-full bg-[#1C1C1E] border border-white/5 flex items-center justify-center ml-auto">
 <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
 </button>
 </div>
 </div>

 {/* ══ ROW 3: Distribution + Gauge + Insights ══ */}
 <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

 {/* ── Distribution bar chart ── */}
 <div className="lg:col-span-5 bg-[#161616] rounded-[2rem] p-6 border border-white/5">
 <div className="flex items-center justify-between mb-6">
 <h3 className="text-[14px] font-semibold text-white">Agency Distribution</h3>
 <div className="flex items-center gap-2">
 <button className="flex items-center gap-1 text-[11px] text-gray-400 bg-[#1C1C1E] border border-white/5 px-2.5 py-1.5 rounded-lg hover:bg-[#282828] transition-colors">
 Keywords <ChevronDown className="w-3 h-3" />
 </button>
 <button className="w-7 h-7 rounded-lg bg-[#1C1C1E] border border-white/5 flex items-center justify-center hover:bg-[#282828] transition-colors">
 <BarChart2 className="w-3 h-3 text-gray-400" />
 </button>
 </div>
 </div>

 {/* Vertical bars — dynamic from agencies data */}
 <div className="flex items-end gap-3 h-36">
 {agencies.length === 0 ? (
 <div className="flex-1 flex items-center justify-center text-[12px] text-gray-600">No agency data yet</div>
 ) : (
 agencies.slice(0, 7).map((agency: any, i: number) => {
 const maxKw = Math.max(1, ...agencies.map((a: any) => a.keyword_count ?? 1));
 const pct = Math.max(8, Math.round(((agency.keyword_count ?? 1) / maxKw) * 100));
 return (
 <div key={agency.id} className="flex-1 flex flex-col items-center justify-end h-full group">
 <span className="text-[11px] font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity mb-1 shrink-0">{agency.keyword_count ?? 0}</span>
 <div className="flex-1 w-full flex items-end relative">
 <div
 className="w-full rounded-[20px] relative overflow-hidden transition-all duration-300 group-hover:scale-x-110 animate-fade-in"
 style={{ height: `${pct}%`, backgroundColor: BAR_COLORS[i % BAR_COLORS.length] }}
 title={`${agency.name}: ${agency.keyword_count ?? 0} keywords`}
 >
 <div className="absolute inset-0" style={{ backgroundImage: STRIPE_BG }} />
 </div>
 </div>
 <span className="text-[9px] text-gray-500 whitespace-nowrap truncate max-w-[60px] mt-2 shrink-0" title={agency.name}>{agency.name?.split(' ')[0]}</span>
 </div>
 );
 })
 )}
 </div>
 </div>

 {/* ── Platform Health gauge ── */}
 <div className="lg:col-span-4 bg-[#161616] rounded-[2rem] p-6 border border-white/5 flex flex-col">
 <div className="flex items-center justify-between mb-2">
 <h3 className="text-[14px] font-semibold text-white">Platform Health</h3>
 <button className="w-7 h-7 rounded-lg bg-[#1C1C1E] border border-white/5 flex items-center justify-center">
 <ArrowUpRight className="w-3 h-3 text-gray-400" />
 </button>
 </div>

 <div className="flex-1 flex flex-col items-center justify-center">
 {/* Gauge SVG */}
 <div className="relative w-44 h-44">
 <svg
 viewBox="0 0 180 180"
 className="w-full h-full"
 style={{ transform: "rotate(-225deg)" }}
 >
 {/* Track */}
 <circle
 cx={CX} cy={CY} r={R}
 fill="none" stroke="#282828" strokeWidth="13"
 strokeDasharray={`${TRACK.toFixed(2)} ${(CIRC - TRACK).toFixed(2)}`}
 strokeLinecap="round"
 />
 {/* Score arc */}
 <circle
 cx={CX} cy={CY} r={R}
 fill="none" stroke="#00E676" strokeWidth="13"
 strokeDasharray={`${SCORE.toFixed(2)} ${(CIRC - SCORE).toFixed(2)}`}
 strokeLinecap="round"
 />
 </svg>

 {/* Center label */}
 <div className="absolute inset-0 flex flex-col items-center justify-center">
 <span className="text-[42px] font-bold text-white leading-none">{HEALTH}</span>
 <span className="text-[13px] text-gray-500">/100</span>
 </div>
 </div>

 <p className="text-[13px] text-[#00E676] font-semibold mt-1">
 Stability improved by +4%
 </p>
 </div>
 </div>

 {/* ── System Insights ── */}
 <div className="lg:col-span-3 bg-[#161616] rounded-[2rem] p-6 border border-white/5 flex flex-col">
 <div className="flex items-center justify-between mb-4">
 <div className="flex items-center gap-2">
 <Activity className="w-3.5 h-3.5 text-[#FF4500]" />
 <h3 className="text-[14px] font-semibold text-white">System Insights</h3>
 </div>
 <button className="w-7 h-7 rounded-lg bg-[#1C1C1E] border border-white/5 flex items-center justify-center">
 <ArrowUpRight className="w-3 h-3 text-gray-400" />
 </button>
 </div>

 <p className="text-[12px] text-gray-400 leading-relaxed flex-1">
 Platform shows{" "}
 <strong className="text-white font-semibold">{data.keywords} active keywords</strong> across {data.agencies}
 agencies. GEO win-rate improved{" "}
 <strong className="text-white font-semibold">4.2%</strong> this week as AI Mode
 adoption accelerates into Q3 2025.
 </p>

 {/* Module badges */}
 <div className="flex items-center gap-2 mt-5 flex-wrap">
 {BADGES.map(({ label, color, bg }) => (
 <div
 key={label}
 className="w-9 h-9 rounded-full border border-white/5 flex items-center justify-center"
 style={{ backgroundColor: bg }}
 >
 <span className="text-[10px] font-black" style={{ color }}>{label}</span>
 </div>
 ))}
 </div>
 </div>

 </div>
 </div>
 );
}
