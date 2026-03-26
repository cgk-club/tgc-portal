'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import ClientNav from '@/components/client/ClientNav'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export default function ClientMarketplaceRequestPage() {
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [clientInfo, setClientInfo] = useState<{ name: string; email: string } | null>(null)
  const chatEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function load() {
      const res = await fetch('/api/client/session')
      if (!res.ok) { router.push('/client/login'); return }
      const { client } = await res.json()
      setClientInfo({ name: client.name || '', email: client.email || '' })
      setLoading(false)

      // Start the conversation
      const chatRes = await fetch('/api/client/marketplace/request-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [] }),
      })
      if (chatRes.ok) {
        const { reply } = await chatRes.json()
        setMessages([{ role: 'assistant', content: reply }])
      }
    }
    load()
  }, [router])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function handleSend() {
    if (!input.trim() || sending) return
    const userMsg = input.trim()
    setInput('')
    const newMessages = [...messages, { role: 'user' as const, content: userMsg }]
    setMessages(newMessages)
    setSending(true)

    const res = await fetch('/api/client/marketplace/request-chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: newMessages }),
    })

    if (res.ok) {
      const { reply, complete, requestData } = await res.json()
      setMessages([...newMessages, { role: 'assistant', content: reply }])

      if (complete && requestData && clientInfo) {
        // Submit the request
        await fetch('/api/client/marketplace/request-submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...requestData,
            name: clientInfo.name,
            email: clientInfo.email,
          }),
        })
        setSubmitted(true)
      }
    }

    setSending(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-pearl">
        <p className="text-gray-400 font-body">Loading...</p>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-pearl">
        <ClientNav active="marketplace" />
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <div className="bg-white border border-green/10 rounded-lg p-10">
            <h2 className="font-heading text-xl font-semibold text-green mb-3">Request submitted</h2>
            <p className="text-sm text-gray-500 font-body mb-6">
              We have received your request and will begin sourcing from our network. We will be in touch with options.
            </p>
            <button onClick={() => router.push('/client/marketplace')} className="px-5 py-2 text-sm text-white bg-green rounded-md hover:bg-green-light font-body">
              Back to Marketplace
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-pearl">
      <ClientNav active="marketplace" />
      <div className="max-w-3xl mx-auto px-4 py-10 sm:py-14">
        <button onClick={() => router.push('/client/marketplace')} className="text-sm text-gray-500 hover:text-green font-body mb-6 block">
          {'\u2190'} Back to Marketplace
        </button>

        <h1 className="font-heading text-xl font-semibold text-green mb-2">Looking for something?</h1>
        <p className="text-sm text-gray-500 font-body mb-8">
          Tell us what you are looking for. We will source it from our network of trusted sellers and makers.
        </p>

        <div className="bg-white border border-green/10 rounded-lg p-5">
          {/* Messages */}
          <div className="space-y-4 mb-4 max-h-[60vh] overflow-y-auto">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-lg px-4 py-2.5 text-sm font-body ${
                  msg.role === 'user'
                    ? 'bg-green text-white'
                    : 'bg-gray-50 border border-green/10 text-gray-700'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {sending && (
              <div className="flex justify-start">
                <div className="bg-gray-50 border border-green/10 rounded-lg px-4 py-2.5">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-green/30 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-green/30 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-green/30 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Tell us what you are looking for..."
              disabled={sending}
              className="flex-1 rounded-md border border-green/20 px-3 py-2 text-sm text-gray-800 focus:border-green focus:outline-none focus:ring-1 focus:ring-green/30 font-body disabled:opacity-50"
            />
            <button
              onClick={handleSend}
              disabled={sending || !input.trim()}
              className="px-4 py-2 bg-green text-white text-sm rounded-md hover:bg-green-light transition-colors font-body disabled:opacity-50"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
