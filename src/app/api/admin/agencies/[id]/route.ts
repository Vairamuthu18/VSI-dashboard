import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireSuperAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

interface Payload {
 max_clients?: number | null;
 max_keywords?: number;
 is_pilot?: boolean;
 is_disabled?: boolean;
 disabled_reason?: string;
}

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
 try {
 const session = await requireSuperAdmin();
 const { id } = await ctx.params;
 const supabase = await createClient();
 const body = (await req.json()) as Payload;

 const patch: Record<string, unknown> = {};
 if (body.max_clients !== undefined) {
 if (body.max_clients !== null && (!Number.isInteger(body.max_clients) || body.max_clients < 0)) {
 return NextResponse.json({ error: "max_clients must be null or a non-negative integer" }, { status: 400 });
 }
 patch.max_clients = body.max_clients;
 }
 if (body.max_keywords !== undefined) {
 if (!Number.isInteger(body.max_keywords) || body.max_keywords < 0) {
 return NextResponse.json({ error: "max_keywords must be a non-negative integer" }, { status: 400 });
 }
 patch.max_keywords = body.max_keywords;
 }
 if (body.is_pilot !== undefined) patch.is_pilot = !!body.is_pilot;
 if (body.is_disabled !== undefined) {
 if (id === session.agencyId) {
 return NextResponse.json({ error: "You can't disable your own agency." }, { status: 400 });
 }
 patch.is_disabled = !!body.is_disabled;
 patch.disabled_at = body.is_disabled ? new Date().toISOString() : null;
 patch.disabled_reason = body.is_disabled ? (body.disabled_reason ?? null) : null;
 }

 if (Object.keys(patch).length === 0) {
 return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
 }

 const { error } = await supabase.from("agencies").update(patch).eq("id", id);
 if (error) return NextResponse.json({ error: error.message }, { status: 500 });
 return NextResponse.json({ ok: true });
 } catch (e) {
 return NextResponse.json({ error: e instanceof Error ? e.message : "Failed" }, { status: 500 });
 }
}

export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
 try {
 const session = await requireSuperAdmin();
 const { id } = await ctx.params;
 if (id === session.agencyId) {
 return NextResponse.json({ error: "You can't delete your own agency." }, { status: 400 });
 }
 const supabase = await createClient();
 // Cascade FKs already remove clients / keywords / search_results /
 // reports / tasks tied to this agency. We don't touch auth.users.
 const { error } = await supabase.from("agencies").delete().eq("id", id);
 if (error) return NextResponse.json({ error: error.message }, { status: 500 });
 return NextResponse.json({ ok: true });
 } catch (e) {
 return NextResponse.json({ error: e instanceof Error ? e.message : "Failed" }, { status: 500 });
 }
}
