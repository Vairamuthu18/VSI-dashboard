import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
 try {
 const c = await cookies();
 const testerId = c.get("vsi_qa_tester")?.value;
 if (!testerId) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

 const { item_key, status, notes } = (await req.json()) as {
 item_key?: string; status?: string; notes?: string;
 };
 if (!item_key || !status) return NextResponse.json({ error: "item_key and status required" }, { status: 400 });

 const supabase = await createClient();
 const { error } = await supabase.rpc("qa_save_check", {
 p_tester_id: testerId,
 p_item_key: item_key,
 p_status: status,
 p_notes: notes ?? null,
 });
 if (error) return NextResponse.json({ error: error.message }, { status: 500 });
 return NextResponse.json({ ok: true });
 } catch (e) {
 return NextResponse.json({ error: e instanceof Error ? e.message : "Failed" }, { status: 500 });
 }
}
