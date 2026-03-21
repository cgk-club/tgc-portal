"use client";

import { useState } from "react";
import ChatModule from "./ChatModule";

interface EventEnquiryChatProps {
  eventName?: string;
  enquiryType?: string;
}

export default function EventEnquiryChat({ eventName, enquiryType }: EventEnquiryChatProps) {
  const [submitted, setSubmitted] = useState(false);

  const greeting = eventName
    ? enquiryType === "logistics"
      ? `Hi. I understand you are attending ${eventName} and may need support with logistics, accommodation, or dining around the event. Let me help you put a programme together. What do you need most?`
      : `Hi. I see you are interested in ${eventName}. I am here to help you plan the full experience. To start, could you tell me what kind of access or involvement you are looking for?`
    : `Hi. Welcome to The Gatekeepers Club events desk. I am here to help you plan an event experience from start to finish. Which event are you looking at?`;

  async function handleComplete(data: Record<string, unknown>) {
    try {
      await fetch("/api/events/enquiry-submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      setSubmitted(true);
    } catch (err) {
      console.error("Submit error:", err);
    }
  }

  if (submitted) {
    return null;
  }

  return (
    <ChatModule
      endpoint="/api/chat/events-enquiry"
      initialMessage={greeting}
      eventName={eventName}
      onComplete={handleComplete}
    />
  );
}
