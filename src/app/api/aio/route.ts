import { NextRequest, NextResponse } from "next/server";
import { fetchAIO } from "@/lib/serpapi";
import type { Location } from "@/types/search";

export async function POST(req: NextRequest) {
 try {
 const body = await req.json();
 const { keyword, domain, brand, location } = body as {
 keyword: string;
 domain: string;
 brand: string;
 location: Location;
 };

 if (!keyword?.trim() || !domain?.trim() || !location) {
 return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
 }

 const result = await fetchAIO(
 keyword.trim(),
 domain.trim(),
 (brand ?? "").trim(),
 location
 );
 return NextResponse.json(result);
 } catch {
 return NextResponse.json({ error: "Failed to fetch AI Mode data" }, { status: 500 });
 }
}
