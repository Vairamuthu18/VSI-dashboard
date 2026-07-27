import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAgency } from "@/lib/auth";
import { track } from "@/lib/track";

export const dynamic = "force-dynamic";

type Category = "bug" | "idea" | "question" | "praise" | "general";
const VALID: Category[] = ["bug", "idea", "question", "praise", "general"];

interface Payload {
 category?: string;
 message?: string;
 page_url?: string;
 context_data?: Record<string, unknown> | null;
}

export async function POST(req: NextRequest) {
 try {
 const session = await requireAgency();
 const supabase = await createClient();
 const body = (await req.json()) as Payload;

 const category = body.category as Category;
 const message = (body.message ?? "").trim();
 if (!VALID.includes(category)) {
 return NextResponse.json({ error: "Invalid category" }, { status: 400 });
 }
 if (message.length < 4) {
 return NextResponse.json({ error: "Please write a short message (4+ characters)" }, { status: 400 });
 }
 if (message.length > 5000) {
 return NextResponse.json({ error: "Message is too long (5000 char max)" }, { status: 400 });
 }

 const userAgent = req.headers.get("user-agent")?.slice(0, 500) ?? null;

 const { data, error } = await supabase
 .from("feedback")
 .insert({
 agency_id: session.agencyId,
 user_id: session.userId,
 category,
 message,
 page_url: body.page_url?.slice(0, 500) ?? null,
 user_agent: userAgent,
 context_data: body.context_data ?? null,
 })
 .select("id")
 .single();
 if (error || !data) {
 return NextResponse.json({ error: error?.message ?? "Failed to submit" }, { status: 500 });
 }
 track({
 agencyId: session.agencyId,
 userId: session.userId,
 type: "feedback_submitted",
 payload: { category, page_url: body.page_url ?? null, message_length: message.length },
 });
 return NextResponse.json({ ok: true, id: data.id });
 } catch (e) {
 return NextResponse.json({ error: e instanceof Error ? e.message : "Failed" }, { status: 500 });
 }
}
