import type { SerpResult, OrganicResult, Location } from "@/types/search";
import { LOCATIONS, detectPlatform } from "@/types/search";

interface SerperOrganicResult {
  position: number;
  title: string;
  link: string;
  snippet?: string;
}

interface SerperResponse {
  organic?: SerperOrganicResult[];
  knowledgeGraph?: object;
  answerBox?: object;
  peopleAlsoAsk?: object[];
  topStories?: object[];
  images?: object[];
  videos?: object[];
}

function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

function detectSerpFeatures(raw: SerperResponse): string[] {
  const features: string[] = [];
  if (raw.knowledgeGraph) features.push("knowledge_graph");
  if (raw.answerBox) features.push("answer_box");
  if (raw.peopleAlsoAsk?.length) features.push("people_also_ask");
  if (raw.topStories?.length) features.push("top_stories");
  if (raw.images?.length) features.push("images");
  if (raw.videos?.length) features.push("videos");
  return features;
}

export interface DomainRank {
  domain: string;
  position: number | null;
  url: string | null;
  title: string | null;
}

export async function fetchBulkRanks(
  keyword: string,
  domains: string[],
  location: Location
): Promise<DomainRank[]> {
  const key = process.env.SERPER_API_KEY;
  if (!key) throw new Error("Search service unavailable");

  const loc = LOCATIONS[location];

  const res = await fetch("https://google.serper.dev/search", {
    method: "POST",
    headers: { "X-API-KEY": key, "Content-Type": "application/json" },
    body: JSON.stringify({
      q: keyword,
      gl: loc.gl,
      hl: loc.hl,
      location: loc.location,
      num: 100,
    }),
  });

  if (!res.ok) throw new Error("Search service unavailable");

  const raw: SerperResponse = await res.json();
  const organic = raw.organic ?? [];

  return domains.map((domain) => {
    const clean = domain.replace(/^https?:\/\//, "").replace(/^www\./, "").split("/")[0];
    const match = organic.find(
      (r) => extractDomain(r.link).includes(clean) || clean.includes(extractDomain(r.link))
    );
    return {
      domain,
      position: match?.position ?? null,
      url: match?.link ?? null,
      title: match?.title ?? null,
    };
  });
}

export async function fetchRank(
  keyword: string,
  domain: string,
  location: Location,
  brand: string = ""
): Promise<SerpResult> {
  const key = process.env.SERPER_API_KEY;
  if (!key) throw new Error("Search service unavailable");

  const loc = LOCATIONS[location];

  const res = await fetch("https://google.serper.dev/search", {
    method: "POST",
    headers: {
      "X-API-KEY": key,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      q: keyword,
      gl: loc.gl,
      hl: loc.hl,
      location: loc.location,
      num: 100,
    }),
  });

  if (!res.ok) throw new Error("Search service unavailable");

  const raw: SerperResponse = await res.json();
  const cleanDomain = (domain ?? "")
    .toLowerCase()
    .replace(/^[a-z]+:\/+/, "")
    .replace(/^www\./, "")
    .split(/[\/?#]/)[0]
    .replace(/:\d+$/, "");
  // Only treat as a real client domain when it has at least one dot.
  // Otherwise substring matching false-positives every result.
  const validClientDomain = cleanDomain.includes(".") && /[a-z]/.test(cleanDomain) ? cleanDomain : "";

  const matchesClient = (d: string) =>
    !!validClientDomain && (d === validClientDomain || d.endsWith(`.${validClientDomain}`) || validClientDomain.endsWith(`.${d}`));

  const match = raw.organic?.find((r) => matchesClient(extractDomain(r.link)));

  // isClient is a STRICT host match against the tracked domain. We used
  // to also OR in a brand-token fuzzy match (any page whose title /
  // snippet mentions the brand was flagged as client) but that produced
  // far more false positives than true ones — e.g. an article reviewing
  // alternatives that mentions the client in passing would be tagged as
  // the client's own page. Brand-token matching still drives
  // `mentionedInText` (brand named in the AIO answer) which is the
  // right place for fuzzy text scanning.
  const organicResults: OrganicResult[] = (raw.organic ?? [])
    .slice(0, 10)
    .map((r) => {
      const rDomain = extractDomain(r.link);
      const isClient = matchesClient(rDomain);
      return {
        position: r.position,
        title: r.title,
        url: r.link,
        domain: rDomain,
        snippet: r.snippet ?? null,
        isClient,
        platform: detectPlatform(rDomain, cleanDomain),
      };
    });

  return {
    keyword,
    domain,
    location,
    position: match?.position ?? null,
    rankingUrl: match?.link ?? null,
    rankingTitle: match?.title ?? null,
    serpFeatures: detectSerpFeatures(raw),
    organicResults,
  };
}
