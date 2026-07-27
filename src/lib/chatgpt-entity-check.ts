// ChatGPT entity-match check.
//
// The brand-token detector says "the literal brand name appears in the
// response" — but plenty of brand names collide. E.g. asking ChatGPT
// about "Valgrow Labs" can return a long answer about a biotech startup
// in San Diego with the same name, not the Dubai digital agency we're
// tracking. Counting that as "mentioned" over-credits visibility.
//
// This helper runs a cheap LLM check: given the client's brand + domain
// and the ChatGPT response, decide whether the response is actually
// about the tracked entity. If not, capture a short label for the
// actual entity so the UI can warn the operator.

const MODEL_OPENROUTER = "openrouter/auto";

export interface EntityMatchResult {
  aboutClient: boolean;
  actualEntity: string;
  confidence: "low" | "medium" | "high";
}

export async function checkChatGPTEntityMatch(opts: {
  clientBrand: string;
  clientDomain: string;
  keyword: string;
  response: string;
}): Promise<EntityMatchResult | null> {
  const openaiKey = process.env.OPENAI_API_KEY;
  const openrouterKey = process.env.OPENROUTER_API_KEY;
  if (!openaiKey && !openrouterKey) return null;

  // Use the same cheap settings the rest of the pipeline uses so we
  // don't blow the OpenAI credit cap on disambiguation calls.
  const { getSetting } = await import("@/lib/settings");
  const configuredModel = await getSetting<string>("openai_chatgpt_model");
  const openaiModel = configuredModel || "gpt-4o-mini";

  const prompt = `You will be given a brand name + website plus the text of an AI assistant's answer. Decide whether the answer is actually about THIS specific brand, or about a different organisation that happens to share the name.

Tracked brand: "${opts.clientBrand}"
Tracked website: ${opts.clientDomain}
User's query to the AI: "${opts.keyword}"

AI response text:
"""
${opts.response.slice(0, 2200)}
"""

Heuristics:
- If the response mentions the tracked website / a clearly-matching industry / a city or product line that fits the tracked brand → MATCH.
- If the response describes a different industry, a different city / country, or a different product line from the tracked brand → MISMATCH (return a short label for the entity the AI is actually describing).
- When in doubt and the response is too generic to confirm either way, lean MATCH with low confidence.

Return ONLY this JSON: { "aboutClient": true | false, "actualEntity": "<short noun phrase, e.g. 'biotech startup in San Diego' or 'agritech company'>", "confidence": "low" | "medium" | "high" }`;

  const endpoint = openaiKey
    ? "https://api.openai.com/v1/chat/completions"
    : "https://openrouter.ai/api/v1/chat/completions";
  const headers: Record<string, string> = openaiKey
    ? { "Authorization": `Bearer ${openaiKey}`, "Content-Type": "application/json" }
    : {
        "Authorization": `Bearer ${openrouterKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://searchintel.valgrowlabs.com",
        "X-Title": "VSI Search Intelligence",
      };
  const model = openaiKey ? openaiModel : MODEL_OPENROUTER;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20000);
  try {
    const res = await fetch(endpoint, {
      method: "POST",
      signal: controller.signal,
      headers,
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: "Respond with only valid JSON, no commentary." },
          { role: "user", content: prompt },
        ],
        temperature: 0.0,
        max_tokens: 150,
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const content = data.choices?.[0]?.message?.content?.trim();
    if (!content) return null;
    const match = content.match(/\{[\s\S]*\}/);
    if (!match) return null;
    const parsed = JSON.parse(match[0]) as { aboutClient?: boolean; actualEntity?: string; confidence?: string };
    const conf = parsed.confidence === "high" || parsed.confidence === "medium" || parsed.confidence === "low"
      ? parsed.confidence
      : "medium";
    return {
      aboutClient: parsed.aboutClient !== false,
      actualEntity: parsed.actualEntity ?? "unknown entity",
      confidence: conf,
    };
  } catch (e) {
    console.error("[chatgpt-entity-check] failed", e);
    return null;
  } finally {
    clearTimeout(timer);
  }
}
