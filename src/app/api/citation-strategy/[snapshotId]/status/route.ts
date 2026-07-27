import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAgency } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, ctx: { params: Promise<{ snapshotId: string }> }) {
 try {
 const { snapshotId } = await ctx.params;
 const session = await requireAgency();
 const supabase = await createClient();
 let q = supabase
 .from("search_results")
 .select("citation_strategy, citation_strategy_status, citation_strategy_error, citation_strategy_at")
 .eq("id", snapshotId);
 if (session.role !== "super_admin") q = q.eq("agency_id", session.agencyId);
 const { data, error } = await q.maybeSingle();
 if (error) return NextResponse.json({ error: error.message }, { status: 500 });
 if (!data) return NextResponse.json({ error: "Snapshot not found" }, { status: 404 });

 return NextResponse.json({
 status: data.citation_strategy_status ?? (data.citation_strategy ? "ready" : null),
 error: data.citation_strategy_error,
 strategy: data.citation_strategy_status === "ready" || (data.citation_strategy_status == null && data.citation_strategy)
 ? data.citation_strategy
 : null,
 generated_at: data.citation_strategy_at,
 });
 } catch (e) {
 return NextResponse.json({ error: e instanceof Error ? e.message : "Failed" }, { status: 500 });
 }
}
