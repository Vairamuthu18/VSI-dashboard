import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAgency } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
 try {
 const { id } = await ctx.params;
 const session = await requireAgency();
 const supabase = await createClient();

 let q = supabase
 .from("reports")
 .select("id, type, status, share_token, error_message, generated_at")
 .eq("id", id);
 if (session.role !== "super_admin") q = q.eq("agency_id", session.agencyId);
 const { data, error } = await q.maybeSingle();
 if (error) return NextResponse.json({ error: error.message }, { status: 500 });
 if (!data) return NextResponse.json({ error: "Report not found" }, { status: 404 });

 return NextResponse.json({
 id: data.id,
 type: data.type,
 status: data.status,
 share_url: `/r/${data.share_token}`,
 error: data.error_message,
 generated_at: data.generated_at,
 });
 } catch (e) {
 return NextResponse.json({ error: e instanceof Error ? e.message : "Failed" }, { status: 500 });
 }
}
