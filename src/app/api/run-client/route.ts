import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAgency } from "@/lib/auth";
import { runKeywordsForClient, type RunResult, type TrackedKeyword } from "@/lib/run-pipeline";

export const maxDuration = 300;
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
 try {
 const { client_id, keyword_ids } = (await req.json()) as {
 client_id: string;
 keyword_ids?: string[];
 };

 if (!client_id) {
 return NextResponse.json({ error: "client_id required" }, { status: 400 });
 }

 const session = await requireAgency();
 const supabase = await createClient();
 const isSuperAdmin = session.role === "super_admin";

 // Super admin can run any client across the platform; agency users
 // stay scoped to their own.
 let clientQuery = supabase
 .from("clients")
 .select("id, agency_id, ai_mode_enabled, ai_overview_enabled, rank_tracking_enabled, chatgpt_enabled")
 .eq("id", client_id);
 if (!isSuperAdmin) {
 clientQuery = clientQuery.eq("agency_id", session.agencyId);
 }
 const { data: client } = await clientQuery.single();

 if (!client) {
 return NextResponse.json({ error: "Client not found" }, { status: 404 });
 }

 let query = supabase
 .from("tracked_keywords")
 .select("id, keyword, domain, brand, location, track_type, client_id")
 .eq("client_id", client_id)
 .eq("is_active", true);

 if (keyword_ids?.length) query = query.in("id", keyword_ids);

 const { data: keywords } = await query;
 const kws = (keywords ?? []) as TrackedKeyword[];

 const result: RunResult = await runKeywordsForClient({
 agencyId: client.agency_id as string,
 clientId: client_id,
 client: {
 ai_mode_enabled: client.ai_mode_enabled,
 ai_overview_enabled: client.ai_overview_enabled,
 rank_tracking_enabled: client.rank_tracking_enabled,
 chatgpt_enabled: client.chatgpt_enabled,
 },
 keywords: kws,
 });

 return NextResponse.json(result);
 } catch (err) {
 return NextResponse.json(
 { error: err instanceof Error ? err.message : "Run failed" },
 { status: 500 }
 );
 }
}
