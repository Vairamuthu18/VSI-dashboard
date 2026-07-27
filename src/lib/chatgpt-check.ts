import { buildBrandTokens, matchesBrand } from "@/lib/brand-match";
import { checkChatGPTEntityMatch } from "@/lib/chatgpt-entity-check";

export interface ChatGPTCheckResult {
  checked: boolean;
  response: string | null;
  brand_cited: boolean | null;
  brand_mentioned: boolean | null;
  mention_count: number | null;
  competitors: string[];
  cited_urls: string[];
  // Entity disambiguation — when brand_mentioned is true, a follow-up LLM
  // call decides whether the response is actually about the tracked
  // brand (vs a different organisation with the same name). Null when
  // the check wasn't run (brand not mentioned, or LLM unavailable).
  entity_match: boolean | null;
  entity_actual: string | null;
  skipped_reason?: string;
}

interface OpenAIMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface OpenAIResponse {
  choices?: Array<{
    message?: {
      content?: string;
      annotations?: Array<{
        type?: string;
        url_citation?: { url?: string; title?: string };
      }>;
    };
  }>;
  error?: { message?: string };
}

const KNOWN_AGENCY_BRANDS = [
  // Common GCC/Dubai SEO/marketing agency names ChatGPT name-drops a lot.
  // Used to detect competitors mentioned alongside (or instead of) the client.
  "NEXA", "Digital Nexa", "Prism Digital", "Aarmax", "McCollins Media",
  "Salesbox", "Namastetu", "Tenet", "Mamba", "Global Media Insight",
  "Ambitious PR", "Vlad", "WSI", "DigitalGravity", "Igloo Inc",
];

function findCompetitorMentions(text: string, clientBrand: string): string[] {
  const lower = text.toLowerCase();
  const clientLower = clientBrand.toLowerCase();
  const found = new Set<string>();
  for (const brand of KNOWN_AGENCY_BRANDS) {
    const b = brand.toLowerCase();
    if (b === clientLower) continue;
    if (lower.includes(b)) found.add(brand);
  }
  return Array.from(found);
}

function countMentions(text: string, brand: string): number {
  if (!brand) return 0;
  const tokens = buildBrandTokens({ brand, domain: "" });
  if (tokens.length === 0) return 0;
  // Use the strictest token (the brand itself) for a count
  const target = tokens[0].toLowerCase();
  if (!target) return 0;
  const re = new RegExp(target.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
  const matches = text.match(re);
  return matches ? matches.length : 0;
}

function extractCitedUrls(annotations: Array<{ type?: string; url_citation?: { url?: string } }> | undefined): string[] {
  if (!annotations) return [];
  const urls = new Set<string>();
  for (const a of annotations) {
    const u = a?.url_citation?.url;
    if (u && /^https?:\/\//.test(u)) urls.add(u);
  }
  return Array.from(urls);
}

function skipped(reason: string): ChatGPTCheckResult {
  return {
    checked: false,
    response: null,
    brand_cited: null,
    brand_mentioned: null,
    mention_count: null,
    competitors: [],
    cited_urls: [],
    entity_match: null,
    entity_actual: null,
    skipped_reason: reason,
  };
}

export async function runChatGPTCheck(opts: {
  keyword: string;
  clientBrand: string;
  clientDomain: string;
}): Promise<ChatGPTCheckResult> {
  const openaiKey     = process.env.OPENAI_API_KEY;
  const openrouterKey = process.env.OPENROUTER_API_KEY;

  // Decide which provider to use. Prefer real OpenAI (has web search +
  // grounded citations); fall back to OpenRouter's hosted open-weight
  // gpt-oss model so we still get the LLM visibility signal during the
  // pilot before the OpenAI key is funded.
  let endpoint: string;
  let headers: Record<string, string>;
  let model: string;
  let usingOpenRouter = false;

  if (openaiKey) {
    endpoint = "https://api.openai.com/v1/chat/completions";
    headers = {
      "Authorization": `Bearer ${openaiKey}`,
      "Content-Type": "application/json",
    };
    // Model is super-admin-configurable so we can balance cost vs grounding.
    // Default = plain gpt-4o-mini (no per-search fee). Flip to
    // gpt-4o-mini-search-preview from /admin/settings when an agency
    // is paying for the search tier.
    const { getSetting } = await import("@/lib/settings");
    const searchEnabled = await getSetting<boolean>("openai_search_enabled");
    const configuredModel = await getSetting<string>("openai_chatgpt_model");
    model = searchEnabled ? "gpt-4o-mini-search-preview" : (configuredModel || "gpt-4o-mini");
  } else if (openrouterKey) {
    endpoint = "https://openrouter.ai/api/v1/chat/completions";
    headers = {
      "Authorization": `Bearer ${openrouterKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://searchintel.valgrowlabs.com",
      "X-Title": "VSI Search Intelligence",
    };
    model = "openai/gpt-oss-120b:free";
    usingOpenRouter = true;
  } else {
    return skipped("No LLM API key configured (OPENAI_API_KEY or OPENROUTER_API_KEY)");
  }

  const today = new Date();
  const todayLabel = today.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  const currentYear = today.getFullYear();

  const messages: OpenAIMessage[] = [
    {
      role: "system",
      content:
        `Today's date is ${todayLabel}. The current year is ${currentYear}. Any year you mention in your answer MUST be ${currentYear} or later — never an earlier year. ` +
        "You are a helpful research assistant. When asked a question, answer concisely " +
        "based on what you know. Reference real businesses, products, or sources where " +
        "appropriate. Keep the answer under 400 words.",
    },
    { role: "user", content: opts.keyword },
  ];

  // Per-call timeout so a hanging free model doesn't stall the pipeline
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 40000);

  let data: OpenAIResponse;
  try {
    const res = await fetch(endpoint, {
      method: "POST",
      signal: controller.signal,
      headers,
      body: JSON.stringify({
        model,
        messages,
        max_tokens: 800,
        temperature: 0.3,
      }),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return skipped(`HTTP ${res.status} ${text.slice(0, 200)}`);
    }
    data = (await res.json()) as OpenAIResponse;
    if (data.error) {
      return skipped(data.error.message ?? "LLM API error");
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Network error";
    return skipped(msg.includes("abort") ? "Timed out after 40s" : msg);
  } finally {
    clearTimeout(timer);
  }

  const message = data.choices?.[0]?.message;
  const response = message?.content?.trim() ?? null;
  // Annotations (URL citations) are only emitted by OpenAI's web-search-
  // enabled models — open-weight models on OpenRouter won't include them.
  const citedUrls = usingOpenRouter ? [] : extractCitedUrls(message?.annotations);

  if (!response) {
    return skipped("Empty response from LLM");
  }

  const brandTokens = buildBrandTokens({ brand: opts.clientBrand, domain: opts.clientDomain });
  const mentionedInText = matchesBrand(response, brandTokens);
  const mentionCount = countMentions(response, opts.clientBrand);

  const cleanDomain = opts.clientDomain
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .split("/")[0]
    .toLowerCase();

  const brandCited = cleanDomain
    ? citedUrls.some((u) => {
        try {
          const host = new URL(u).hostname.replace(/^www\./, "").toLowerCase();
          return host === cleanDomain || host.endsWith(`.${cleanDomain}`);
        } catch {
          return false;
        }
      })
    : false;

  const competitors = findCompetitorMentions(response, opts.clientBrand);

  // Entity disambiguation. Only worth the extra LLM call when the brand
  // name actually appeared — if it didn't, there's nothing to disambiguate.
  // A direct domain citation also confirms identity, so skip the check
  // when brand_cited is true.
  let entityMatch: boolean | null = null;
  let entityActual: string | null = null;
  if (mentionedInText && !brandCited) {
    try {
      const verdict = await checkChatGPTEntityMatch({
        clientBrand: opts.clientBrand,
        clientDomain: opts.clientDomain,
        keyword: opts.keyword,
        response,
      });
      if (verdict) {
        entityMatch = verdict.aboutClient;
        entityActual = verdict.aboutClient ? null : verdict.actualEntity;
      }
    } catch (e) {
      console.error("[chatgpt-check] entity disambiguation failed", e);
    }
  } else if (brandCited) {
    // Domain citation is a definitive identity signal.
    entityMatch = true;
  }

  return {
    checked: true,
    response,
    brand_cited: brandCited,
    brand_mentioned: mentionedInText,
    mention_count: mentionCount,
    competitors,
    cited_urls: citedUrls,
    entity_match: entityMatch,
    entity_actual: entityActual,
  };
}
