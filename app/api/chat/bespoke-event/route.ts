import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getBespokeEventPrompt } from "@/lib/chat-prompts/bespoke-event";
import { checkChatRateLimit } from "@/lib/rate-limit";

const anthropic = new Anthropic();

export async function POST(request: Request) {
  try {
    const ip = (request.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || "127.0.0.1";
    if (!checkChatRateLimit(ip)) {
      return NextResponse.json({ error: "Too many requests. Please try again shortly." }, { status: 429 });
    }

    const body = await request.json();
    const { messages, clientName } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Messages required" }, { status: 400 });
    }

    if (messages.length > 20) {
      return NextResponse.json({ error: "Conversation limit reached." }, { status: 400 });
    }

    const totalLength = messages.reduce((sum: number, m: { role: string; content: string }) => sum + (m.content?.length ?? 0), 0);
    if (totalLength > 8000) {
      return NextResponse.json({ error: "Message too long." }, { status: 400 });
    }

    const systemPrompt = getBespokeEventPrompt(clientName);

    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      system: systemPrompt,
      messages: messages.map((m: { role: string; content: string }) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    });

    const assistantMessage =
      response.content[0].type === "text" ? response.content[0].text : "";

    return NextResponse.json({ message: assistantMessage });
  } catch (error) {
    console.error("Bespoke event chat error:", error);
    return NextResponse.json({ error: "Chat failed" }, { status: 500 });
  }
}
