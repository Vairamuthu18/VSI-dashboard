import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
 try {
 const { code } = (await req.json()) as { code?: string };
 if (!code || typeof code !== "string") {
 return NextResponse.json({ error: "Code is required" }, { status: 400 });
 }
 const supabase = await createClient();
 const { data, error } = await supabase.rpc("qa_login", { p_code: code.trim() });
 if (error) return NextResponse.json({ error: error.message }, { status: 500 });
 const row = Array.isArray(data) ? data[0] : data;
 if (!row?.id) {
 return NextResponse.json({ error: "Unknown code" }, { status: 401 });
 }

 const res = NextResponse.json({ tester: { id: row.id, name: row.name } });
 // 7-day cookie; httpOnly so client JS can't read it.
 res.cookies.set("vsi_qa_tester", row.id as string, {
 httpOnly: true,
 sameSite: "lax",
 secure: process.env.NODE_ENV === "production",
 path: "/",
 maxAge: 60 * 60 * 24 * 7,
 });
 return res;
 } catch (e) {
 return NextResponse.json({ error: e instanceof Error ? e.message : "Failed" }, { status: 500 });
 }
}

export async function DELETE() {
 const res = NextResponse.json({ ok: true });
 res.cookies.delete("vsi_qa_tester");
 return res;
}
