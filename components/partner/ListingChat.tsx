"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useTypingEffect } from "@/lib/useTypingEffect";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface ListingChatProps {
  category: string;
  categoryLabel: string;
  partnerName: string;
  onComplete: (data: Record<string, unknown>, rawInput: string) => void;
  onCancel: () => void;
}

export default function ListingChat({
  category,
  categoryLabel,
  partnerName,
  onComplete,
  onCancel,
}: ListingChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [parsedData, setParsedData] = useState<Record<string, unknown> | null>(null);
  const [rawInput, setRawInput] = useState("");
  const [typingText, setTypingText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleTypingDone = useCallback(() => {
    setIsTyping(false);
    inputRef.current?.focus();
  }, []);

  const displayedTyping = useTypingEffect(typingText, isTyping, handleTypingDone);

  useEffect(() => {
    // Start the conversation
    async function init() {
      setSending(true);
      try {
        const res = await fetch("/api/partner/chat/seller", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [{ role: "user", content: `I'd like to list something in the ${categoryLabel} category. My name is ${partnerName}.` }],
            category,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          setMessages([
            { role: "user", content: `I'd like to list something in the ${categoryLabel} category.` },
            { role: "assistant", content: data.message },
          ]);
          setRawInput(`I'd like to list something in the ${categoryLabel} category.\n`);
          setSending(false);
          setTypingText(data.message);
          setIsTyping(true);
          return;
        }
      } catch (err) {
        console.error("Chat init error:", err);
      }
      setSending(false);
    }
    init();
  }, [category, categoryLabel, partnerName]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!sending) {
      inputRef.current?.focus();
    }
  }, [sending]);

  function checkForCompletion(text: string) {
    const marker = "[INTAKE_COMPLETE]";
    const idx = text.indexOf(marker);
    if (idx === -1) return null;

    const jsonStr = text.slice(idx + marker.length).trim();
    try {
      const parsed = JSON.parse(jsonStr);
      return parsed;
    } catch {
      // Try to extract JSON from the text
      const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          return JSON.parse(jsonMatch[0]);
        } catch {
          return null;
        }
      }
      return null;
    }
  }

  async function handleSend() {
    const text = input.trim();
    if (!text || sending) return;

    const newMessages: ChatMessage[] = [...messages, { role: "user", content: text }];
    setMessages(newMessages);
    setInput("");
    setRawInput((prev) => prev + text + "\n");
    setSending(true);

    try {
      const res = await fetch("/api/partner/chat/seller", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
          category,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const assistantMsg = data.message;

        setMessages([...newMessages, { role: "assistant", content: assistantMsg }]);

        const parsed = checkForCompletion(assistantMsg);
        if (parsed) {
          setParsedData(parsed);
        } else {
          setTypingText(assistantMsg);
          setIsTyping(true);
        }
      }
    } catch (err) {
      console.error("Chat error:", err);
    }

    setSending(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function getDisplayContent(content: string, idx: number): string {
    const marker = "[INTAKE_COMPLETE]";
    const markerIdx = content.indexOf(marker);
    const cleaned = markerIdx === -1 ? content : content.slice(0, markerIdx).trim();

    // Show typing text for the last assistant message while typing
    if (isTyping && idx === messages.length - 1 && messages[idx]?.role === "assistant") {
      return displayedTyping;
    }
    return cleaned;
  }

  const busy = sending || isTyping;

  if (parsedData) {
    return (
      <div className="bg-white border border-green/10 rounded-lg p-5 space-y-4">
        <h3 className="font-heading text-sm font-semibold text-green">
          Listing Preview
        </h3>
        <p className="text-xs text-gray-500 font-body">
          Please review the details collected from your conversation. If everything looks good, submit to create a draft listing.
        </p>

        <div className="bg-pearl rounded-md p-4 space-y-2">
          {Object.entries(parsedData).map(([key, value]) => {
            if (value === null || value === undefined || value === "") return null;
            const label = key
              .replace(/_/g, " ")
              .replace(/\b\w/g, (c) => c.toUpperCase());
            return (
              <div key={key} className="flex gap-3 text-xs font-body">
                <span className="text-gray-400 min-w-[120px] flex-none">{label}</span>
                <span className="text-gray-700">
                  {typeof value === "boolean"
                    ? value
                      ? "Yes"
                      : "No"
                    : String(value)}
                </span>
              </div>
            );
          })}
        </div>

        <div className="flex gap-3 pt-2">
          <button
            onClick={() => onComplete(parsedData, rawInput)}
            className="px-5 py-2 bg-green text-white text-sm font-medium rounded-md hover:bg-green-light transition-colors font-body"
          >
            Submit Listing
          </button>
          <button
            onClick={() => setParsedData(null)}
            className="px-5 py-2 border border-green/20 text-green text-sm font-medium rounded-md hover:bg-green/5 transition-colors font-body"
          >
            Continue Chatting
          </button>
          <button
            onClick={onCancel}
            className="px-5 py-2 text-gray-400 text-sm font-body hover:text-gray-600 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-green/10 rounded-lg overflow-hidden">
      {/* Chat header */}
      <div className="border-b border-green/10 px-5 py-3 flex items-center justify-between">
        <div>
          <h3 className="font-heading text-sm font-semibold text-green">
            Listing Intake: {categoryLabel}
          </h3>
          <p className="text-[10px] text-gray-400 font-body mt-0.5">
            Our assistant will guide you through providing all the details needed for your listing.
          </p>
        </div>
        <button
          onClick={onCancel}
          className="text-xs text-gray-400 hover:text-gray-600 font-body"
        >
          Cancel
        </button>
      </div>

      {/* Messages */}
      <div className="h-[400px] overflow-y-auto px-5 py-4 space-y-4 bg-pearl/50">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-lg px-4 py-3 text-sm font-body whitespace-pre-wrap ${
                msg.role === "user"
                  ? "bg-green text-white"
                  : "bg-white border border-green/10 text-gray-700"
              }`}
            >
              {getDisplayContent(msg.content, i)}
              {isTyping && i === messages.length - 1 && msg.role === "assistant" && (
                <span className="inline-block w-0.5 h-4 bg-gray-400 ml-0.5 animate-pulse align-text-bottom" />
              )}
            </div>
          </div>
        ))}
        {sending && (
          <div className="flex justify-start">
            <div className="bg-white border border-green/10 rounded-lg px-4 py-3">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-green/30 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 bg-green/30 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 bg-green/30 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-green/10 p-4 bg-white">
        <div className="flex gap-3">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={busy}
            placeholder="Type your reply..."
            rows={2}
            className="flex-1 rounded-md border border-green/20 px-3 py-2 text-sm text-gray-800 focus:border-green focus:outline-none focus:ring-1 focus:ring-green/30 font-body resize-none disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={busy || !input.trim()}
            className="px-4 py-2 bg-green text-white text-sm font-medium rounded-md hover:bg-green-light transition-colors font-body disabled:opacity-50 self-end"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
