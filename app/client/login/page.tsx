'use client'

import { useState } from 'react'

export default function ClientLoginPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return

    setLoading(true)
    setError('')

    const res = await fetch('/api/client/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim() }),
    })

    if (res.ok) {
      setSent(true)
    } else {
      setError('Something went wrong. Please try again.')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <p className="font-heading text-sm font-semibold tracking-wider text-gold mb-6">
            THE GATEKEEPERS CLUB
          </p>
          <h1 className="font-heading text-2xl font-semibold text-green mb-2">
            Your portal
          </h1>
          <p className="text-sm text-gray-500 font-body">
            Enter your email to receive a secure access link
          </p>
        </div>

        {sent ? (
          <div className="bg-white rounded-[8px] border border-gray-200 p-6 text-center">
            <p className="text-green font-heading font-semibold mb-2">Check your inbox</p>
            <p className="text-sm text-gray-500 font-body">
              If your email is registered with us, you will receive an access link shortly.
              The link is valid for 24 hours.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white rounded-[8px] border border-gray-200 p-6 space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full rounded-[4px] border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-green focus:outline-none focus:ring-1 focus:ring-green"
              />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button
              type="submit"
              disabled={loading || !email.trim()}
              className="w-full bg-green text-white rounded-[4px] px-4 py-2.5 text-sm font-medium font-body hover:bg-green-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Sending...' : 'Send access link'}
            </button>
          </form>
        )}

        <p className="text-center text-xs text-gray-400 mt-6 font-body">
          thegatekeepers.club
        </p>
      </div>
    </div>
  )
}
