'use client'

import { useState, useRef, useEffect } from 'react'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface EnquiryChatProps {
  propertyName: string
  isOpen: boolean
  onClose: () => void
}

const PROXY_URL = process.env.NEXT_PUBLIC_INTAKE_PROXY_URL || 'https://tgc-intake-proxy-production.up.railway.app'
const TOKEN = process.env.NEXT_PUBLIC_INTAKE_TOKEN || ''

export default function EnquiryChat({ propertyName, isOpen, onClose }: EnquiryChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [complete, setComplete] = useState(false)
  const [started, setStarted] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen && !started) {
      startConversation()
      setStarted(true)
    }
  }, [isOpen])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (isOpen && !loading && !complete) {
      inputRef.current?.focus()
    }
  }, [isOpen, loading, messages])

  async function startConversation() {
    setLoading(true)
    try {
      const res = await fetch(`${PROXY_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-tgc-token': TOKEN,
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: '[START]' }],
          context: { property: propertyName },
        }),
      })
      const data = await res.json()
      if (data.text) {
        setMessages([{ role: 'assistant', content: data.text }])
      }
    } catch (err) {
      console.error('Chat start failed:', err)
    }
    setLoading(false)
  }

  async function sendMessage() {
    if (!input.trim() || loading || complete) return

    const userMsg: Message = { role: 'user', content: input.trim() }
    const updatedMessages = [...messages, userMsg]
    setMessages(updatedMessages)
    setInput('')
    setLoading(true)

    try {
      const res = await fetch(`${PROXY_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-tgc-token': TOKEN,
        },
        body: JSON.stringify({
          messages: updatedMessages.map(m => ({ role: m.role, content: m.content })),
          context: { property: propertyName },
        }),
      })
      const data = await res.json()
      if (data.text) {
        setMessages([...updatedMessages, { role: 'assistant', content: data.text }])
      }
      if (data.complete || data.enquiryData) {
        setComplete(true)
      }
    } catch (err) {
      console.error('Chat error:', err)
    }
    setLoading(false)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end md:items-center justify-center p-0 md:p-4">
      <div className="bg-white w-full md:max-w-lg md:rounded-[12px] h-full md:h-[80vh] md:max-h-[600px] flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-green px-6 py-4 flex items-center justify-between shrink-0">
          <div>
            <p className="text-gold text-xs font-medium tracking-wider uppercase">The Gatekeepers Club</p>
            <p className="text-white text-sm mt-0.5 opacity-80">{propertyName}</p>
          </div>
          <button
            onClick={() => { onClose(); setStarted(false); setMessages([]); setComplete(false) }}
            className="text-white/60 hover:text-white text-xl leading-none"
          >
            &times;
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 bg-gray-50">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[80%] rounded-[8px] px-4 py-2.5 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-green text-white'
                    : 'bg-white border border-gray-200 text-gray-800'
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-white border border-gray-200 rounded-[8px] px-4 py-2.5 text-sm text-gray-400">
                <span className="animate-pulse">...</span>
              </div>
            </div>
          )}
          {complete && (
            <div className="bg-gold/10 border border-gold/30 rounded-[8px] p-4 text-center">
              <p className="text-sm font-medium text-green">Thank you for your enquiry.</p>
              <p className="text-xs text-gray-500 mt-1">
                We will be in touch shortly via your preferred contact method.
              </p>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        {!complete && (
          <div className="border-t border-gray-200 px-4 py-3 bg-white shrink-0">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Type your message..."
                disabled={loading}
                className="flex-1 rounded-[4px] border border-gray-300 px-3 py-2 text-sm focus:border-green focus:outline-none focus:ring-1 focus:ring-green disabled:opacity-50"
              />
              <button
                onClick={sendMessage}
                disabled={loading || !input.trim()}
                className="rounded-[4px] bg-green text-white px-4 py-2 text-sm font-medium hover:bg-green/90 transition-colors disabled:opacity-50"
              >
                Send
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
