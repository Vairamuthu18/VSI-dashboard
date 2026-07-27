import { NextRequest, NextResponse } from "next/server";
import { analyzeAIO } from "@/lib/llm";

export async function POST(req: NextRequest) {
 try {
 const { keyword, brand, aioSnippet, citedSources } = await req.json() as {
 keyword: string;
 brand: string;
 aioSnippet: string;
 citedSources: string[];
 };

 if (!aioSnippet?.trim()) {
 return NextResponse.json({ error: "No AIO text to analyze" }, { status: 400 });
 }

 const result = await analyzeAIO(keyword, brand, aioSnippet, citedSources);
 return NextResponse.json(result);
 } catch {
 return NextResponse.json({ error: "Analysis failed" }, { status: 500 });
 }
}
