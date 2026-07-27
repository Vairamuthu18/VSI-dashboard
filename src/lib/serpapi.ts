import type { AIOResult, AIOCitation, AIOTextBlock, Location } from "@/types/search";
import { LOCATIONS, detectPlatform } from "@/types/search";
import { buildBrandTokens, matchesBrand } from "@/lib/brand-match";

// ─────────────────────────────────────────
// SerpApi response shape (engine=google + engine=google_ai_overview)
// ─────────────────────────────────────────

interface SerpApiTextBlock {
  type: "paragraph" | "heading" | "list" | "expandable" | "table" | "code_block" | string;
  snippet?: string;
  reference_indexes?: number[];
  list?: SerpApiTextBlock[];        // child blocks for list / expandable
  table?: string[][];               // 2D array of cells for AI Mode tables
  code?: string;                    // for code_block
  language?: string;                // for code_block
  title?: string;
}

interface SerpApiReference {
  index: number;
  title?: string;
  link: string;
  snippet?: string;
  source?: string;
}

interface SerpApiAIOverview {
  text_blocks?: SerpApiTextBlock[];
  references?: SerpApiReference[];
  page_token?: string;              // present when AIO must be fetched in a follow-up call
  thumbnail?: string;
  error?: string;
}


// ─────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────

function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

/** Flatten SerpApi text_blocks into plain text + structured UI blocks. */
function buildTextOutputs(blocks: SerpApiTextBlock[]): {
  snippet: string | null;
  fullText: string | null;
  uiBlocks: AIOTextBlock[];
} {
  const uiBlocks: AIOTextBlock[] = [];
  const allParts: string[] = [];

  function walk(block: SerpApiTextBlock) {
    if (block.type === "paragraph" || block.type === "heading") {
      const text = block.snippet?.trim();
      if (text) {
        uiBlocks.push({ type: "paragraph", snippet: text });
        allParts.push(text);
      }
    } else if (block.type === "list") {
      const listItems: string[] = [];
      for (const item of block.list ?? []) {
        const text = item.snippet?.trim();
        if (text) listItems.push(text);
      }
      if (listItems.length) {
        uiBlocks.push({ type: "list", list: listItems.map((s) => ({ snippet: s })) });
        allParts.push(...listItems);
      }
    } else if (block.type === "table" && block.table) {
      // Flatten table rows into readable lines: "Col1: val1 · Col2: val2"
      const [header, ...rows] = block.table;
      if (header && rows.length) {
        const lines = rows.map((row) =>
          row.map((cell, i) => `${header[i] ?? ""}: ${cell}`).filter((x) => x.trim()).join(" · ")
        ).filter((l) => l.trim());
        if (lines.length) {
          uiBlocks.push({ type: "list", list: lines.map((s) => ({ snippet: s })) });
          allParts.push(...lines);
        }
      }
    } else if (block.type === "code_block" && block.code) {
      const text = block.code.trim();
      if (text) {
        uiBlocks.push({ type: "paragraph", snippet: text });
        allParts.push(text);
      }
    } else if (block.type === "expandable" && block.list) {
      for (const child of block.list) walk(child);
    }
  }

  for (const block of blocks) walk(block);

  const fullText = allParts.join("\n").trim() || null;
  const snippet = allParts.join(" ").slice(0, 500).trim() || null;
  return { snippet, fullText, uiBlocks };
}

/**
 * Production AI signal — SerpApi engine=google_ai_mode (Google's AI Mode).
 *
 * Single 1-credit call that always returns rich data (text_blocks +
 * references + reconstructed_markdown). Replaces the unreliable two-step
 * AIO flow (engine=google → page_token → engine=google_ai_overview) that
 * frequently returned empty content even after expansion.
 *
 * Historical naming note: this function is still called fetchAIORaw and
 * returns SerpApiAIOverview to avoid churning 50+ call sites. The actual
 * data source is AI Mode. UI labels say "AI Mode".
 *
 * Users who want literal AIO data (the AI summary shown atop classic
 * Google search results, personalized to a real user session) opt into
 * the Chrome extension capture path instead — see git history.
 */
async function fetchAIORaw(
  keyword: string,
  loc: typeof LOCATIONS[Location],
  key: string,
  engine: "google_ai_mode" | "google_ai_overview" = "google_ai_mode",
): Promise<SerpApiAIOverview | null> {
  const params = new URLSearchParams({
    engine,
    q: keyword,
    gl: loc.gl,
    hl: loc.hl,
    location: loc.location,
    api_key: key,
  });
  const res = await fetch(`https://serpapi.com/search.json?${params.toString()}`, {
    signal: AbortSignal.timeout(60000),
  });
  if (!res.ok) throw new Error(`SerpApi HTTP ${res.status}`);
  const raw = (await res.json()) as {
    text_blocks?: SerpApiTextBlock[];
    references?: SerpApiReference[];
    error?: string;
    search_metadata?: { status?: string };
  };
  if (raw.error) throw new Error(`SerpApi error: ${raw.error}`);
  if (raw.search_metadata?.status === "Error") throw new Error("SerpApi AI Mode status=Error");

  if (!raw.text_blocks?.length && !raw.references?.length) return null;
  // Map AI Mode's top-level shape into the SerpApiAIOverview shape the
  // downstream code expects (text_blocks + references).
  return {
    text_blocks: raw.text_blocks,
    references: raw.references,
  };
}

// ─────────────────────────────────────────
// Main AIO fetcher
// ─────────────────────────────────────────

export async function fetchAIO(
  keyword: string,
  domain: string,
  brand: string,
  location: Location
): Promise<AIOResult> {
  const key = process.env.SERPAPI_API_KEY;
  if (!key) throw new Error("AI Mode service unavailable");

  const loc = LOCATIONS[location];
  const cleanDomain = (domain ?? "")
    .toLowerCase()
    .replace(/^[a-z]+:\/+/, "")
    .replace(/^www\./, "")
    .split(/[\/?#]/)[0]
    .replace(/:\d+$/, "");
  // Require a real hostname (e.g. "example.com") before we trust substring
  // matches — without this, a stored value like "https:" would match every
  // citation URL.
  const validClientDomain = cleanDomain.includes(".") && /[a-z]/.test(cleanDomain) ? cleanDomain : "";

  const aio = await fetchAIORaw(keyword, loc, key);

  const aioPresent = !!aio && (
    (aio.text_blocks?.length ?? 0) > 0 ||
    (aio.references?.length ?? 0) > 0
  );

  let aioSnippet: string | null = null;
  let aioFullText: string | null = null;
  let aioBlocks: AIOTextBlock[] = [];

  if (aio?.text_blocks?.length) {
    const out = buildTextOutputs(aio.text_blocks);
    aioSnippet = out.snippet;
    aioFullText = out.fullText;
    aioBlocks = out.uiBlocks;
  }

  // Citations from `references`
  const citations: AIOCitation[] = (aio?.references ?? [])
    .slice()
    .sort((a, b) => (a.index ?? 0) - (b.index ?? 0))
    .map((ref, i) => {
      const citDomain = extractDomain(ref.link);
      const isClient =
        !!validClientDomain && (citDomain === validClientDomain || citDomain.endsWith(`.${validClientDomain}`) || validClientDomain.endsWith(`.${citDomain}`));
      return {
        position: i + 1,
        sourceName: ref.source ?? citDomain,
        title: ref.title ?? null,
        domain: citDomain,
        url: ref.link,
        isClient,
        platform: detectPlatform(citDomain, cleanDomain),
      };
    });

  // Brand tokens drive ONLY the `mentionedInText` signal (did the AIO
  // answer text name the brand?). They no longer feed into `isClient` —
  // that flag is a strict host comparison against the tracked domain.
  // A page that mentions the brand in passing is not the client's page.
  const brandTokens = buildBrandTokens({ brand, domain });
  const mentionedInText = aioFullText ? matchesBrand(aioFullText, brandTokens) : false;

  const citedDomains = citations.map((c) => c.domain);
  const clientCited = citations.some((c) => c.isClient);

  return {
    keyword,
    domain,
    brand,
    location,
    aioPresent,
    aioSnippet,
    aioFullText,
    aioBlocks,
    citations,
    citedDomains,
    clientCited,
    mentionedInText,
  };
}

// ─────────────────────────────────────────
// AI Overview (engine=google_ai_overview)
// ─────────────────────────────────────────
// Same response shape as AI Mode — Google internally returns
// text_blocks + references for both surfaces. We reuse the same
// parser; only the engine parameter differs.

export async function fetchAIOverview(
  keyword: string,
  domain: string,
  brand: string,
  location: Location,
): Promise<AIOResult> {
  const key = process.env.SERPAPI_API_KEY;
  if (!key) throw new Error("AI Overview service unavailable");

  const loc = LOCATIONS[location];
  const cleanDomain = (domain ?? "")
    .toLowerCase()
    .replace(/^[a-z]+:\/+/, "")
    .replace(/^www\./, "")
    .split(/[\/?#]/)[0]
    .replace(/:\d+$/, "");
  // Require a real hostname (e.g. "example.com") before we trust substring
  // matches — without this, a stored value like "https:" would match every
  // citation URL.
  const validClientDomain = cleanDomain.includes(".") && /[a-z]/.test(cleanDomain) ? cleanDomain : "";

  const aio = await fetchAIORaw(keyword, loc, key, "google_ai_overview");
  const aioPresent = !!aio && (
    (aio.text_blocks?.length ?? 0) > 0 ||
    (aio.references?.length ?? 0) > 0
  );

  let aioSnippet: string | null = null;
  let aioFullText: string | null = null;
  let aioBlocks: AIOTextBlock[] = [];

  if (aio?.text_blocks?.length) {
    const out = buildTextOutputs(aio.text_blocks);
    aioSnippet = out.snippet;
    aioFullText = out.fullText;
    aioBlocks = out.uiBlocks;
  }

  const citations: AIOCitation[] = (aio?.references ?? [])
    .slice()
    .sort((a, b) => (a.index ?? 0) - (b.index ?? 0))
    .map((ref, i) => {
      const citDomain = extractDomain(ref.link);
      const isClient =
        !!validClientDomain && (citDomain === validClientDomain || citDomain.endsWith(`.${validClientDomain}`) || validClientDomain.endsWith(`.${citDomain}`));
      return {
        position: i + 1,
        sourceName: ref.source ?? citDomain,
        title: ref.title ?? null,
        domain: citDomain,
        url: ref.link,
        isClient,
        platform: detectPlatform(citDomain, cleanDomain),
      };
    });

  // Same rule as fetchAIO above: brand tokens contribute to mentionedInText
  // only, NOT to isClient. isClient is a strict host comparison.
  const brandTokens = buildBrandTokens({ brand, domain });
  const mentionedInText = aioFullText ? matchesBrand(aioFullText, brandTokens) : false;

  const citedDomains = citations.map((c) => c.domain);
  const clientCited = citations.some((c) => c.isClient);

  return {
    keyword, domain, brand, location,
    aioPresent, aioSnippet, aioFullText, aioBlocks,
    citations, citedDomains, clientCited, mentionedInText,
  };
}
