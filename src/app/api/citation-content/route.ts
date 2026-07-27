import { NextRequest, NextResponse } from "next/server";
import { scrapeUrl } from "@/lib/firecrawl";
import { analyzeCitation } from "@/lib/llm";
import type { CitationIntelligence } from "@/lib/llm";

export interface CitationContent {
 url: string;
 title: string | null;
 description: string | null;
 markdown: string;
 wordCount: number;
 source: "firecrawl" | "fallback";
 intelligence: CitationIntelligence | null;
 fetchedAt: string;
}

export async function POST(req: NextRequest) {
 try {
 const { url, keyword, sourceName, clientBrand, analyze = false } = await req.json() as {
 url: string;
 keyword?: string;
 sourceName?: string;
 clientBrand?: string;
 analyze?: boolean; // true = run LLM, false = content only (fast)
 };

 if (!url?.startsWith("http")) {
 return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
 }

 const scraped = await scrapeUrl(url);

 let intelligence: CitationIntelligence | null = null;
 if (analyze && keyword && sourceName) {
 intelligence = await analyzeCitation(
 keyword,
 sourceName,
 scraped.markdown,
 clientBrand ?? "the client"
 );
 }

 return NextResponse.json({
 url: scraped.url,
 title: scraped.title,
 description: scraped.description,
 markdown: scraped.markdown.slice(0, 5000),
 wordCount: scraped.wordCount,
 source: scraped.source,
 intelligence,
 fetchedAt: new Date().toISOString(),
 } satisfies CitationContent);
 } catch (err) {
 const msg = err instanceof Error ? err.message : "Failed to fetch page";
 return NextResponse.json({ error: msg }, { status: 500 });
 }
}
