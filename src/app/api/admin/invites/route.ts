import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireSuperAdmin, generateInviteCode } from "@/lib/auth";

export async function POST(req: NextRequest) {
 try {
 const session = await requireSuperAdmin();
 const body = await req.json() as {
 email?: string | null;
 note?: string | null;
 role?: "pilot" | "super_admin";
 max_keywords?: number;
 };

 const role = body.role === "super_admin" ? "super_admin" : "pilot";
 const maxKeywords = role === "super_admin" ? 999999 : Math.max(1, body.max_keywords ?? 10);

 const supabase = await createClient();

 // Retry on the (statistically negligible) chance of a code collision
 for (let attempt = 0; attempt < 5; attempt++) {
 const code = generateInviteCode();
 const { data, error } = await supabase
 .from("invites")
 .insert({
 code,
 email: body.email ?? null,
 note: body.note ?? null,
 role,
 max_keywords: maxKeywords,
 created_by: session.userId,
 })
 .select("code")
 .single();

 if (!error && data) {
 return NextResponse.json({ code: data.code });
 }
 // Unique-violation → retry; anything else → bail
 if (error && error.code !== "23505") {
 return NextResponse.json({ error: error.message }, { status: 500 });
 }
 }

 return NextResponse.json({ error: "Could not generate a unique code, try again" }, { status: 500 });
 } catch (err) {
 return NextResponse.json(
 { error: err instanceof Error ? err.message : "Failed" },
 { status: 500 }
 );
 }
}
