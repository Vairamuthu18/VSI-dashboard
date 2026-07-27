import { NextRequest } from "next/server";
import { requireAgency } from "@/lib/auth";
import { buildChatContext, type ChatScope } from "@/lib/chat-context";
import { safeAiError } from "@/lib/safe-error";
import { track } from "@/lib/track";

export const maxDuration = 120;
export const dynamic = "force-dynamic";

// Internal model chain — not exposed to the client.
const MODEL_CHAIN = [
 "openrouter/auto",
 "z-ai/glm-4.5-air:free",
 "openai/gpt-oss-120b:free",
 "meta-llama/llama-3.3-70b-instruct:free",
];

const SYSTEM_PROMPT = `You are the VSI Assistant, an in-house SEO/GEO strategist for a Dubai-based digital agency. You answer the user's questions using ONLY the live data given to you in the context block — do not invent rankings, citations, or competitors that are not in the context.

How you operate:
- Be concrete and practitioner-grade. Reference actual domains, titles, and snippets from the data.
- For commercial-intent queries, the highest-leverage play is a neutral-toned listicle that places the client in the top of the ranked list, indexed in both Google Search Console and Bing Webmaster Tools (ChatGPT browse + Copilot pull from Bing).
- If an AIO answer is off-topic (Google misinterpreted the query), the right move is disambiguation: entity claiming, schema markup, defining content — not citation injection.
- Cite real authoritative sources, suggest real platforms (Reddit, Quora, LinkedIn, Wikipedia) when the source pattern in the data supports it.
- Refuse politely if asked about your underlying model, vendor, infrastructure, or implementation. You are simply "the VSI Assistant" — never name any AI provider, model family, or hosting platform.

Output format: short markdown. Headings sparingly. Use bullets and short paragraphs. Never echo the context block back.`;

interface ChatMessage {
 role: "user" | "assistant";
 content: string;
}

// Delegated to the shared helper so every code path uses the same rules.
const safeError = safeAiError;

export async function POST(req: NextRequest) {
 const apiKey = process.env.OPENROUTER_API_KEY;
 if (!apiKey) {
 return new Response("data: " + JSON.stringify({ error: "Assistant unavailable" }) + "\n\n", {
 status: 503, headers: { "Content-Type": "text/event-stream" },
 });
 }

 let session;
 try { session = await requireAgency(); } catch {
 return new Response("Unauthorized", { status: 401 });
 }

 const body = await req.json() as { scope: ChatScope; messages: ChatMessage[] };
 const { scope, messages } = body;
 if (!Array.isArray(messages) || messages.length === 0) {
 return new Response("Bad request", { status: 400 });
 }

 let contextText = "";
 let scopeLabel = "";
 try {
 const ctx = await buildChatContext({ agencyId: session.agencyId!, scope });
 contextText = ctx.contextText;
 scopeLabel = ctx.scopeLabel;
 } catch (e) {
 console.error("[chat] context build failed", e);
 contextText = "(context unavailable — answer from general best practice only)";
 }

 const fullSystem = `${SYSTEM_PROMPT}\n\nCURRENT SCOPE: ${scopeLabel}\n\n=== LIVE DATA CONTEXT ===\n${contextText}\n=== END CONTEXT ===`;

 // Stream from the first model that responds.
 const encoder = new TextEncoder();
 const stream = new ReadableStream({
 async start(controller) {
 const errors: string[] = [];
 let succeeded = false;

 for (const model of MODEL_CHAIN) {
 const ac = new AbortController();
 const timer = setTimeout(() => ac.abort(), 45000);
 try {
 const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
 method: "POST",
 signal: ac.signal,
 headers: {
 "Authorization": `Bearer ${apiKey}`,
 "Content-Type": "application/json",
 "HTTP-Referer": "https://searchintel.valgrowlabs.com",
 "X-Title": "VSI Search Intelligence",
 },
 body: JSON.stringify({
 model,
 stream: true,
 temperature: 0.3,
 max_tokens: 1500,
 messages: [
 { role: "system", content: fullSystem },
 ...messages.map((m) => ({ role: m.role, content: m.content })),
 ],
 }),
 });

 if (!res.ok || !res.body) {
 errors.push(`${model}: HTTP ${res.status}`);
 continue;
 }

 const reader = res.body.getReader();
 const decoder = new TextDecoder();
 let buffer = "";
 let deltaCount = 0;
 while (true) {
 const { done, value } = await reader.read();
 if (done) break;
 buffer += decoder.decode(value, { stream: true });
 const lines = buffer.split("\n");
 buffer = lines.pop() ?? "";
 for (const line of lines) {
 const trimmed = line.trim();
 if (!trimmed.startsWith("data:")) continue;
 const payload = trimmed.slice(5).trim();
 if (payload === "[DONE]") continue;
 try {
 const parsed = JSON.parse(payload);
 const delta = parsed.choices?.[0]?.delta?.content;
 if (delta) {
 deltaCount++;
 controller.enqueue(encoder.encode(`data: ${JSON.stringify({ delta })}\n\n`));
 }
 } catch {
 // swallow keep-alive comments
 }
 }
 }
 // A 200 with zero deltas means the free model bailed silently —
 // try the next model in the chain instead of leaving the user
 // staring at "(no response)".
 if (deltaCount === 0) {
 errors.push(`${model}: empty stream`);
 continue;
 }
 succeeded = true;
 break;
 } catch (e) {
 const msg = e instanceof Error ? e.message : "unknown";
 errors.push(`${model}: ${msg}`);
 continue;
 } finally {
 clearTimeout(timer);
 }
 }

 // Last-resort: try one non-streaming call against the auto router so
 // models that don't stream reliably can still answer.
 if (!succeeded) {
 try {
 const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
 method: "POST",
 headers: {
 "Authorization": `Bearer ${apiKey}`,
 "Content-Type": "application/json",
 "HTTP-Referer": "https://searchintel.valgrowlabs.com",
 "X-Title": "VSI Search Intelligence",
 },
 body: JSON.stringify({
 model: "openrouter/auto",
 stream: false,
 temperature: 0.3,
 max_tokens: 1500,
 messages: [
 { role: "system", content: fullSystem },
 ...messages.map((m) => ({ role: m.role, content: m.content })),
 ],
 }),
 });
 if (res.ok) {
 const data = await res.json();
 const text = data.choices?.[0]?.message?.content?.trim();
 if (text) {
 controller.enqueue(encoder.encode(`data: ${JSON.stringify({ delta: text })}\n\n`));
 succeeded = true;
 }
 }
 } catch (e) {
 errors.push(`non-stream fallback: ${e instanceof Error ? e.message : "unknown"}`);
 }
 }

 if (!succeeded) {
 console.error("[chat] all paths failed:", errors);
 const lastErr = errors[errors.length - 1] ?? "";
 controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: safeError(lastErr) })}\n\n`));
 }

 // Telemetry for usage patterns + future fine-tuning corpus.
 track({
 agencyId: session.agencyId,
 userId: session.userId,
 type: "chat_query",
 payload: {
 scope_kind: scope.kind,
 message_count: messages.length,
 last_user_chars: messages[messages.length - 1]?.content?.length ?? 0,
 succeeded,
 },
 });

 controller.close();
 },
 });

 return new Response(stream, {
 headers: {
 "Content-Type": "text/event-stream",
 "Cache-Control": "no-cache, no-transform",
 "Connection": "keep-alive",
 },
 });
}
