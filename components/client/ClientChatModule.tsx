"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import ChatMessage from "@/components/events/ChatMessage";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ClientChatModuleProps {
  endpoint: string;
  initialMessage: string;
  clientName?: string;
  extraBody?: Record<string, unknown>;
  completionLabel?: string;
  completionMessage?: string;
  onComplete?: (data: Record<string, unknown>) => void;
}

export default function ClientChatModule({
  endpoint,
  initialMessage,
  clientName,
  extraBody,
  completionLabel = "Request Received",
  completionMessage = "We will review your request and be in touch shortly.",
  onComplete,
}: ClientChatModuleProps) {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: initialMessage },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const pendingCompleteRef = useRef<Record<string, unknown> | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleTypingComplete = useCallback(() => {
    setIsTyping(false);
    if (pendingCompleteRef.current) {
      setIsComplete(true);
      onComplete?.(pendingCompleteRef.current);
      pendingCompleteRef.current = null;
    }
    inputRef.current?.focus();
  }, [onComplete]);

  async function handleSend() {
    if (!input.trim() || isLoading || isTyping || isComplete) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const allMessages = [
        ...messages.slice(1),
        { role: "user", content: userMessage },
      ];

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: allMessages, clientName, ...extraBody }),
      });

      if (!res.ok) throw new Error("Chat failed");

      const data = await res.json();
      const assistantMessage = data.message;

      const displayMessage = assistantMessage
        .replace(/\[REQUEST_COMPLETE\][\s\S]*$/, "")
        .trim();

      setIsLoading(false);
      setIsTyping(true);

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: displayMessage || assistantMessage },
      ]);

      if (assistantMessage.includes("[REQUEST_COMPLETE]")) {
        const jsonMatch = assistantMessage.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            pendingCompleteRef.current = JSON.parse(jsonMatch[0]);
          } catch {
            pendingCompleteRef.current = {};
          }
        }
      }
    } catch {
      setIsLoading(false);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "I apologise, something went wrong. Could you try that again?",
        },
      ]);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  const lastAssistantIdx = messages.length - 1;
  const busy = isLoading || isTyping;

  return (
    <div className="border border-green/15 rounded-lg overflow-hidden bg-pearl">
      <div className="h-[480px] overflow-y-auto p-4 sm:p-6">
        {messages.map((msg, i) => (
          <ChatMessage
            key={i}
            role={msg.role}
            content={msg.content}
            typing={isTyping && i === lastAssistantIdx && msg.role === "assistant"}
            onTypingComplete={
              isTyping && i === lastAssistantIdx && msg.role === "assistant"
                ? handleTypingComplete
                : undefined
            }
          />
        ))}
        {isLoading && (
          <div className="flex justify-start mb-4">
            <div className="bg-white border-l-2 border-green px-4 py-3 rounded-lg">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-green/40 rounded-full animate-bounce" />
                <span className="w-2 h-2 bg-green/40 rounded-full animate-bounce [animation-delay:150ms]" />
                <span className="w-2 h-2 bg-green/40 rounded-full animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {!isComplete ? (
        <div className="border-t border-green/10 p-4 bg-white">
          <div className="flex gap-3">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              rows={1}
              className="flex-1 px-3 py-2 rounded-md border border-green/20 bg-white text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green/30 focus:border-green resize-none font-body"
              disabled={busy}
            />
            <button
              onClick={handleSend}
              disabled={busy || !input.trim()}
              className="px-4 py-2 bg-green text-white text-sm font-medium rounded-md hover:bg-green-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-body"
            >
              Send
            </button>
          </div>
        </div>
      ) : (
        <div className="border-t border-green/10 p-6 bg-green/5 text-center">
          <p className="font-heading text-lg font-semibold text-green">
            {completionLabel}
          </p>
          <p className="mt-2 text-sm text-gray-500 font-body">
            {completionMessage}
          </p>
        </div>
      )}
    </div>
  );
}
