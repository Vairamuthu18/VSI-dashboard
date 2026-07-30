"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { 
  LayoutDashboard, Search, Plus, LogOut, ShieldCheck, Menu, Settings, 
  CheckSquare, ChevronRight, Users, Terminal, MessageSquare, Sun, Moon,
  Sparkles, Layers
} from "lucide-react";
import { SERVICE_TYPE_LABELS, ServiceType } from "@/types/search";
import type { UserRole } from "@/lib/auth";
import { useTheme } from "@/components/ThemeProvider";

interface ClientEntry {
  id: string;
  name: string;
  service_type: ServiceType;
  agencyName?: string | null;
}

interface Props {
  agencyName: string;
  agencyLogoUrl?: string | null;
  clients: ClientEntry[];
  userRole: UserRole;
  userEmail: string;
  atClientCap?: boolean;
  showSidebarProfile?: boolean;
}

const navGroups = [
  {
    title: "MAIN NAVIGATION",
    items: [
      { href: "/dashboard", label: "Overview", Icon: LayoutDashboard },
      { href: "/dashboard/check", label: "Quick Diagnostics", Icon: Search },
      { href: "/dashboard/competitors", label: "Competitor Benchmark", Icon: Users },
    ],
  },
  {
    title: "AI INTELLIGENCE",
    items: [
      { href: "/dashboard/tasks", label: "Tasks & Audits", Icon: CheckSquare },
      { href: "/dashboard/prompts", label: "AI Prompt Manager", Icon: Terminal },
    ],
  },
  {
    title: "SUPPORT & SYSTEM",
    items: [
      { href: "/dashboard/feedback", label: "Feedback & Requests", Icon: MessageSquare },
      { href: "/dashboard/settings", label: "Settings & White-Label", Icon: Settings },
    ],
  },
];

export default function Sidebar({
  agencyName,
  agencyLogoUrl,
  clients,
  userRole,
  userEmail,
  atClientCap = false,
  showSidebarProfile = false,
}: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const { resolvedTheme, toggleTheme } = useTheme();

  useEffect(() => { setOpen(false); }, [pathname]);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
    router.refresh();
  }

  const isActive = (href: string) => pathname === href;
  const isClientOn = (id: string) => pathname.startsWith(`/dashboard/clients/${id}`);
  const onAdmin = pathname.startsWith("/admin");

  const sidebarContent = (
    <div className="flex flex-col h-full min-h-0 relative overflow-hidden bg-card">
      {/* 1. Brand Header */}
      <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-border/80 bg-card shrink-0 z-10">
        <Link href="/dashboard" className="flex items-center gap-3 min-w-0 group">
          <div className="relative flex-shrink-0 p-1.5 rounded-[20px] bg-primary/10 border border-primary/20 text-primary">
            <Image src="/logo.png" alt="SearchIntel" width={26} height={26} className="shrink-0 rounded-md" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="text-sm font-bold text-foreground tracking-tight leading-none group-hover:text-primary transition-colors">
                SearchIntel
              </p>
              <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                PRO
              </span>
            </div>
            <p className="mt-1 text-[10px] font-medium text-muted-foreground uppercase tracking-wider truncate leading-none">
              AI Search Intelligence
            </p>
          </div>
        </Link>
        <button
          onClick={() => setOpen(false)}
          className="md:hidden rounded-[20px] p-1.5 text-muted-foreground hover:bg-muted-bg hover:text-foreground transition-colors"
          title="Collapse Sidebar"
        >
          <span className="text-xs font-mono">←</span>
        </button>
      </div>

      {/* 2. Agency Workspace Card */}
      <div className="px-4 py-3 border-b border-border/80 bg-card/60 shrink-0 z-10">
        <div className="flex items-center justify-between gap-2 p-2 rounded-[20px] bg-card border border-border/80 shadow-2xs">
          <div className="flex items-center gap-2.5 min-w-0">
            {agencyLogoUrl ? (
              <Image src={agencyLogoUrl} alt={agencyName} width={24} height={24} className="rounded-lg shrink-0 object-contain shadow-2xs border border-border" unoptimized />
            ) : (
              <div className="w-6 h-6 rounded-lg bg-primary text-white flex items-center justify-center font-bold text-[11px] shadow-2xs">
                {agencyName.slice(0, 1).toUpperCase()}
              </div>
            )}
            <div className="min-w-0">
              <p className="text-xs font-bold text-foreground truncate">{agencyName}</p>
              <p className="text-[9px] text-muted-foreground font-medium uppercase tracking-wider">Enterprise Workspace</p>
            </div>
          </div>
          <Link
            href="/dashboard/settings"
            className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-muted-bg transition-colors shrink-0"
            title="Workspace Settings"
          >
            <Settings size={14} />
          </Link>
        </div>
      </div>

      {/* 3. Navigation & Portfolio Section (Full height, natural bottom scroll) */}
      <nav className={`flex-1 min-h-0 overflow-y-auto px-3.5 py-4 space-y-6 custom-scrollbar ${showSidebarProfile ? "pb-[140px]" : "pb-6"}`}>
        {userRole === "super_admin" && (
          <div className="space-y-1">
            <p className="px-2 text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest">ADMINISTRATION</p>
            <Link
              href="/admin"
              className={`flex items-center justify-between gap-2.5 rounded-[14px] px-4 py-2.5 text-xs transition-all ${
                onAdmin
                  ? "bg-amber-500 text-white font-bold shadow-sm"
                  : "text-muted-foreground hover:bg-muted-bg hover:text-foreground font-medium"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <ShieldCheck size={16} className={onAdmin ? "text-white" : "text-muted-foreground"} />
                <span>Super Admin Console</span>
              </div>
              <ChevronRight size={14} className={onAdmin ? "text-white" : "text-muted-foreground"} />
            </Link>
          </div>
        )}

        {navGroups.map((group) => (
          <div key={group.title} className="space-y-1">
            <p className="px-2 text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest">{group.title}</p>
            <div className="space-y-0.5">
              {group.items.map(({ href, label, Icon }) => {
                const active = isActive(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`flex items-center justify-between gap-2.5 rounded-[14px] px-4 py-2.5 text-xs transition-all ${
                      active
                        ? "bg-amber-500 text-white font-bold shadow-sm"
                        : "text-muted-foreground hover:bg-muted-bg hover:text-foreground rounded-[14px] font-medium"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon size={16} className={active ? "text-white" : "text-muted-foreground group-hover:text-foreground"} />
                      <span>{label}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}

        {/* Client Portfolio Section */}
        <div className="space-y-2 pt-3 border-t border-border/80">
          <div className="flex items-center justify-between px-2">
            <p className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest">
              {userRole === "super_admin" ? `CLIENTS (${clients.length})` : `PORTFOLIO (${clients.length})`}
            </p>
            <Link
              href="/dashboard/clients"
              className="text-[10px] font-bold text-primary hover:underline uppercase tracking-wider transition-colors"
            >
              ALL →
            </Link>
          </div>

          {clients.length === 0 ? (
            <div className="px-3 py-3 rounded-xl border border-dashed border-border text-center">
              <p className="text-xs text-muted-foreground font-medium">No clients tracked</p>
            </div>
          ) : (
            <ClientList clients={clients} isClientOn={isClientOn} />
          )}

          <Link
            href="/dashboard/clients/new"
            className="mt-2 flex items-center justify-between rounded-xl border border-dashed border-border hover:border-amber-500 bg-card hover:bg-amber-500/10 px-3 py-2 text-xs font-semibold text-foreground hover:text-amber-500 transition-all group"
          >
            <span className="flex items-center gap-2">
              <Plus size={14} className="text-amber-500 group-hover:scale-110 transition-transform" /> Add Client
            </span>
            <span className="text-[10px] text-muted-foreground font-mono">+</span>
          </Link>
        </div>
      </nav>

      {/* 4. Bottom User Profile Card (Conditionally rendered, disabled by default) */}
      {showSidebarProfile && (
        <div className="sticky bottom-0 left-0 right-0 z-20 px-4 py-3 border-t border-border/80 bg-card/95 backdrop-blur-md shrink-0 shadow-lg">
          <div className="p-3 bg-muted-bg/60 rounded-[18px] border border-border/80 space-y-2.5 shadow-2xs">
            <div className="flex items-center justify-between gap-2 px-1">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-foreground truncate" title={userEmail}>
                  {userEmail}
                </p>
                <p className="text-[10px] text-muted-foreground capitalize font-bold tracking-wide">
                  {userRole.replace("_", " ")}
                </p>
              </div>

              {/* Theme Toggle Icon Button */}
              <button
                onClick={toggleTheme}
                type="button"
                className="p-1.5 rounded-lg bg-card border border-border text-muted-foreground hover:text-primary transition-colors shadow-2xs shrink-0 cursor-pointer"
                title="Toggle Light/Dark Theme"
              >
                {resolvedTheme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
              </button>
            </div>

            <button
              onClick={handleSignOut}
              type="button"
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-card hover:bg-muted-bg border border-border px-3 py-2 text-xs font-bold text-foreground shadow-2xs transition-all cursor-pointer"
            >
              <LogOut size={14} /> Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="md:hidden sticky top-0 z-30 flex items-center justify-between bg-card border-b border-border px-4 py-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setOpen(true)}
            className="rounded-[20px] p-2 text-muted-foreground bg-card hover:bg-muted-bg transition-colors"
            aria-label="Open menu"
          >
            <Menu size={18} />
          </button>
          <Image src="/logo.png" alt="SearchIntel" width={24} height={24} className="rounded" />
          <p className="text-sm font-bold text-foreground tracking-tight">SearchIntel</p>
        </div>
        <p className="text-xs font-medium text-muted-foreground truncate max-w-[40%]">{agencyName}</p>
      </div>

      {/* Backdrop */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="md:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-xs transition-opacity"
          aria-hidden
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`
          flex flex-col bg-card border-r border-border/80 
          fixed md:sticky top-0 inset-y-0 left-0 z-50
          w-64 h-screen max-h-screen shrink-0 overflow-hidden
          transition-transform duration-200 ease-out shadow-xl md:shadow-none
          ${open ? "translate-x-0" : "-translate-x-full"} md:translate-x-0
        `}
        suppressHydrationWarning
      >
        {sidebarContent}
      </aside>
    </>
  );
}

function ClientList({
  clients,
  isClientOn,
}: {
  clients: ClientEntry[];
  isClientOn: (id: string) => boolean;
}) {
  const [filter, setFilter] = useState("");
  const showSearch = clients.length > 5;
  const q = filter.trim().toLowerCase();
  const filtered = q
    ? clients.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          (c.agencyName ?? "").toLowerCase().includes(q),
      )
    : clients;

  return (
    <div className="space-y-1.5">
      {showSearch && (
        <div className="px-0.5">
          <input
            type="text"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Filter clients..."
            className="w-full rounded-lg border border-border bg-card px-2.5 py-1 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-amber-500 transition-all"
          />
        </div>
      )}
      <div className="space-y-1">
        {filtered.length === 0 ? (
          <p className="px-2 py-1.5 text-xs text-muted-foreground italic">No matching clients.</p>
        ) : (
          filtered.map((client) => {
            const svc = SERVICE_TYPE_LABELS[client.service_type || "seo_geo"];
            const active = isClientOn(client.id);
            return (
              <Link
                key={client.id}
                href={`/dashboard/clients/${client.id}`}
                className={`flex items-center justify-between gap-2 rounded-[14px] px-3 py-2.5 text-xs transition-all group ${
                  active
                    ? "bg-amber-500 text-white font-bold rounded-[14px] shadow-sm"
                    : "text-muted-foreground hover:bg-muted-bg hover:text-foreground rounded-[14px]"
                }`}
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold text-xs">{client.name}</p>
                  <p className="text-[10px] font-medium opacity-80 truncate">
                    {client.agencyName ? client.agencyName : "Active"}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className={`rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                    active ? "bg-white/20 text-white" : "bg-muted-bg text-muted-foreground border border-border"
                  }`}>
                    {svc?.short || "SEO"}
                  </span>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
