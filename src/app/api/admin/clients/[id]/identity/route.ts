import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireSuperAdmin } from "@/lib/auth";
import { normaliseDomain } from "@/lib/url-input";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
 try {
 await requireSuperAdmin();
 const { id } = await ctx.params;
 const supabase = await createClient();
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

 // Update the client.
 const { error } = await supabase.from("clients").update(update).eq("id", id);
 if (error) return NextResponse.json({ error: error.message }, { status: 500 });

 // Keep tracked_keywords in sync — they cache domain + brand so the
 // pipeline doesn't have to re-join on every run.
 const kwUpdate: Record<string, unknown> = {};
 if ("website" in update) kwUpdate.domain = update.website;
 if ("brand_name" in update) kwUpdate.brand = update.brand_name;
 if (Object.keys(kwUpdate).length > 0) {
 await supabase.from("tracked_keywords").update(kwUpdate).eq("client_id", id);
 }

 return NextResponse.json({ ok: true });
 } catch (e) {
 return NextResponse.json({ error: e instanceof Error ? e.message : "Failed" }, { status: 500 });
 }
}
