import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireSuperAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

const VALID_STATUS = ["new", "triaged", "in_progress", "done", "archived"];

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
 try {
 await requireSuperAdmin();
 const { id } = await ctx.params;
 const supabase = await createClient();
 const body = (await req.json()) as { status?: string; admin_notes?: string };

 const patch: Record<string, unknown> = {};
 if (body.status !== undefined) {
 if (!VALID_STATUS.includes(body.status)) {
 return NextResponse.json({ error: "Invalid status" }, { status: 400 });
 }
 patch.status = body.status;
 }
 if (body.admin_notes !== undefined) patch.admin_notes = body.admin_notes;
 if (Object.keys(patch).length === 0) {
 return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
 }

 const { error } = await supabase.from("feedback").update(patch).eq("id", id);
 if (error) return NextResponse.json({ error: error.message }, { status: 500 });
 return NextResponse.json({ ok: true });
 } catch (e) {
 return NextResponse.json({ error: e instanceof Error ? e.message : "Failed" }, { status: 500 });
 }
}
