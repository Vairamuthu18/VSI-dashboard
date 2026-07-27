import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAgency } from "@/lib/auth";
import type { TaskGroup, TaskOwner, TaskEffort, TaskImpact, AcceptanceCriterion, TaskContextSnapshot } from "@/lib/tasks";

export const dynamic = "force-dynamic";

async function snapshotFor(supabase: Awaited<ReturnType<typeof createClient>>, trackedKeywordId: string | null): Promise<TaskContextSnapshot | null> {
 if (!trackedKeywordId) return null;
 const { data } = await supabase
 .from("search_results")
 .select("rank_position, aio_present, client_cited, cited_domains, gap_label, created_at")
 .eq("tracked_keyword_id", trackedKeywordId)
 .order("created_at", { ascending: false })
 .limit(1)
 .maybeSingle();
 if (!data) return null;
 return {
 rankPosition: data.rank_position as number | null,
 gapLabel: data.gap_label as string,
 aioPresent: data.aio_present as boolean | null,
 clientCited: data.client_cited as boolean | null,
 citedDomainCount: ((data.cited_domains as string[] | null) ?? []).length,
 capturedAt: data.created_at as string,
 };
}

interface CreatePayload {
 client_id: string;
 tracked_keyword_id?: string | null;
 group_name: TaskGroup;
 owner?: TaskOwner | null;
 title: string;
 description?: string | null;
 acceptance?: AcceptanceCriterion[];
 effort?: TaskEffort | null;
 impact?: TaskImpact | null;
 due_date?: string | null;
}

export async function POST(req: NextRequest) {
 try {
 const session = await requireAgency();
 const supabase = await createClient();
 const body = (await req.json()) as CreatePayload;

 if (!body.client_id || !body.title || !body.group_name) {
 return NextResponse.json({ error: "client_id, title, group_name are required" }, { status: 400 });
 }

 // Look up the client's owning agency so super admin can create tasks
 // on any tenant's client without poisoning them with their own
 // agency_id.
 const isSuperAdmin = session.role === "super_admin";
 let clientQuery = supabase.from("clients").select("agency_id").eq("id", body.client_id);
 if (!isSuperAdmin) clientQuery = clientQuery.eq("agency_id", session.agencyId);
 const { data: clientRow } = await clientQuery.maybeSingle();
 if (!clientRow) {
 return NextResponse.json({ error: "Client not found" }, { status: 404 });
 }
 const owningAgencyId = (clientRow.agency_id as string) ?? session.agencyId;

 const snapshot = await snapshotFor(supabase, body.tracked_keyword_id ?? null);

 const { data, error } = await supabase
 .from("tasks")
 .insert({
 agency_id: owningAgencyId,
 client_id: body.client_id,
 tracked_keyword_id: body.tracked_keyword_id ?? null,
 group_name: body.group_name,
 owner: body.owner ?? null,
 title: body.title.trim(),
 description: body.description ?? null,
 acceptance: body.acceptance ?? [],
 effort: body.effort ?? null,
 impact: body.impact ?? null,
 due_date: body.due_date ?? null,
 context_snapshot: snapshot,
 created_by: session.userId,
 })
 .select("*")
 .single();

 if (error || !data) {
 return NextResponse.json({ error: error?.message ?? "Failed to create task" }, { status: 500 });
 }
 return NextResponse.json(data);
 } catch (e) {
 return NextResponse.json({ error: e instanceof Error ? e.message : "Failed" }, { status: 500 });
 }
}
