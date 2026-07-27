// Sanitize any error string before it leaves the server so we never leak
// the underlying AI vendor, model identifier, or HTTP layer details to the
// client. Inside the codebase we still log the raw error to console for
// diagnostics — only user-facing strings get sanitized.

const VENDOR_WORDS = [
  // Hosting/routing
  "openrouter", "open router",
  // Model families
  "openai", "anthropic", "claude", "gpt", "gpt-oss",
  "meta", "llama", "mistral", "mixtral",
  "google", "gemini", "gemma", "palm",
  "z-ai", "zai", "glm", "groq",
  "perplexity", "deepseek",
  // Misc IDs
  "auto", "instruct",
];

const VENDOR_RE = new RegExp(`\\b(${VENDOR_WORDS.join("|")})[\\w./:-]*`, "gi");

const FRIENDLY_402 = "The free-tier AI budget for the day has been used up. Try again later, or top up credits.";
const FRIENDLY_429 = "The AI assistant is rate-limited right now. Try again in a minute.";
const FRIENDLY_5XX = "The AI assistant is busy. Try again in a minute.";

export function safeAiError(raw: string | null | undefined): string {
  if (!raw) return "The AI assistant couldn't finish that request. Please try again.";
  const lower = raw.toLowerCase();

  // Recognise common HTTP problems by code or wording.
  if (lower.includes("402") || lower.includes("payment required") || lower.includes("insufficient credit")) {
    return FRIENDLY_402;
  }
  if (lower.includes("429") || lower.includes("rate limit") || lower.includes("rate-limit")) {
    return FRIENDLY_429;
  }
  if (/\b50\d\b/.test(raw) || lower.includes("timed out") || lower.includes("timeout")) {
    return FRIENDLY_5XX;
  }

  // Generic strip: remove vendor/model names so a stray error message can't
  // expose the stack even if we missed it above.
  let out = raw.replace(VENDOR_RE, "the assistant");
  out = out.replace(/HTTP \d{3}/gi, "").replace(/\bmodel(?:s)?\b/gi, "").trim();
  if (!out || out.length < 6) return "The AI assistant couldn't finish that request. Please try again.";
  return out;
}
