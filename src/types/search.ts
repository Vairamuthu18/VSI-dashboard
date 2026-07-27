export type Location = "ae" | "us" | "uk" | "in" | "lk";
export type ServiceType = "seo" | "geo" | "seo_geo";
export type TrackType = "seo" | "geo" | "both";

export const SERVICE_TYPE_LABELS: Record<ServiceType, { label: string; short: string; color: string; description: string }> = {
  seo: {
    label: "SEO Only",
    short: "SEO",
    color: "bg-blue-900 text-blue-300",
    description: "Google rank tracking only",
  },
  geo: {
    label: "GEO Only",
    short: "GEO",
    color: "bg-purple-900 text-purple-300",
    description: "AI Mode citations & mentions only",
  },
  seo_geo: {
    label: "SEO + GEO",
    short: "SEO+GEO",
    color: "bg-amber-900 text-amber-300",
    description: "Full Rank-to-Citation Gap™ intelligence",
  },
};

export const TRACK_TYPE_CONFIG: Record<TrackType, { label: string; color: string; runsSERP: boolean; runsAIO: boolean }> = {
  seo:  { label: "SEO",  color: "bg-blue-900 text-blue-300",   runsSERP: true,  runsAIO: false },
  geo:  { label: "GEO",  color: "bg-purple-900 text-purple-300", runsSERP: false, runsAIO: true  },
  both: { label: "Both", color: "bg-amber-900 text-amber-300",  runsSERP: true,  runsAIO: true  },
};

export const INDUSTRIES = [
  "SEO / Digital Marketing",
  "E-commerce",
  "Real Estate",
  "Healthcare",
  "Legal",
  "Finance",
  "Education",
  "Hospitality & Travel",
  "Technology / SaaS",
  "Construction & Engineering",
  "Automotive",
  "Retail",
  "Other",
] as const;

export const COUNTRIES = [
  "United Arab Emirates",
  "Saudi Arabia",
  "Kuwait",
  "Qatar",
  "Bahrain",
  "Oman",
  "United States",
  "United Kingdom",
  "India",
  "Other",
] as const;

export const LOCATIONS: Record<Location, { label: string; gl: string; location: string; hl: string }> = {
  ae: {
    label: "UAE",
    gl: "ae",
    location: "Dubai, United Arab Emirates",
    hl: "en",
  },
  us: {
    label: "United States",
    gl: "us",
    location: "United States",
    hl: "en",
  },
  uk: {
    label: "United Kingdom",
    gl: "uk",
    location: "United Kingdom",
    hl: "en",
  },
  in: {
    label: "India",
    gl: "in",
    location: "India",
    hl: "en",
  },
  lk: {
    label: "Sri Lanka",
    gl: "lk",
    location: "Sri Lanka",
    hl: "en",
  },
};

// ─── Platform detection ───────────────────────────────────────
export type PlatformType =
  | "linkedin"
  | "reddit"
  | "quora"
  | "youtube"
  | "twitter"
  | "facebook"
  | "instagram"
  | "trustpilot"
  | "clutch"
  | "g2"
  | "tripadvisor"
  | "yelp"
  | "glassdoor"
  | "medium"
  | "wikipedia"
  | "news"
  | "brand"      // the client's own domain
  | "other";

const PLATFORM_PATTERNS: Array<{ platform: PlatformType; patterns: string[] }> = [
  { platform: "linkedin",    patterns: ["linkedin.com"] },
  { platform: "reddit",      patterns: ["reddit.com"] },
  { platform: "quora",       patterns: ["quora.com"] },
  { platform: "youtube",     patterns: ["youtube.com", "youtu.be"] },
  { platform: "twitter",     patterns: ["twitter.com", "x.com"] },
  { platform: "facebook",    patterns: ["facebook.com", "fb.com"] },
  { platform: "instagram",   patterns: ["instagram.com"] },
  { platform: "trustpilot",  patterns: ["trustpilot.com"] },
  { platform: "clutch",      patterns: ["clutch.co"] },
  { platform: "g2",          patterns: ["g2.com"] },
  { platform: "tripadvisor", patterns: ["tripadvisor.com"] },
  { platform: "yelp",        patterns: ["yelp.com"] },
  { platform: "glassdoor",   patterns: ["glassdoor.com"] },
  { platform: "medium",      patterns: ["medium.com"] },
  { platform: "wikipedia",   patterns: ["wikipedia.org"] },
];

export const PLATFORM_LABELS: Record<PlatformType, { label: string; color: string; icon: string }> = {
  linkedin:    { label: "LinkedIn",    color: "bg-blue-900 text-blue-300",    icon: "in" },
  reddit:      { label: "Reddit",      color: "bg-orange-900 text-orange-300", icon: "r/" },
  quora:       { label: "Quora",       color: "bg-red-900 text-red-300",      icon: "Q" },
  youtube:     { label: "YouTube",     color: "bg-red-900 text-red-300",      icon: "▶" },
  twitter:     { label: "X / Twitter", color: "bg-gray-800 text-gray-300",    icon: "𝕏" },
  facebook:    { label: "Facebook",    color: "bg-blue-900 text-blue-300",    icon: "f" },
  instagram:   { label: "Instagram",   color: "bg-pink-900 text-pink-300",    icon: "ig" },
  trustpilot:  { label: "Trustpilot",  color: "bg-green-900 text-green-300",  icon: "★" },
  clutch:      { label: "Clutch",      color: "bg-red-900 text-red-300",      icon: "C" },
  g2:          { label: "G2",          color: "bg-orange-900 text-orange-300", icon: "G2" },
  tripadvisor: { label: "TripAdvisor", color: "bg-green-900 text-green-300",  icon: "TA" },
  yelp:        { label: "Yelp",        color: "bg-red-900 text-red-300",      icon: "Y" },
  glassdoor:   { label: "Glassdoor",   color: "bg-green-900 text-green-300",  icon: "GD" },
  medium:      { label: "Medium",      color: "bg-gray-800 text-gray-300",    icon: "M" },
  wikipedia:   { label: "Wikipedia",   color: "bg-gray-800 text-gray-300",    icon: "W" },
  news:        { label: "News",        color: "bg-gray-800 text-gray-300",    icon: "📰" },
  brand:       { label: "Brand",       color: "bg-amber-900 text-amber-300",  icon: "★" },
  other:       { label: "Other",       color: "bg-gray-800 text-gray-500",    icon: "•" },
};

export function detectPlatform(domain: string, clientDomain?: string): PlatformType {
  const d = domain.toLowerCase();
  if (clientDomain && (d.includes(clientDomain) || clientDomain.includes(d))) return "brand";
  for (const { platform, patterns } of PLATFORM_PATTERNS) {
    if (patterns.some((p) => d.includes(p))) return platform;
  }
  return "other";
}

export interface OrganicResult {
  position: number;
  title: string;
  url: string;
  domain: string;
  snippet: string | null;
  isClient: boolean;
  platform: PlatformType;
}

export interface SerpResult {
  keyword: string;
  domain: string;
  location: Location;
  position: number | null;
  rankingUrl: string | null;
  rankingTitle: string | null;
  serpFeatures: string[];
  organicResults: OrganicResult[];  // top 10 SERP results
}

export interface AIOCitation {
  position: number;       // 1-indexed order in the AIO references list
  sourceName: string;     // SerpAPI "source" field — brand/display name (e.g. "United SEO")
  title: string | null;   // page title
  domain: string;
  url: string;
  isClient: boolean;      // true if this is the tracked domain
  platform: PlatformType; // detected platform type
}

export interface AIOTextBlock {
  type: "paragraph" | "list" | string;
  snippet?: string;
  list?: Array<{ snippet: string }>;
}

export interface AIOResult {
  keyword: string;
  domain: string;
  brand: string;
  location: Location;
  aioPresent: boolean;
  aioSnippet: string | null;       // short truncated preview
  aioFullText: string | null;      // full text for LLM + display
  aioBlocks: AIOTextBlock[];       // structured blocks for UI rendering
  citations: AIOCitation[];        // rich source data for display
  citedDomains: string[];          // domain-only list for DB storage
  clientCited: boolean;            // domain appears as a source link
  mentionedInText: boolean;        // brand name appears in AIO text
}

export type GapLabel =
  | "aligned"               // rank ≤ 10 AND cited AND brand named in AIO text (true winning)
  | "aligned_no_mention"    // rank ≤ 10 AND cited but brand NOT named in AIO text
  | "ai_mentioned"          // rank ≤ 10 AND brand in AIO text (not a source)
  | "search_strong_ai_invisible" // rank ≤ 10 AND zero AIO presence
  | "geo_cited"             // unranked AND cited AND brand named in AIO text
  | "geo_cited_no_mention"  // unranked AND cited but brand NOT named in AIO text
  | "geo_mentioned"         // unranked AND brand in AIO text (not a source)
  | "geo_invisible"         // unranked AND AIO present but no cite / mention
  | "seo_ranked"            // ranked, no AIO tracking
  | "seo_ranked_no_aio"     // ranked, AIO not triggered
  | "seo_not_ranked"        // not ranked, no AIO tracking
  | "weak_double_loss";     // not ranking AND not in AIO

export type StatusColor = "green" | "yellow" | "red" | "blue" | "gray" | "amber" | "orange";

export interface GapClassification {
  label: GapLabel;
  dot: StatusColor;
  title: string;
  description: string;
}

export const GAP_CLASSIFICATIONS: Record<GapLabel, GapClassification> = {
  aligned: {
    label: "aligned",
    dot: "green",
    title: "Aligned",
    description: "Ranking, cited as a source, AND named in the AI Mode answer — winning on both channels",
  },
  aligned_no_mention: {
    label: "aligned_no_mention",
    dot: "blue",
    title: "Ranking & Cited — Brand Unnamed",
    description: "Ranking and cited as a source, but the brand isn't named in the AI Mode answer text",
  },
  ai_mentioned: {
    label: "ai_mentioned",
    dot: "blue",
    title: "AI-Mentioned / Not Sourced",
    description: "Ranking AND brand mentioned in AI Mode text — visible but not getting the source citation",
  },
  search_strong_ai_invisible: {
    label: "search_strong_ai_invisible",
    dot: "yellow",
    title: "Search-Strong / AI-Invisible",
    description: "Ranking top 10 but completely absent from AI Mode — at risk of silent click loss",
  },
  geo_cited: {
    label: "geo_cited",
    dot: "green",
    title: "GEO Cited",
    description: "Cited as a source AND named in the AI Mode answer — strong AI authority for this query",
  },
  geo_cited_no_mention: {
    label: "geo_cited_no_mention",
    dot: "blue",
    title: "GEO Cited — Brand Unnamed",
    description: "Page is linked as a source but the brand isn't named in the answer text — partial AI visibility",
  },
  geo_mentioned: {
    label: "geo_mentioned",
    dot: "blue",
    title: "GEO Mentioned",
    description: "Brand named in the AI Mode answer but no source citation — recognition without traffic",
  },
  geo_invisible: {
    label: "geo_invisible",
    dot: "yellow",
    title: "GEO Invisible",
    description: "AI Mode is present for this query but the brand is neither cited nor named",
  },
  seo_ranked: {
    label: "seo_ranked",
    dot: "green",
    title: "Ranking",
    description: "Solid Google ranking. No AI tracking enabled — consider GEO to check AI visibility",
  },
  seo_ranked_no_aio: {
    label: "seo_ranked_no_aio",
    dot: "green",
    title: "Ranking — No AI Mode",
    description: "Ranking in top 10 and Google isn't serving an AI answer for this query",
  },
  seo_not_ranked: {
    label: "seo_not_ranked",
    dot: "red",
    title: "Not Ranking",
    description: "Outside the top 10 in Google. No AI Mode signal captured for this run",
  },
  weak_double_loss: {
    label: "weak_double_loss",
    dot: "red",
    title: "Weak / Double Loss",
    description: "Not ranking AND not in AI Mode — invisible on both channels",
  },
};

export function classifyGap(serp: SerpResult, aio: AIOResult): GapClassification {
  const ranked = serp.position !== null && serp.position <= 10;
  const cited = !!aio.clientCited;
  const mentioned = !!aio.mentionedInText;

  if (ranked && cited && mentioned) return GAP_CLASSIFICATIONS.aligned;
  if (ranked && cited)              return GAP_CLASSIFICATIONS.aligned_no_mention;
  if (ranked && mentioned)          return GAP_CLASSIFICATIONS.ai_mentioned;
  if (ranked)                       return GAP_CLASSIFICATIONS.search_strong_ai_invisible;
  return GAP_CLASSIFICATIONS.weak_double_loss;
}

export interface SearchSnapshot {
  keyword: string;
  domain: string;
  brand: string;
  location: Location;
  serp: SerpResult;
  aio: AIOResult;
}
