import { createClient } from "@/lib/supabase/server";
import { requireAgency } from "@/lib/auth";
import DashboardClientView from "@/components/DashboardClientView";

export default async function DashboardPage() {
  const session = await requireAgency();
  const supabase = await createClient();

  const isSuperAdmin = session.role === "super_admin";

  const clientsSelect = isSuperAdmin
    ? supabase
        .from("clients")
        .select("id, name, service_type, website, agency_id, agencies(name, display_name)")
        .order("created_at", { ascending: true })
    : supabase
        .from("clients")
        .select("id, name, service_type, website, agency_id")
        .eq("agency_id", session.agencyId)
        .order("created_at", { ascending: true });

  const kwCountQuery = isSuperAdmin
    ? supabase.from("tracked_keywords").select("*", { count: "exact", head: true }).eq("is_active", true)
    : supabase.from("tracked_keywords").select("*", { count: "exact", head: true })
        .eq("agency_id", session.agencyId).eq("is_active", true);

  const resultsQuery = isSuperAdmin
    ? supabase.from("search_results")
        .select("gap_label, client_id, keyword, track_type, rank_position, aio_present, client_cited, mentioned_in_text, created_at")
        .order("created_at", { ascending: false }).limit(5000)
    : supabase.from("search_results")
        .select("gap_label, client_id, keyword, track_type, rank_position, aio_present, client_cited, mentioned_in_text, created_at")
        .eq("agency_id", session.agencyId);

  const [
    { data: clients },
    { count: keywordCount },
    { data: recentResults },
    { data: agency },
  ] = await Promise.all([
    clientsSelect,
    kwCountQuery,
    resultsQuery,
    supabase
      .from("agencies")
      .select("max_clients, is_pilot")
      .eq("id", session.agencyId)
      .maybeSingle(),
  ]);

  const maxClients = agency?.max_clients as number | null | undefined;
  const clientList = clients ?? [];
  const rawResults = recentResults ?? [];

  return (
    <DashboardClientView
      isSuperAdmin={isSuperAdmin}
      clientList={clientList}
      keywordCount={keywordCount || 0}
      rawResults={rawResults}
      maxClients={maxClients}
    />
  );
}
