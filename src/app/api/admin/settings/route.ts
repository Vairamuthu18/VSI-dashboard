import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireSuperAdmin } from "@/lib/auth";

// Boolean toggles
const BOOL_KEYS = new Set([
 "chatgpt_api_enabled",
 "openai_search_enabled",
 "openai_reports_enabled",
 "openai_citation_enabled",
]);

// Enum selects (allowed values listed below)
const ENUM_KEYS: Record<string, Set<string>> = {
 default_check_frequency: new Set(["manual", "daily", "every_3_days", "weekly"]),
 openai_chatgpt_model: new Set(["gpt-4o-mini", "gpt-4o"]),
 openai_summary_model: new Set(["gpt-4o-mini", "gpt-4o"]),
 openai_tasks_model: new Set(["gpt-4o-mini", "gpt-4o"]),
 openai_citation_model: new Set(["gpt-4o-mini", "gpt-4o"]),
};

const ALLOWED_KEYS = new Set<string>([...BOOL_KEYS, ...Object.keys(ENUM_KEYS)]);

export async function POST(req: NextRequest) {
 try {
 const session = await requireSuperAdmin();
 const body = await req.json() as { key?: string; value?: unknown };

 if (!body.key || !ALLOWED_KEYS.has(body.key)) {
 return NextResponse.json({ error: "Invalid setting key" }, { status: 400 });
 }
 if (BOOL_KEYS.has(body.key)) {
 if (typeof body.value !== "boolean") {
 return NextResponse.json({ error: "Value must be true or false" }, { status: 400 });
 }
 } else if (ENUM_KEYS[body.key]) {
 if (typeof body.value !== "string" || !ENUM_KEYS[body.key].has(body.value)) {
 return NextResponse.json({ error: `Invalid value for ${body.key}` }, { status: 400 });
 }
 }

 const supabase = await createClient();
 const { error } = await supabase
 .from("system_settings")
 .upsert(
 {
 key: body.key,
 value: body.value,
 updated_at: new Date().toISOString(),
 updated_by: session.userId,
 },
 { onConflict: "key" }
 );

 if (error) {
 return NextResponse.json({ error: error.message }, { status: 500 });
 }
 return NextResponse.json({ ok: true });
 } catch (err) {
 return NextResponse.json(
 { error: err instanceof Error ? err.message : "Failed" },
 { status: 500 }
 );
 }
}
