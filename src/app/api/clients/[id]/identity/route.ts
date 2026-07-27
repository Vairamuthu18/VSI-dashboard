import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAgency } from "@/lib/auth";
import { normaliseDomain } from "@/lib/url-input";

export const dynamic = "force-dynamic";

// Agency-scoped editor for a client's brand + website. Super admin gets
// the same fields via /api/admin/clients/[id]/identity — that variant
// skips the agency_id filter so they can fix any tenant.
export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
 try {
 const { id } = await ctx.params;
 const session = await requireAgency();
 const body = (await req.json()) as { website?: string; brand_name?: string };

 const update: Record<string, unknown> = {};

 if (typeof body.website === "string") {
 const trimmed = body.website.trim();
 if (!trimmed) {
 return NextResponse.json({ error: "Website is required" }, { status: 400 });
 }
 const norm = normaliseDomain(trimmed);
 if (!norm) {
 return NextResponse.json({ error: "Enter a valid domain like example.com" }, { status: 400 });
 }
 update.website = norm.domain;
 }

 if (typeof body.brand_name === "string") {
 const trimmed = body.brand_name.trim();
 if (!trimmed) {
 return NextResponse.json({ error: "Brand name is required" }, { status: 400 });
 }
 update.brand_name = trimmed;
 }

 if (Object.keys(update).length === 0) {
 return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
 }

 const supabase = await createClient();
 const isSuperAdmin = session.role === "super_admin";

 // Scope to the user's agency unless super admin. RLS would also
 // refuse cross-tenant writes, but the explicit filter gives a
 // cleaner 404 rather than a silent no-op.
 let clientQuery = supabase.from("clients").update(update).eq("id", id);
 if (!isSuperAdmin) {
 clientQuery = clientQuery.eq("agency_id", session.agencyId);
 }
 const { data: updated, error: cErr } = await clientQuery.select("id");
 if (cErr) return NextResponse.json({ error: cErr.message }, { status: 500 });
 if (!updated || updated.length === 0) {
 return NextResponse.json({ error: "Client not found" }, { status: 404 });
 }

 // Mirror the change to every tracked_keywords row for this client so
 // the pipeline picks up the corrected values on the next run.
 const kwUpdate: Record<string, unknown> = {};
 if ("website" in update) kwUpdate.domain = update.website;
 if ("brand_name" in update) kwUpdate.brand = update.brand_name;
 if (Object.keys(kwUpdate).length > 0) {
 let kwQuery = supabase.from("tracked_keywords").update(kwUpdate).eq("client_id", id);
 if (!isSuperAdmin) {
 kwQuery = kwQuery.eq("agency_id", session.agencyId);
 }
 await kwQuery;
 }

 return NextResponse.json({ ok: true });
 } catch (err) {
 return NextResponse.json(
 { error: err instanceof Error ? err.message : "Failed" },
 { status: 500 }
 );
 }
}
