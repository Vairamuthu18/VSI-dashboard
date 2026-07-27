import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAgency } from "@/lib/auth";
import { buildReportContent, generateShareToken, type SnapshotRow } from "@/lib/report-builder";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

const RANGE_DAYS = 7; // Weekly report — last 7 days vs prior 7 days

export async function POST(req: NextRequest) {
 try {
 const { client_id } = (await req.json()) as { client_id?: string };
 if (!client_id) {
 return NextResponse.json({ error: "client_id required" }, { status: 400 });
 }

 const session = await requireAgency();
 const supabase = await createClient();
 const isSuperAdmin = session.role === "super_admin";

 // Fetch client. Super admin can act on any agency's client.
 let clientQuery = supabase
 .from("clients")
 .select("id, name, brand_name, website, service_type, agency_id")
 .eq("id", client_id);
 if (!isSuperAdmin) clientQuery = clientQuery.eq("agency_id", session.agencyId);
 const { data: client } = await clientQuery.single();
 if (!client) {
 return NextResponse.json({ error: "Client not found" }, { status: 404 });
 }
 const owningAgencyId = (client.agency_id as string) ?? session.agencyId;

 // Fetch agency branding for the owning agency, not the operator's.
 const { data: agency } = await supabase
 .from("agencies")
 .select("name, display_name, logo_url, primary_color, support_email, report_footer")
 .eq("id", owningAgencyId)
 .single();

 // Pull the last 14 days of snapshots, split into current/previous windows
 const cutoff = new Date(Date.now() - RANGE_DAYS * 2 * 86400 * 1000).toISOString();
 const { data: snapshots } = await supabase
 .from("search_results")
 .select("id, tracked_keyword_id, keyword, track_type, rank_position, aio_present, client_cited, mentioned_in_text, chatgpt_checked, chatgpt_brand_cited, chatgpt_brand_mentioned, citations_json, gap_label, created_at")
 .eq("client_id", client_id)
 .gte("created_at", cutoff)
 .order("created_at", { ascending: false });

 const rows: SnapshotRow[] = (snapshots ?? []) as unknown as SnapshotRow[];
 const splitTime = Date.now() - RANGE_DAYS * 86400 * 1000;
 const current = rows.filter((r) => new Date(r.created_at).getTime() >= splitTime);
 const previous = rows.filter((r) => new Date(r.created_at).getTime() < splitTime);

 const content = buildReportContent({
 client: {
 name: client.name,
 brandName: client.brand_name ?? null,
 website: client.website,
 servicePackage: client.service_type,
 },
 branding: {
 displayName: agency?.display_name ?? agency?.name ?? "VSI",
 logoUrl: agency?.logo_url ?? null,
 primaryColor: agency?.primary_color ?? "#F59E0B",
 supportEmail: agency?.support_email ?? null,
 footer: agency?.report_footer ?? null,
 },
 currentSnapshots: current,
 previousSnapshots: previous,
 rangeLabel: `Last ${RANGE_DAYS} days`,
 });

 const shareToken = generateShareToken();

 const { data: inserted, error } = await supabase
 .from("reports")
 .insert({
 agency_id: owningAgencyId,
 client_id: client_id,
 type: "weekly",
 share_token: shareToken,
 content,
 created_by: session.userId,
 })
 .select("id, share_token")
 .single();

 if (error || !inserted) {
 return NextResponse.json({ error: error?.message ?? "Failed to save report" }, { status: 500 });
 }

 const origin = req.headers.get("origin") ?? "https://searchintel.valgrowlabs.com";
 return NextResponse.json({
 id: inserted.id,
 share_token: inserted.share_token,
 share_url: `${origin}/r/${inserted.share_token}`,
 });
 } catch (err) {
 return NextResponse.json(
 { error: err instanceof Error ? err.message : "Failed" },
 { status: 500 }
 );
 }
}
