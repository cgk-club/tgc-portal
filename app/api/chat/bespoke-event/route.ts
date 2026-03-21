import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getBespokeEventPrompt } from "@/lib/chat-prompts/bespoke-event";

const anthropic = new Anthropic();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { messages, clientName } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Messages required" }, { status: 400 });
    }

    const systemPrompt = getBespokeEventPrompt(clientName);

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
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
