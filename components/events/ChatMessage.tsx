"use client";

import { useTypingEffect } from "@/lib/useTypingEffect";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  typing?: boolean;
  onTypingComplete?: () => void;
}

export default function ChatMessage({
  role,
  content,
  typing = false,
  onTypingComplete,
}: ChatMessageProps) {
  const isAssistant = role === "assistant";
  const displayedText = useTypingEffect(
    content,
    typing && isAssistant,
    onTypingComplete
  );

  const text = typing && isAssistant ? displayedText : content;

  return (
    <div
      className={`flex ${isAssistant ? "justify-start" : "justify-end"} mb-4`}
    >
      <div
        className={`max-w-[85%] px-4 py-3 rounded-lg text-sm leading-relaxed ${
          isAssistant
            ? "bg-white border-l-2 border-green text-gray-800"
            : "bg-green text-white"
        }`}
      >
        <div className="whitespace-pre-wrap">
          {text}
          {typing && isAssistant && (
            <span className="inline-block w-0.5 h-4 bg-gray-400 ml-0.5 animate-pulse align-text-bottom" />
          )}
        </div>
      </div>
    </div>
  );
}
