import { NextResponse } from "next/server";

export async function DELETE() {
  return NextResponse.json({ success: true, message: "All notifications cleared" });
}

export async function PATCH() {
  return NextResponse.json({ success: true, message: "All notifications cleared" });
}
