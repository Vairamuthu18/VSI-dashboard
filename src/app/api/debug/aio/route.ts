import { NextRequest, NextResponse } from "next/server";
import { LOCATIONS } from "@/types/search";
import type { Location } from "@/types/search";

// Debug only — returns raw SerpAPI response so we can inspect the actual structure
// Remove this route before production
export async function POST(req: NextRequest) {
 const { keyword, location = "ae" } = await req.json() as { keyword: string; location: Location };

 const key = process.env.SERPAPI_KEY;
 if (!key) return NextResponse.json({ error: "No SERPAPI_KEY" }, { status: 500 });

 const loc = LOCATIONS[location];
 const params = new URLSearchParams({
 engine: "google",
 q: keyword,
 gl: loc.gl,
 hl: loc.hl,
 location: loc.location,
 api_key: key,
 });

 const res = await fetch(`https://serpapi.com/search?${params.toString()}`);
 const raw = await res.json();

 // Return only the ai_overview section to keep the response small
 return NextResponse.json({
 has_ai_overview: !!raw.ai_overview,
 ai_overview_keys: raw.ai_overview ? Object.keys(raw.ai_overview) : [],
 ai_overview: raw.ai_overview ?? null,
 });
}
