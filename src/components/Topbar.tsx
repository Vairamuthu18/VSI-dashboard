"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { 
  Search, Bell, Mail, Command, Sun, Moon, User, LogOut, Settings, ChevronDown, Building2, Shield 
} from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { useMessages } from "@/contexts/MessagesContext";

interface TopbarProps {
  userEmail: string;
  userRole: string;
  agencyName: string;
}

export default function Topbar({ userEmail, userRole, agencyName }: TopbarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const { resolvedTheme, toggleTheme, theme, setTheme } = useTheme();
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);
  const { unreadCount } = useMessages();

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleSignOut() {
    setShowProfileMenu(false);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
    router.refresh();
  }

  const displayName = React.useMemo(() => {
    const localPart = userEmail.split("@")[0] || "";
    return localPart
      .split(/[._-]/)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");
  }, [userEmail]);

  const initials = React.useMemo(() => {
    const parts = displayName.split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return displayName.slice(0, 2).toUpperCase();
  }, [displayName]);

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between gap-4 px-6 py-3 bg-card/90 backdrop-blur-md border-b border-border transition-colors">
      {/* Left: Global Search input */}
      <div className="flex-1 max-w-md relative">
        <div className="relative flex items-center w-full">
          <Search size={15} className="absolute left-3.5 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search keywords, clients, AI citations..."
            className="w-full bg-muted-bg/40 border border-border rounded-[20px] pl-9 pr-14 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-amber-500 focus:bg-card focus:ring-2 focus:ring-amber-500/10 transition-all shadow-2xs"
          />
          {!searchQuery ? (
            <div className="absolute right-3 pointer-events-none hidden sm:flex items-center gap-0.5 text-[10px] font-mono font-semibold text-muted-foreground bg-muted-bg border border-border px-1.5 py-0.5 rounded-md">
              <Command size={10} /> K
            </div>
          ) : (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 text-[10px] uppercase font-bold text-muted-foreground hover:text-foreground px-1.5 py-0.5 rounded bg-muted-bg cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>

        {/* Global Search Results Overlay */}
        {searchQuery.trim() && (
          <div className="absolute left-0 right-0 mt-2 rounded-[20px] bg-card border border-border p-3 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150 space-y-2">
            <div className="px-2 py-1 flex items-center justify-between text-[11px] font-bold text-muted-foreground uppercase tracking-wider border-b border-border pb-2">
              <span>Quick Navigation Results</span>
              <span>Press ESC to close</span>
            </div>

            <div className="space-y-1 max-h-60 overflow-y-auto">
              {[
                { title: "Acme Corp — Overview", category: "Client", href: "/dashboard/clients/mock-client-1" },
                { title: "VG Digital — Keywords", category: "Client", href: "/dashboard/clients/1" },
                { title: "Athariw — Tasks", category: "Client", href: "/dashboard/clients/2" },
                { title: "Quick Diagnostics Engine", category: "Tool", href: "/dashboard/check" },
                { title: "Competitor Benchmark", category: "Intelligence", href: "/dashboard/competitors" },
                { title: "Tasks & Execution Audits", category: "Tasks", href: "/dashboard/tasks" },
                { title: "AI Prompt Manager", category: "Prompts", href: "/dashboard/prompts" },
              ]
                .filter((item) => item.title.toLowerCase().includes(searchQuery.toLowerCase()) || item.category.toLowerCase().includes(searchQuery.toLowerCase()))
                .slice(0, 5)
                .map((item, idx) => (
                  <Link
                    key={idx}
                    href={item.href}
                    onClick={() => setSearchQuery("")}
                    className="flex items-center justify-between px-3 py-2 rounded-[14px] text-xs font-semibold text-foreground hover:bg-muted-bg transition-colors"
                  >
                    <span className="truncate">{item.title}</span>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20 shrink-0 ml-2">
                      {item.category}
                    </span>
                  </Link>
                ))}
            </div>
          </div>
        )}
      </div>

      {/* Right: Quick actions, live status pill, theme toggle & user profile */}
      <div className="flex items-center gap-3">
        {/* Live AI Engine Status Pill */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-semibold shadow-2xs">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span>AI Engine Active</span>
        </div>

        {/* Action icons & Theme toggle */}
        <div className="flex items-center gap-1">
          <button
            onClick={toggleTheme}
            type="button"
            className="p-2 rounded-[20px] text-muted-foreground hover:text-foreground hover:bg-muted-bg transition-colors cursor-pointer"
            title="Toggle Dark/Light Mode"
          >
            {resolvedTheme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <Link
            href="/dashboard/notifications"
            className="relative p-2 rounded-[20px] text-muted-foreground hover:text-foreground hover:bg-muted-bg transition-colors cursor-pointer"
            title="Notifications"
          >
            <Bell size={18} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-card" />
          </Link>

          <Link
            href="/dashboard/messages"
            className="relative p-2 rounded-[20px] text-muted-foreground hover:text-foreground hover:bg-muted-bg transition-colors cursor-pointer"
            title="Messages & Reports"
          >
            <Mail size={18} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 flex items-center justify-center w-3.5 h-3.5 rounded-full bg-rose-500 text-[9px] font-bold text-white ring-2 ring-card">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Link>
        </div>

        <div className="h-5 w-px bg-border hidden sm:block" />

        {/* User Profile Dropdown Button */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            type="button"
            className={`flex items-center gap-2.5 p-1.5 rounded-[20px] hover:bg-muted-bg border border-transparent transition-all cursor-pointer ${
              showProfileMenu ? "bg-muted-bg border-border ring-2 ring-amber-500/20" : ""
            }`}
          >
            <div className="relative">
              <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-white font-bold text-xs shadow-2xs ring-2 ring-card">
                {initials}
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-card" title="Active" />
            </div>

            <div className="hidden sm:block text-left min-w-0">
              <p className="text-xs font-bold text-foreground leading-tight truncate max-w-[130px]">
                {displayName}
              </p>
              <p className="text-[10px] text-muted-foreground capitalize truncate max-w-[130px] font-medium">
                {userRole.replace("_", " ")}
              </p>
            </div>
            <ChevronDown size={14} className={`text-muted-foreground hidden sm:block transition-transform duration-200 ${showProfileMenu ? "rotate-180" : ""}`} />
          </button>

          {/* Interactive Profile Dropdown */}
          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-64 rounded-[24px] bg-card border border-border p-3 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150 space-y-3">
              {/* Profile info header */}
              <div className="p-3 rounded-[16px] bg-muted-bg/60 border border-border/80">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-amber-500 flex items-center justify-center text-white font-bold text-xs shadow-sm">
                    {initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-foreground truncate">{displayName}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{userEmail}</p>
                    <span className="inline-block mt-1 text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20">
                      {userRole.replace("_", " ")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Navigation Menu Options */}
              <div className="space-y-1">
                <Link
                  href="/dashboard/settings"
                  onClick={() => setShowProfileMenu(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-[14px] text-xs font-semibold text-foreground hover:bg-muted-bg transition-colors"
                >
                  <Settings size={15} className="text-amber-500" />
                  <span>Account & Appearance</span>
                </Link>

                <Link
                  href="/dashboard/agency-settings"
                  onClick={() => setShowProfileMenu(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-[14px] text-xs font-semibold text-foreground hover:bg-muted-bg transition-colors"
                >
                  <Building2 size={15} className="text-amber-500" />
                  <span>Agency White-Label</span>
                </Link>

                {userRole === "super_admin" && (
                  <Link
                    href="/admin"
                    onClick={() => setShowProfileMenu(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-[14px] text-xs font-semibold text-foreground hover:bg-muted-bg transition-colors"
                  >
                    <Shield size={15} className="text-amber-500" />
                    <span>Admin Console</span>
                  </Link>
                )}
              </div>

              {/* Theme Quick Switcher */}
              <div className="pt-2 border-t border-border">
                <div className="flex items-center justify-between px-3 py-1">
                  <span className="text-[11px] font-semibold text-muted-foreground">Theme</span>
                  <button
                    type="button"
                    onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted-bg border border-border text-[11px] font-bold text-foreground hover:border-amber-500/50 transition-colors cursor-pointer"
                  >
                    {theme === "dark" ? (
                      <>
                        <Moon size={12} className="text-amber-500" />
                        <span>Dark</span>
                      </>
                    ) : (
                      <>
                        <Sun size={12} className="text-amber-500" />
                        <span>Light</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Sign Out Button */}
              <div className="pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-[14px] text-xs font-bold text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                >
                  <LogOut size={15} />
                  <span>Sign out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
