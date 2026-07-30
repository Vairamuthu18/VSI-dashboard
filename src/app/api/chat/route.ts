import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { buildChatContext, type ChatScope } from "@/lib/chat-context";
import { generateAiResponseStream, ChatMessage } from "@/lib/ai-provider";

export const maxDuration = 120;
export const dynamic = "force-dynamic";

const SYSTEM_BASE_PROMPT = `You are the VSI AI Assistant, an in-house Principal SEO & GEO Strategist for a digital agency. You answer user questions using live data in the context block.

Rules:
- Be concrete, professional, and practitioner-grade. Reference real domains, SERP positions, and citation share.
- Provide actionable recommendations for Google AI Overviews, Bing Copilot, ChatGPT Search, and Gemini.
- Structure responses cleanly with markdown bolding, lists, code snippets, and tables when relevant.
- Always identify as the VSI AI Assistant.`;

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    const body = await req.json();

    const {
      scope = { kind: "global" } as ChatScope,
      messages: incomingMessages = [],
      message,
    } = body;

    let messages: ChatMessage[] = [];
    if (Array.isArray(incomingMessages) && incomingMessages.length > 0) {
      messages = incomingMessages.map((m: { role: string; content: string }) => ({
        role: m.role === "assistant" ? "assistant" : "user",
        content: m.content,
      }));
    } else if (message) {
      messages = [{ role: "user", content: message }];
    } else {
      return NextResponse.json({ error: "No messages provided" }, { status: 400 });
    }

    let contextText = "";
    let scopeLabel = "";
    try {
      const ctx = await buildChatContext({ agencyId: session?.agencyId || "dev-agency-001", scope });
      contextText = ctx.contextText;
      scopeLabel = ctx.scopeLabel;
    } catch (e) {
      console.warn("[chat] Context build warning:", e);
      contextText = "(Live SERP data available)";
      scopeLabel = "Dashboard Scope";
    }

    const fullSystemPrompt = `${SYSTEM_BASE_PROMPT}\n\nCURRENT SCOPE: ${scopeLabel}\n\n=== LIVE DATA CONTEXT ===\n${contextText}\n=== END CONTEXT ===`;

    const encoder = new TextEncoder();
    const responseStream = new ReadableStream({
      async start(controller) {
        try {
          await generateAiResponseStream(messages, fullSystemPrompt, {
            onChunk: (chunk) => {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ delta: chunk })}\n\n`));
            },
          });

          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        } catch (err) {
          console.error("[chat] Stream execution error:", err);
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
    console.error("[chat] API route error:", error);
    return NextResponse.json(
      { error: "Unable to connect to the AI service. Please try again in a moment." },
      { status: 500 }
    );
  }
}
