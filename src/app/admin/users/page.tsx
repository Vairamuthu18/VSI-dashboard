"use client";

import { useState } from "react";
import { Users, Shield, UserX, UserCheck, Building2, Calendar, Mail, Search } from "lucide-react";

const MOCK_USERS = [
 { id: "u1", email: "admin@valgrow.com", full_name: "Mubarak AlFalasi", role: "super_admin", agency_name: "ValGrow Digital", is_disabled: false, agency_is_disabled: false, created_at: "2025-01-15" },
 { id: "u2", email: "user@valgrow.com", full_name: "Sara Ahmed", role: "member", agency_name: "ValGrow Digital", is_disabled: false, agency_is_disabled: false, created_at: "2025-01-20" },
 { id: "u3", email: "ab@abagency.com", full_name: "Abdullah Bakr", role: "admin", agency_name: "AB Agency", is_disabled: false, agency_is_disabled: false, created_at: "2025-03-10" },
 { id: "u4", email: "alex@alexco.com", full_name: "Alex Johnson", role: "admin", agency_name: "ALEX Co.", is_disabled: false, agency_is_disabled: false, created_at: "2025-04-01" },
 { id: "u5", email: "afaaf@afaaftest.com", full_name: "Afaaf Malik", role: "admin", agency_name: "Afaaf Test", is_disabled: false, agency_is_disabled: false, created_at: "2025-04-18" },
 { id: "u6", email: "salma@salmaagency.com", full_name: "Salma Hassan", role: "admin", agency_name: "Salma Agency", is_disabled: false, agency_is_disabled: false, created_at: "2025-05-02" },
 { id: "u7", email: "chris@chrismcelroy.com", full_name: "Chris McElroy", role: "admin", agency_name: "McElroy Digital", is_disabled: false, agency_is_disabled: false, created_at: "2025-05-20" },
 { id: "u8", email: "test@testb4.com", full_name: "Test Pilot User", role: "member", agency_name: "TestB4 Labs", is_disabled: true, agency_is_disabled: true, created_at: "2025-06-01" },
 { id: "u9", email: "readonly@valgrow.com", full_name: "Readonly Member", role: "viewer", agency_name: "ValGrow Digital", is_disabled: false, agency_is_disabled: false, created_at: "2025-06-10" },
];

const ROLE_BADGE: Record<string, string> = {
 super_admin: "bg-[#FF4500]/10 text-[#FF4500] border-[#FF4500]/20",
 admin: "bg-blue-500/10 text-blue-400 border-blue-500/20",
 member: "bg-[#00E676]/10 text-[#00E676] border-[#00E676]/20",
 viewer: "bg-gray-500/10 text-gray-400 border-gray-500/20",
};

const ROLE_FILTERS = ["all", "super_admin", "admin", "member", "viewer"];

export default function UsersPage() {
 const [search, setSearch] = useState("");
 const [roleFilter, setRoleFilter] = useState("all");

 const q = search.trim().toLowerCase();
 const filtered = MOCK_USERS.filter(u => {
 if (roleFilter !== "all" && u.role !== roleFilter) return false;
 if (q && !u.full_name.toLowerCase().includes(q) && !u.email.toLowerCase().includes(q) && !u.agency_name.toLowerCase().includes(q)) return false;
 return true;
 });

 const counts = {
 total: MOCK_USERS.length,
 active: MOCK_USERS.filter(u => !u.is_disabled).length,
 disabled: MOCK_USERS.filter(u => u.is_disabled).length,
 admins: MOCK_USERS.filter(u => u.role === "admin" || u.role === "super_admin").length,
 };

 return (
 <div className="space-y-6">

 {/* Header */}
 <div className="flex items-center gap-3">
 <div className="w-10 h-10 rounded-[20px] bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
 <Users className="w-5 h-5 text-blue-400" />
 </div>
 <div>
 <h1 className="text-2xl font-semibold text-white tracking-tight">Users</h1>
 <p className="text-sm text-gray-500 mt-0.5">All registered accounts. Disable to revoke access without deleting.</p>
 </div>
 </div>

 {/* Stats */}
 <div className="grid grid-cols-4 gap-4">
 {[
 { label: "Total", value: counts.total, Icon: Users, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
 { label: "Active", value: counts.active, Icon: UserCheck, color: "text-[#00E676]", bg: "bg-[#00E676]/10", border: "border-[#00E676]/20" },
 { label: "Disabled", value: counts.disabled, Icon: UserX, color: "text-[#FF4500]", bg: "bg-[#FF4500]/10", border: "border-[#FF4500]/20" },
 { label: "Admins", value: counts.admins, Icon: Shield, color: "text-[#FFD600]", bg: "bg-[#FFD600]/10", border: "border-[#FFD600]/20" },
 ].map(({ label, value, Icon, color, bg, border }) => (
 <div key={label} className={`bg-[#161616] border ${border} rounded-[20px] p-5 flex items-center gap-3 hover:bg-card transition-colors`}>
 <div className={`w-9 h-9 rounded-[20px] ${bg} flex items-center justify-center shrink-0`}>
 <Icon className={`w-4 h-4 ${color}`} />
 </div>
 <div>
 <p className="text-xl font-bold text-white">{value}</p>
 <p className="text-[11px] text-gray-500 uppercase tracking-wide">{label}</p>
 </div>
 </div>
 ))}
 </div>

 {/* Filters */}
 <div className="flex items-center justify-between gap-3">
 {/* Role pills */}
 <div className="flex items-center gap-1.5 bg-[#161616] rounded-full p-1 border border-white/5">
 {ROLE_FILTERS.map(role => (
 <button
 key={role}
 onClick={() => setRoleFilter(role)}
 className={`px-3 py-1.5 text-[12px] font-medium rounded-full transition-all duration-200 capitalize ${
 roleFilter === role
 ? "bg-card text-black shadow-sm"
 : "text-gray-400 hover:text-white"
 }`}
 >
 {role === "all" ? "All" : role.replace("_", " ")}
 </button>
 ))}
 </div>

 {/* Search */}
 <div className="relative">
 <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
 <input
 type="text"
 value={search}
 onChange={e => setSearch(e.target.value)}
 placeholder="Search users…"
 className="bg-[#161616] border border-white/5 rounded-[20px] pl-9 pr-3 py-2 text-[13px] text-gray-200 placeholder-gray-600 focus:outline-none focus:border-[#FF4500]/40 w-56 transition-colors"
 />
 </div>
 </div>

 {/* Users table */}
 <div className="bg-[#161616] border border-white/5 rounded-[20px] overflow-hidden">
 {/* Table header */}
 <div className="grid grid-cols-12 gap-2 px-6 py-3 border-b border-white/5 text-[11px] text-gray-500 font-medium uppercase tracking-wider">
 <div className="col-span-3">Name</div>
 <div className="col-span-3">Email</div>
 <div className="col-span-2">Agency</div>
 <div className="col-span-1 text-center">Role</div>
 <div className="col-span-1 text-center">Status</div>
 <div className="col-span-2 text-right">Joined</div>
 </div>

 {filtered.length === 0 ? (
 <div className="px-6 py-10 text-center text-sm text-gray-500">No users match your filters.</div>
 ) : (
 filtered.map((user) => (
 <div
 key={user.id}
 className={`grid grid-cols-12 gap-2 px-6 py-3.5 items-center border-t border-white/5 hover:bg-card/[0.02] transition-colors ${user.is_disabled ? "opacity-50" : ""}`}
 >
 {/* Name + avatar */}
 <div className="col-span-3 flex items-center gap-2.5">
 <div className="w-8 h-8 rounded-full bg-[#1C1C1E] border border-white/5 flex items-center justify-center shrink-0">
 <span className="text-xs font-bold text-gray-400">{(user.full_name ?? "?").charAt(0)}</span>
 </div>
 <div className="min-w-0">
 <p className="text-[13px] font-medium text-gray-200 truncate">{user.full_name ?? "—"}</p>
 </div>
 </div>

 {/* Email */}
 <div className="col-span-3 flex items-center gap-1.5">
 <Mail className="w-3 h-3 text-gray-700 shrink-0" />
 <span className="text-[12px] text-gray-400 truncate">{user.email ?? "—"}</span>
 </div>

 {/* Agency */}
 <div className="col-span-2">
 <div className="flex items-center gap-1.5">
 <Building2 className="w-3 h-3 text-gray-700 shrink-0" />
 <span className="text-[12px] text-gray-500 truncate">{user.agency_name ?? "—"}</span>
 </div>
 </div>

 {/* Role badge */}
 <div className="col-span-1 flex justify-center">
 <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${ROLE_BADGE[user.role ?? "member"] ?? ROLE_BADGE.member}`}>
 {(user.role ?? "member").replace("_", " ")}
 </span>
 </div>

 {/* Status */}
 <div className="col-span-1 flex justify-center">
 {user.is_disabled ? (
 <span className="flex items-center gap-1 text-[11px] text-[#FF4500]">
 <UserX className="w-3 h-3" />
 Off
 </span>
 ) : (
 <span className="flex items-center gap-1 text-[11px] text-[#00E676]">
 <UserCheck className="w-3 h-3" />
 On
 </span>
 )}
 </div>

 {/* Joined */}
 <div className="col-span-2 flex justify-end">
 <div className="flex items-center gap-1 text-[11px] text-gray-600">
 <Calendar className="w-3 h-3" />
 {user.created_at}
 </div>
 </div>
 </div>
 ))
 )}
 </div>
 </div>
 );
}

