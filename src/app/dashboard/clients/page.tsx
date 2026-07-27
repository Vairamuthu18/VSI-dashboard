import Link from "next/link";
import { requireAgency } from "@/lib/auth";
import { ArrowUpRight, Plus, Search, Globe, Tag, MapPin, Users, TrendingUp } from "lucide-react";

export const dynamic = "force-dynamic";

const MOCK_CLIENTS = [
 { id: "1", name: "VG Digital", brand_name: "VG Digital", website: "vgdigital.com", service_type: "seo", country: "UAE", industry: "Digital Marketing", keywords: 12, winRate: 67, tasks: 3 },
 { id: "2", name: "Athariw", brand_name: "Athariw", website: "athariw.com", service_type: "seo", country: "KSA", industry: "E-commerce", keywords: 8, winRate: 42, tasks: 2 },
 { id: "3", name: "ValGrow Labs", brand_name: "ValGrow Labs", website: "valgrowing.com", service_type: "geo", country: "UAE", industry: "SaaS", keywords: 15, winRate: 53, tasks: 2 },
 { id: "4", name: "Tap Payments", brand_name: "Tap Payments", website: "tap.company", service_type: "geo", country: "KSA", industry: "FinTech", keywords: 10, winRate: 80, tasks: 1 },
 { id: "5", name: "ALEX", brand_name: "ALEX", website: "alex.sa", service_type: "geo", country: "Egypt", industry: "Retail", keywords: 6, winRate: 33, tasks: 0 },
 { id: "6", name: "ValGrow Trial", brand_name: "ValGrow Trial", website: "trial.valgrow.com", service_type: "geo", country: "UAE", industry: "Consulting", keywords: 4, winRate: 25, tasks: 0 },
 { id: "7", name: "MENA Cyber Wire", brand_name: "MENA Cyber Wire", website: "menacyberwire.com", service_type: "geo", country: "UAE", industry: "Cybersecurity", keywords: 9, winRate: 55, tasks: 1 },
 { id: "8", name: "TestB4Pilot", brand_name: "TestB4Pilot", website: "testb4pilot.com", service_type: "geo", country: "KSA", industry: "Tech", keywords: 3, winRate: 0, tasks: 0 },
 { id: "9", name: "Chris McElroy", brand_name: "Chris McElroy", website: "chrismcelroy.com", service_type: "geo", country: "USA", industry: "Personal Brand", keywords: 7, winRate: 71, tasks: 1 },
];

const SERVICE_BADGE: Record<string, { label: string; color: string }> = {
 seo: { label: "SEO", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
 geo: { label: "GEO", color: "bg-[#FF4500]/20 text-[#FF4500] border-[#FF4500]/30" },
};

const AVATAR_COLORS = [
 "from-[#FF4500] to-[#FF6B35]",
 "from-blue-500 to-blue-600",
 "from-[#00E676] to-emerald-600",
 "from-purple-500 to-purple-600",
 "from-[#FFD600] to-yellow-600",
];

export default async function ClientsPage() {
 const session = await requireAgency();
 const avgWin = Math.round(MOCK_CLIENTS.reduce((s, c) => s + c.winRate, 0) / MOCK_CLIENTS.length);
 const totalKw = MOCK_CLIENTS.reduce((s, c) => s + c.keywords, 0);

 return (
 <div className="min-h-[calc(100vh-60px)] bg-background p-3 sm:p-6 font-sans text-foreground">
 <div className="max-w-[1400px] mx-auto bg-card rounded-[2rem] p-6 lg:p-8 shadow-2xl border border-border min-h-[calc(100vh-108px)]">

 {/* Header */}
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
 <div>
 <h1 className="text-2xl font-bold text-foreground tracking-tight">Clients</h1>
 <p className="text-sm text-muted-foreground mt-0.5">{MOCK_CLIENTS.length} clients across your agency</p>
 </div>
 <div className="flex items-center gap-3">
 <div className="relative">
 <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
 <input
 type="text"
 placeholder="Search clients…"
 className="bg-muted-bg/50 border border-border rounded-[20px] pl-9 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-amber-500 w-52 shadow-2xs"
 readOnly
 />
 </div>
 <Link
 href="/dashboard/clients/new"
 className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-bold px-4 py-2.5 rounded-[20px] shadow-sm transition-colors"
 >
 <Plus className="w-4 h-4" />
 Add Client
 </Link>
 </div>
 </div>

 {/* Stats Row */}
 <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
 {[
 { label: "Total Clients", value: MOCK_CLIENTS.length, sub: "across agency", Icon: Users, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
 { label: "SEO Clients", value: MOCK_CLIENTS.filter(c => c.service_type === "seo").length, sub: "search focused", Icon: Search, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
 { label: "GEO Clients", value: MOCK_CLIENTS.filter(c => c.service_type === "geo").length, sub: "AI visibility", Icon: Globe, color: "text-[#FF4500]", bg: "bg-[#FF4500]/10", border: "border-[#FF4500]/20" },
 { label: "Avg Win Rate", value: `${avgWin}%`, sub: `${totalKw} keywords`, Icon: TrendingUp, color: "text-[#00E676]", bg: "bg-[#00E676]/10", border: "border-[#00E676]/20" },
 ].map(({ label, value, sub, Icon, color, bg, border }) => (
 <div key={label} className={`bg-card border ${border} rounded-[20px] p-5 flex items-center gap-4`}>
 <div className={`w-10 h-10 rounded-[20px] ${bg} flex items-center justify-center shrink-0`}>
 <Icon className={`w-5 h-5 ${color}`} />
 </div>
 <div>
 <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wide">{label}</p>
 <p className="text-2xl font-bold text-foreground leading-none mt-0.5">{value}</p>
 <p className="text-[11px] text-muted-foreground mt-0.5">{sub}</p>
 </div>
 </div>
 ))}
 </div>

 {/* Client Grid */}
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
 {MOCK_CLIENTS.map((client, idx) => {
 const svc = SERVICE_BADGE[client.service_type] ?? SERVICE_BADGE.seo;
 const winColor = client.winRate >= 60 ? "#00E676" : client.winRate >= 40 ? "#FFD600" : "#FF4500";
 const avatarGrad = AVATAR_COLORS[idx % AVATAR_COLORS.length];
 return (
 <Link
 key={client.id}
 href={`/dashboard/clients/${client.id}`}
 className="group bg-card border border-border hover:border-amber-500/50 rounded-[20px] p-5 transition-all duration-200 hover:shadow-md flex flex-col"
 >
 {/* Top row */}
 <div className="flex items-start justify-between mb-4">
 <div className={`w-11 h-11 rounded-[20px] bg-gradient-to-br ${avatarGrad} flex items-center justify-center shrink-0`}>
 <span className="text-[16px] font-bold text-white">{client.brand_name.charAt(0)}</span>
 </div>
 <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${svc.color}`}>
 {svc.label}
 </span>
 </div>

 {/* Name + website */}
 <h3 className="text-[15px] font-bold text-foreground group-hover:text-primary transition-colors leading-tight mb-0.5">
 {client.brand_name}
 </h3>
 <p className="text-[12px] text-muted-foreground mb-3">{client.website}</p>

 {/* Meta tags */}
 <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground mb-4">
 {client.industry && (
 <span className="flex items-center gap-1 bg-muted-bg border border-border px-2.5 py-0.5 rounded-full font-medium">
 <Tag className="w-2.5 h-2.5" /> {client.industry}
 </span>
 )}
 {client.country && (
 <span className="flex items-center gap-1 bg-muted-bg border border-border px-2.5 py-0.5 rounded-full font-medium">
 <MapPin className="w-2.5 h-2.5" /> {client.country}
 </span>
 )}
 </div>

 {/* Win rate */}
 <div className="mt-auto">
 <div className="flex justify-between items-center mb-1.5">
 <span className="text-[11px] text-muted-foreground font-medium">Win Rate</span>
 <span className="text-[12px] font-bold" style={{ color: winColor }}>{client.winRate}%</span>
 </div>
 <div className="h-1.5 bg-muted-bg rounded-full overflow-hidden">
 <div
 className="h-full rounded-full transition-all duration-500"
 style={{ width: `${client.winRate}%`, backgroundColor: winColor }}
 />
 </div>
 <div className="flex justify-between mt-2">
 <span className="text-[11px] text-muted-foreground">{client.keywords} keywords</span>
 {client.tasks > 0 && (
 <span className="text-[11px] text-amber-500 font-bold">{client.tasks} open tasks</span>
 )}
 </div>
 </div>
 </Link>
 );
 })}

 {/* Add Client Card */}
 <Link
 href="/dashboard/clients/new"
 className="group bg-card border border-dashed border-border hover:border-amber-500/50 rounded-[20px] p-5 flex flex-col items-center justify-center gap-3 transition-all duration-200 min-h-[220px]"
 >
 <div className="w-11 h-11 rounded-[20px] bg-muted-bg border border-border group-hover:border-amber-500/30 flex items-center justify-center transition-colors">
 <Plus className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
 </div>
 <p className="text-sm text-muted-foreground group-hover:text-foreground transition-colors font-medium">Add new client</p>
 </Link>
 </div>
 </div>
 </div>
 );
}
