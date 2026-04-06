"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ClientChatModule from "@/components/client/ClientChatModule";
import ClientNav from "@/components/client/ClientNav";

export default function ConversationPage() {
  const router = useRouter();
  const [clientName, setClientName] = useState<string>("");
  const [clientEmail, setClientEmail] = useState<string>("");
  const [clientId, setClientId] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/client/session");
      if (!res.ok) { router.push("/client/login"); return; }
      const { client } = await res.json();
      setClientName(client.name || "");
      setClientEmail(client.email || "");
      setClientId(client.id || "");
      setLoading(false);
    }
    load();
  }, [router]);

  async function handleComplete(data: Record<string, unknown>) {
    await fetch("/api/client/requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, client_id: clientId }),
    });
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-pearl"><p className="text-gray-400 font-body">Loading...</p></div>;

  const firstName = clientName.split(" ")[0];

  return (
    <div className="min-h-screen bg-pearl">
      <ClientNav active="conversation" />
      <div className="max-w-2xl mx-auto px-4 py-10 sm:py-14">
        <div className="text-center mb-8">
          <h1 className="font-heading text-2xl font-semibold text-green mb-2">
            Start a Conversation
          </h1>
          <p className="text-sm text-gray-500 font-body">
            Tell us what you are thinking about and we will take care of the rest.
          </p>
        </div>

        <ClientChatModule
          endpoint="/api/chat/client-conversation"
          clientName={firstName}
          extraBody={{ clientEmail }}
          initialMessage={`Hi${firstName ? ` ${firstName}` : ""}. What can I help you with today? Whether it is travel, dining, sourcing something special, or anything else, I am here to listen.`}
          completionLabel="Request Received"
          completionMessage="Your brief has been passed to our team. We will be in touch shortly via your preferred contact method."
          onComplete={handleComplete}
        />
      </div>
    </div>
  );
}
