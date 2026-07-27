import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import ChatFloating from "@/components/ChatFloating";
import FeedbackButton from "@/components/FeedbackButton";
import { createClient } from "@/lib/supabase/server";
import { requireAgency } from "@/lib/auth";
import type { ServiceType } from "@/types/search";

import { NotificationsProvider } from "@/contexts/NotificationsContext";
import { MessagesProvider } from "@/contexts/MessagesContext";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
 const session = await requireAgency();

 const supabase = await createClient();
 // Super admins see every client across every agency in their sidebar so they
 // can drill into any tenant. Regular agency users see only their own.
 const isSuperAdmin = session.role === "super_admin";
 const clientsQuery = isSuperAdmin
 ? supabase
 .from("clients")
 .select("id, name, service_type, agencies(name, display_name)")
 .order("created_at", { ascending: true })
 : supabase
 .from("clients")
 .select("id, name, service_type")
 // BYPASSED FOR NOW
 const clients: any[] = [{
 id: "mock-client-1",
 name: "Acme Corp",
 service_type: "seo",
 website: "https://acme.com",
 agencyName: "Mock Agency"
 }];
 const agency = { max_clients: 999, is_pilot: false };
 /*
 const [{ data: clients }, { data: agency }] = await Promise.all([
 clientsQuery,
 supabase
 .from("agencies")
 .select("max_clients, is_pilot")
 .eq("id", session.agencyId)
 .maybeSingle(),
 ]);
 */
 const isPilot = !agency?.is_pilot;

 type ClientRow = {
 id: string; name: string; service_type: string | null;
 agencies?: { name?: string | null; display_name?: string | null } | { name?: string | null; display_name?: string | null }[] | null;
 };
 const safeClients = ((clients ?? []) as ClientRow[]).map((c) => {
 const agencyJoin = Array.isArray(c.agencies) ? c.agencies[0] : c.agencies;
 const agencyName = agencyJoin?.display_name ?? agencyJoin?.name ?? null;
 return {
 id: c.id,
 name: c.name,
 service_type: (c.service_type ?? "geo") as ServiceType,
 agencyName: isSuperAdmin ? agencyName : null,
 };
 });

 const maxClients = agency?.max_clients as number | null | undefined;
 // Cap only applies to non-super-admin users; super admins always see "Add" for their own agency.
 const atClientCap = !isSuperAdmin && typeof maxClients === "number" && safeClients.length >= maxClients;

 return (
 <NotificationsProvider>
  <MessagesProvider>
 <div className="md:flex min-h-screen md:h-screen bg-background text-foreground selection:bg-blue-500/20 relative overflow-x-hidden font-sans" suppressHydrationWarning>
 <Sidebar
 agencyName={session.branding.displayName || session.agencyName}
 agencyLogoUrl={session.branding.logoUrl}
 clients={safeClients}
 userRole={session.role}
 userEmail={session.email}
 atClientCap={atClientCap}
 />
 <main className="flex-1 flex flex-col md:overflow-y-auto relative z-10 min-w-0">
 <Topbar
 userEmail={session.email}
 userRole={session.role}
 agencyName={session.branding.displayName || session.agencyName}
 />
 {isPilot && !isSuperAdmin && (
 <div className="bg-amber-50 border-b border-amber-200 px-4 sm:px-8 py-2.5">
 <p className="text-xs sm:text-sm text-amber-900 leading-relaxed">
 <span className="inline-block rounded-full bg-amber-500 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 mr-2 align-middle">Pilot</span>
 Thanks for testing SearchIntel. Please try every feature — generate briefs, run citation analyses, ship tasks — and send feedback via the <strong className="text-amber-800 font-semibold">Feedback</strong> button.
 </p>
 </div>
 )}
 <div className="flex-1">
 {children}
 </div>
 </main>
 <ChatFloating />
  <FeedbackButton />
  </div>
  </MessagesProvider>
 </NotificationsProvider>
 );
}
