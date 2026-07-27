import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { notificationId, title, message, details, apiKey } = await request.json();

    const keyToUse = apiKey || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

    if (!keyToUse) {
      return NextResponse.json(
        { error: "API key is required" },
        { status: 400 }
      );
    }

    const prompt = `You are an AI assistant resolving system notifications for a web application. 
Given the following notification, provide a brief summary of how it has been resolved, or recommended next steps. Keep it under 2 sentences.

Title: ${title}
Message: ${message}
Details: ${details || "None"}`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${keyToUse}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Gemini API Error:", errorData);
      return NextResponse.json(
        { error: "Failed to resolve notification with Gemini" },
        { status: 500 }
      );
    }

    const data = await response.json();
    const resolutionText = data.candidates?.[0]?.content?.parts?.[0]?.text || "Notification successfully processed and resolved.";

    return NextResponse.json({ 
      success: true, 
      resolution: resolutionText
    });
  } catch (error: any) {
    console.error("Error in resolve API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
