import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAgency } from "@/lib/auth";

// Engine toggles (ai_mode_enabled, ai_overview_enabled, …) are NOT in
// this list: they are super-admin-only and live behind /api/admin/
// clients/[id]/engines. Agencies can configure their own automation
// and overrides, but not the tracking mix.
const ALLOWED_KEYS = new Set([
 "check_frequency",
 "brief_model_override",
 "location_override",
]);

const VALID_FREQUENCIES = new Set(["manual", "daily", "every_3_days", "weekly"]);

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
 try {
 const { id } = await ctx.params;
 const session = await requireAgency();
 const body = (await req.json()) as Record<string, unknown>;

 // Validate keys + values
 const update: Record<string, unknown> = {};
 for (const [key, value] of Object.entries(body)) {
 if (!ALLOWED_KEYS.has(key)) continue;

 if (key === "check_frequency") {
 if (typeof value === "string" && VALID_FREQUENCIES.has(value)) {
 update[key] = value;
 }
 continue;
 }
 if (key === "brief_model_override" || key === "location_override") {
 if (value === null || (typeof value === "string" && value.length <= 100)) {
 update[key] = value || null;
 }
 continue;
 }
 // Boolean toggles — allow null (inherit) | true | false
 if (value === null || typeof value === "boolean") {
 update[key] = value;
 }
 }

 if (Object.keys(update).length === 0) {
 return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
 }

 const supabase = await createClient();
 let q = supabase.from("clients").update(update).eq("id", id);
 if (session.role !== "super_admin") q = q.eq("agency_id", session.agencyId);
 const { error } = await q;

 if (error) return NextResponse.json({ error: error.message }, { status: 500 });
 return NextResponse.json({ ok: true });
 } catch (err) {
 return NextResponse.json(
 { error: err instanceof Error ? err.message : "Failed" },
 { status: 500 }
 );
 }
}
