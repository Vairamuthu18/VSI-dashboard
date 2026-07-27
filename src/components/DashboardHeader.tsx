"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Bell } from "lucide-react";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/dashboard/check", label: "Keywords" },
  { href: "/dashboard/clients", label: "Clients" },
  { href: "/dashboard/tasks", label: "Tasks" },
  { href: "/dashboard/agency-settings", label: "Settings" },
];

interface Props {
  userName: string;
}

export default function DashboardHeader({ userName }: Props) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  return (
    <div className="sticky top-0 z-30 bg-white border-b border-gray-200 px-4 sm:px-6 py-3">
      <div className="max-w-[1400px] mx-auto flex items-center justify-between gap-4">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 flex flex-col gap-1 rotate-45 text-amber-500">
            <div className="w-full h-1 bg-amber-500 rounded-full"></div>
            <div className="w-3/4 h-1 bg-amber-500 rounded-full"></div>
          </div>
          <span className="text-[16px] font-bold text-gray-900 tracking-wide">SearchIntel</span>
        </div>

        {/* Nav Pills */}
        <nav className="hidden md:flex items-center bg-gray-100 rounded-full p-1 border border-gray-200">
          {NAV_ITEMS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`px-4 py-1.5 text-[13px] font-semibold rounded-full transition-all duration-200 ${
                isActive(href)
                  ? "bg-white text-gray-900 shadow-xs"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          <button className="w-9 h-9 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center hover:bg-gray-200 transition-colors">
            <Search className="w-3.5 h-3.5 text-gray-500" />
          </button>
          <Link href="/dashboard/notifications" className="w-9 h-9 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center hover:bg-gray-200 transition-colors relative">
            <Bell className="w-3.5 h-3.5 text-gray-500" />
            <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
          </Link>
          <div className="w-9 h-9 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold text-sm">
            {userName.charAt(0).toUpperCase()}
          </div>
        </div>
      </div>

      {/* Mobile nav */}
      <div className="md:hidden flex items-center gap-1 mt-2 overflow-x-auto pb-1 custom-scrollbar">
        {NAV_ITEMS.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className={`px-3 py-1.5 text-[12px] font-semibold rounded-full whitespace-nowrap transition-all duration-200 ${
              isActive(href)
                ? "bg-amber-500 text-white"
                : "text-gray-600 bg-gray-100 hover:bg-gray-200"
            }`}
          >
            {label}
          </Link>
        ))}
      </div>
    </div>
  );
}
