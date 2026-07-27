import { NextRequest, NextResponse } from "next/server";
import { requireAgency } from "@/lib/auth";
import { track } from "@/lib/track";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
 try {
 const session = await requireAgency();
 const { vote, scope_kind, message_index, note } = (await req.json()) as {
 vote?: "up" | "down";
 scope_kind?: string;
 message_index?: number;
 note?: string;
 };
 if (vote !== "up" && vote !== "down") {
 return NextResponse.json({ error: "vote must be 'up' or 'down'" }, { status: 400 });
 }
 track({
 agencyId: session.agencyId,
 userId: session.userId,
 type: "chat_thumbs",
 payload: {
 vote,
 scope_kind: scope_kind ?? null,
 message_index: typeof message_index === "number" ? message_index : null,
 note: typeof note === "string" ? note.slice(0, 500) : null,
 },
 });
 return NextResponse.json({ ok: true });
 } catch (e) {
 return NextResponse.json({ error: e instanceof Error ? e.message : "Failed" }, { status: 500 });
 }
}
