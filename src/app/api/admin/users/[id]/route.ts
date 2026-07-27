import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireSuperAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
 try {
 const session = await requireSuperAdmin();
 const { id } = await ctx.params;
 if (id === session.userId) {
 return NextResponse.json({ error: "You can't disable your own account." }, { status: 400 });
 }
 const body = (await req.json()) as { is_disabled?: boolean; disabled_reason?: string };
 if (typeof body.is_disabled !== "boolean") {
 return NextResponse.json({ error: "is_disabled is required (true / false)" }, { status: 400 });
 }
 const supabase = await createClient();
 const { error } = await supabase
 .from("profiles")
 .update({
 is_disabled: body.is_disabled,
 disabled_at: body.is_disabled ? new Date().toISOString() : null,
 disabled_reason: body.is_disabled ? (body.disabled_reason ?? null) : null,
 })
 .eq("id", id);
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
 if (id === session.userId) {
 return NextResponse.json({ error: "You can't delete your own account." }, { status: 400 });
 }
 const supabase = await createClient();
 // Deleting the profile row severs the user from every agency-scoped
 // resource (RLS denies access). The auth.users row is orphaned but
 // harmless — Supabase service-role deletion would be needed to remove
 // it fully, which we leave to manual cleanup.
 const { error } = await supabase.from("profiles").delete().eq("id", id);
 if (error) return NextResponse.json({ error: error.message }, { status: 500 });
 return NextResponse.json({ ok: true });
 } catch (e) {
 return NextResponse.json({ error: e instanceof Error ? e.message : "Failed" }, { status: 500 });
 }
}
