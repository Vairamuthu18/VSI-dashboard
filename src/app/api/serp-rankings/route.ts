import { NextRequest, NextResponse } from "next/server";
import { fetchBulkRanks } from "@/lib/serper";
import type { Location } from "@/types/search";

export async function POST(req: NextRequest) {
 try {
 const { keyword, domains, location } = await req.json() as {
 keyword: string;
 domains: string[];
 location: Location;
 };

 if (!keyword?.trim() || !domains?.length) {
 return NextResponse.json({ error: "Missing fields" }, { status: 400 });
 }

 // Cap at first 10 domains — one Serper call covers all of them
 const results = await fetchBulkRanks(keyword, domains.slice(0, 10), location);
 return NextResponse.json(results);
 } catch {
 return NextResponse.json({ error: "Failed to fetch rankings" }, { status: 500 });
 }
}
