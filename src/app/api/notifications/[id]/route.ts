import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    try {
      await supabase.from("notifications").delete().eq("id", id);
    } catch {
      // Ignore error
    }

    return NextResponse.json({ success: true, message: `Notification ${id} deleted` });
  } catch (e) {
    return NextResponse.json(
      { success: false, error: e instanceof Error ? e.message : "Failed to delete" },
      { status: 500 }
    );
  }
}
