"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
 { href: "/dashboard", label: "Dashboard" },
 { href: "/dashboard/check", label: "Keywords" },
 { href: "/dashboard/clients", label: "Clients" },
 { href: "/dashboard/tasks", label: "Tasks" },
 { href: "/dashboard/agency-settings", label: "Settings" },
];

export default function DashboardNav() {
 const pathname = usePathname();

 const isActive = (href: string) => {
 if (href === "/dashboard") return pathname === "/dashboard";
 return pathname.startsWith(href);
 };

 return (
 <div className="hidden lg:flex items-center bg-gray-100 rounded-full p-1 border border-gray-200">
 {NAV_ITEMS.map(({ href, label }) => (
 <Link
 key={href}
 href={href}
 className={`px-5 py-2 text-[13px] font-medium rounded-full transition-all duration-200 ${
 isActive(href)
 ? "bg-card text-black shadow-sm"
 : "text-gray-500 hover:text-black"
 }`}
 >
 {label}
 </Link>
 ))}
 </div>
 );
}
