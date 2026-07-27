import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireSuperAdmin } from "@/lib/auth";
import { DEFAULT_PROMPTS, type PromptKey } from "@/lib/prompts";

function isPromptKey(s: string): s is PromptKey {
 return s in DEFAULT_PROMPTS;
}

export async function POST(req: NextRequest, ctx: { params: Promise<{ key: string }> }) {
 try {
 const session = await requireSuperAdmin();
 const { key } = await ctx.params;
 if (!isPromptKey(key)) {
 return NextResponse.json({ error: "Unknown prompt key" }, { status: 400 });
 }

 const body = (await req.json()) as { template?: string };
 const template = (body.template ?? "").trim();
 if (template.length < 100) {
 return NextResponse.json({ error: "Template is too short" }, { status: 400 });
 }
 if (template.length > 50000) {
 return NextResponse.json({ error: "Template is too long (>50k chars)" }, { status: 400 });
 }

 const supabase = await createClient();
 const { error } = await supabase
 .from("prompts")
 .upsert(
 {
 key,
 template,
 description: DEFAULT_PROMPTS[key].description,
 template_vars: DEFAULT_PROMPTS[key].variables,
 updated_by: session.userId,
 updated_at: new Date().toISOString(),
 },
 { onConflict: "key" }
 );
 if (error) return NextResponse.json({ error: error.message }, { status: 500 });
 return NextResponse.json({ ok: true });
 } catch (err) {
 return NextResponse.json(
 { error: err instanceof Error ? err.message : "Failed" },
 { status: 500 }
 );
 }
}

export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ key: string }> }) {
 try {
 await requireSuperAdmin();
 const { key } = await ctx.params;
 if (!isPromptKey(key)) {
 return NextResponse.json({ error: "Unknown prompt key" }, { status: 400 });
 }
 const supabase = await createClient();
 const { error } = await supabase.from("prompts").delete().eq("key", key);
 if (error) return NextResponse.json({ error: error.message }, { status: 500 });
 return NextResponse.json({ ok: true });
 } catch (err) {
 return NextResponse.json(
 { error: err instanceof Error ? err.message : "Failed" },
 { status: 500 }
 );
 }
}
