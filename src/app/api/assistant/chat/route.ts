import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { buildChatContext, type ChatScope } from "@/lib/chat-context";
import { generateAiResponseStream, ChatMessage } from "@/lib/ai-provider";

export const maxDuration = 120;
export const dynamic = "force-dynamic";

const SYSTEM_BASE_PROMPT = `You are the VSI AI Assistant, a world-class Principal SEO/GEO Strategist, AI Search Architect, and Enterprise Analytics Assistant. You assist users with practitioner-grade insights on:
- SEO (Search Engine Optimization) & GEO (Generative Engine Optimization)
- AI Mentions, AI Overviews (AIO), & Citation Share (Google AI Overviews, Bing Copilot, ChatGPT Search, Gemini)
- Keyword Performance & Opportunity Analysis
- Competitor Rankings & Citation Disambiguation
- Marketing Strategies, Technical SEO, & Dashboard Metrics

Instructions:
1. Ground your answers in the provided live context data. Give concrete numbers, rankings, and actionable steps.
2. Structure output cleanly using markdown headings, bold text, bullet points, tables, or code snippets when appropriate.
3. Be professional, direct, encouraging, and authoritative.
4. Refuse politely if asked about underlying server infrastructure or secrets. Always identify as "VSI AI Assistant".`;

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();

    let body: any = {};
    try {
      body = await req.json();
    } catch {
      body = {};
    }

    const {
      message,
      conversationId = `conv_${Date.now()}`,
      userId = session?.userId || "user_default",
      workspaceId = session?.agencyId || "ws_default",
      scope = { kind: "global" } as ChatScope,
      messages: incomingMessages,
      stream: requestStream = true,
    } = body;

    // Construct message history
    let messages: ChatMessage[] = [];
    if (Array.isArray(incomingMessages) && incomingMessages.length > 0) {
      messages = incomingMessages.map((m: { role: string; content: string }) => ({
        role: m.role === "assistant" ? "assistant" : "user",
        content: m.content || "",
      }));
    } else if (message) {
      messages = [{ role: "user", content: String(message) }];
    } else {
      return NextResponse.json({ success: false, error: "Message is required" }, { status: 400 });
    }

    // Build live dataset context from database
    let contextText = "";
    let scopeLabel = "";
    try {
      const ctx = await buildChatContext({ agencyId: session?.agencyId || "dev-agency-001", scope });
      contextText = ctx.contextText;
      scopeLabel = ctx.scopeLabel;
    } catch (e) {
      console.warn("[assistant/chat] Context build warning:", e);
      contextText = "(Live SERP & AI Citation context active)";
      scopeLabel = "Dashboard Scope";
    }

    const fullSystemPrompt = `${SYSTEM_BASE_PROMPT}\n\n=== CURRENT DASHBOARD SCOPE: ${scopeLabel} ===\n${contextText}\n=== END CONTEXT ===`;

    // Handle non-streaming JSON request if requested
    if (requestStream === false || req.headers.get("accept") === "application/json") {
      let fullReply = "";
      let modelUsed = "gemini-2.5-flash";

      const resInfo = await generateAiResponseStream(messages, fullSystemPrompt, {
        onChunk: (chunk) => {
          fullReply += chunk;
        },
      });

      modelUsed = resInfo.modelUsed;

      return NextResponse.json({
        success: true,
        reply: fullReply,
        conversationId,
        userId,
        workspaceId,
        tokens: Math.ceil((fullReply.length + (message ? String(message).length : 0)) / 4),
        model: modelUsed,
        createdAt: new Date().toISOString(),
      });
    }

    // SSE Streaming Response
    const encoder = new TextEncoder();
    const responseStream = new ReadableStream({
      async start(controller) {
        try {
          const resInfo = await generateAiResponseStream(messages, fullSystemPrompt, {
            onChunk: (chunk) => {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ delta: chunk })}\n\n`));
            },
          });

          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                done: true,
                conversationId,
                model: resInfo.modelUsed,
                provider: resInfo.providerUsed,
              })}\n\n`
            )
          );
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        } catch (err) {
          console.error("[assistant/chat] Streaming error:", err);
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                error: "Unable to connect to the AI service. Please try again in a moment.",
              })}\n\n`
            )
          );
        } finally {
          controller.close();
        }
      },
    });

    return new Response(responseStream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        "Connection": "keep-alive",
      },
    });
  } catch (error) {
    console.error("[assistant/chat] Endpoint error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Unable to connect to the AI service. Please try again in a moment.",
      },
      { status: 500 }
    );
  }
}
