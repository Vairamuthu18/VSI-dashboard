"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldCheck, Search, Bell } from "lucide-react";

const NAV_ITEMS = [
 { href: "/admin", label: "Overview" },
 { href: "/admin/agencies", label: "Agencies" },
 { href: "/admin/users", label: "Users" },
 { href: "/admin/invites", label: "Invites" },
 { href: "/admin/analytics", label: "Analytics" },
 { href: "/admin/feedback", label: "Feedback" },
 { href: "/admin/prompts", label: "Prompts" },
 { href: "/admin/cron-runs", label: "Cron" },
 { href: "/admin/qa", label: "QA" },
 { href: "/admin/settings", label: "Settings" },
];

export default function AdminNav() {
 const pathname = usePathname();
 const isActive = (href: string) =>
 href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

 return (
 <div className="flex items-center justify-between mb-6 gap-4">
 {/* Logo */}
 <div className="flex items-center gap-2.5 shrink-0">
 <div className="w-7 h-7 rounded-lg bg-[#FF4500]/20 border border-[#FF4500]/30 flex items-center justify-center">
 <ShieldCheck className="w-3.5 h-3.5 text-[#FF4500]" />
 </div>
 <span className="text-[15px] font-bold text-white tracking-wide">SearchIntel</span>
 </div>

 {/* Pills */}
 <nav className="hidden md:flex items-center bg-[#161616] rounded-full p-1 border border-white/5 overflow-x-auto">
 {NAV_ITEMS.map(({ href, label }) => (
 <Link
 key={href}
 href={href}
 className={`px-3 py-1.5 text-[12px] font-medium rounded-full transition-all duration-200 whitespace-nowrap ${
 isActive(href)
 ? "bg-card text-black shadow-sm"
 : "text-gray-400 hover:text-white"
 }`}
 >
 {label}
 </Link>
 ))}
 </nav>

 {/* Right actions */}
 <div className="flex items-center gap-2 shrink-0">
 <button className="w-8 h-8 rounded-full bg-[#161616] border border-white/5 flex items-center justify-center hover:bg-[#202020] transition-colors">
 <Search className="w-3.5 h-3.5 text-gray-400" />
 </button>
 <button className="w-8 h-8 rounded-full bg-[#161616] border border-white/5 flex items-center justify-center hover:bg-[#202020] transition-colors relative">
 <Bell className="w-3.5 h-3.5 text-gray-400" />
 <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[#FF4500] rounded-full" />
 </button>
 <div className="w-8 h-8 rounded-full bg-[#FF4500] text-white flex items-center justify-center font-bold text-[13px] border-2 border-[#1C1C1E]">
 S
 </div>
 </div>
 </div>
 );
}
