import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAgency } from "@/lib/auth";

const ALLOWED_KEYS = new Set([
 "display_name",
 "primary_color",
 "support_email",
 "report_footer",
 "logo_url",
]);

const HEX_COLOR = /^#[0-9A-Fa-f]{6}$/;

export async function POST(req: NextRequest) {
 try {
 const session = await requireAgency();
 const body = (await req.json()) as Record<string, unknown>;

 const update: Record<string, unknown> = {};
 for (const [key, value] of Object.entries(body)) {
 if (!ALLOWED_KEYS.has(key)) continue;

 if (key === "primary_color") {
 if (value === null || value === "") {
 update[key] = null;
 } else if (typeof value === "string" && HEX_COLOR.test(value)) {
 update[key] = value;
 }
 continue;
 }
 // Free-text fields — coerce empty string to null
 if (value === null) {
 update[key] = null;
 } else if (typeof value === "string") {
 const trimmed = value.trim();
 if (trimmed.length > 5000) continue; // safety cap
 update[key] = trimmed || null;
 }
 }

 if (Object.keys(update).length === 0) {
 return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
 }

 const supabase = await createClient();
 const { error } = await supabase
 .from("agencies")
 .update(update)
 .eq("id", session.agencyId);

 if (error) return NextResponse.json({ error: error.message }, { status: 500 });
 return NextResponse.json({ ok: true });
 } catch (err) {
 return NextResponse.json(
 { error: err instanceof Error ? err.message : "Failed" },
 { status: 500 }
 );
 }
}
