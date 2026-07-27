// Unified brand-match logic used by both Serper (SERP) and SerpAPI (AIO) parsers.
// Returns true if the brand or any meaningful variation appears in the given text.

export interface BrandIdentifiers {
  brand: string;        // e.g. "ValGrow Labs"
  domain: string;       // e.g. "valgrowdigital.com"
}

/**
 * Build all reasonable brand tokens to search for:
 *   - The full brand string ("valgrow labs")
 *   - Each individual word of the brand >= 4 chars ("valgrow", "labs")
 *   - The domain stem ("valgrowdigital")
 *   - The first word of the domain stem when camel/separated ("valgrow")
 */
// Generic strings that must never become a brand token. If they slip through
// (e.g. the user stored "https://" as their website, or the brand is just a
// service term like "SEO"), they end up matching every citation URL or title
// and flagging every result as the client.
const TOKEN_BLOCKLIST = new Set([
  "labs", "group", "agency", "digital", "media", "inc", "ltd", "co", "company",
  "http", "https", "www", "com", "net", "org", "site", "page", "url", "blog",
  "seo", "geo", "ppc", "sem", "marketing", "services", "service", "online",
]);

const PROTOCOL_RE = /^[a-z]+:\/+/;

export function buildBrandTokens({ brand, domain }: BrandIdentifiers): string[] {
  const tokens = new Set<string>();
  const add = (s: string) => {
    const t = s.trim().toLowerCase();
    if (t.length < 4) return;
    if (TOKEN_BLOCKLIST.has(t)) return;
    tokens.add(t);
  };

  // Full brand + each word
  if (brand?.trim()) {
    add(brand);
    brand
      .toLowerCase()
      .split(/[\s\-_/&,.]+/)
      .filter((w) => w.length >= 4 && !TOKEN_BLOCKLIST.has(w))
      .forEach(add);
  }

  // Domain stem (e.g. "valgrowdigital" from "valgrowdigital.com") — only
  // accept if the input looks like a real hostname (must contain a "." and
  // not be a bare protocol fragment). A malformed website like "https://"
  // or "example" should contribute no tokens.
  const lowered = (domain ?? "").toLowerCase().replace(PROTOCOL_RE, "").replace(/^www\./, "");
  const host = lowered.split(/[\/?#]/)[0].replace(/:\d+$/, "");
  if (host.includes(".") && /[a-z]/.test(host)) {
    const stem = host.split(".")[0];
    if (stem) add(stem);

    const stemParts = stem
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      .replace(/(\D)(\d)/g, "$1 $2")
      .toLowerCase()
      .split(/\s+/)
      .filter((w) => w.length >= 4);
    stemParts.forEach(add);
  }

  return Array.from(tokens);
}

/**
 * Returns true if any brand token appears in the given text (case-insensitive,
 * word-boundary-aware where possible).
 */
export function matchesBrand(text: string, tokens: string[]): boolean {
  if (!text || tokens.length === 0) return false;
  const lower = text.toLowerCase();
  const compressed = lower.replace(/\s+/g, "");

  for (const token of tokens) {
    // Direct substring (handles "valgrow labs" as a phrase)
    if (lower.includes(token)) return true;
    // Compressed (handles "ValGrow Labs" → "valgrowlabs" → matches "valgrowlabs")
    if (compressed.includes(token)) return true;
  }
  return false;
}

/**
 * Quick boolean: does this domain or text mention the brand?
 */
export function detectBrand(text: string, ids: BrandIdentifiers): boolean {
  return matchesBrand(text, buildBrandTokens(ids));
}
