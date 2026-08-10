'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

function ClientLoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Magic link is the default. Most client accounts have no password, and a
  // client who has never set one used to land in password mode, get
  // "Invalid email or password" and stop. Password mode is opt in via ?mode=password.
  const [email, setEmail] = useState(searchParams.get('email') ?? '')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState<'password' | 'magic'>(
    searchParams.get('mode') === 'password' ? 'password' : 'magic'
  )
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(
    searchParams.get('error') === 'invalid'
      ? 'That access link has expired or has already been used. Enter your email below and we will send you a new one.'
      : ''
  )

  async function handlePasswordLogin(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim() || !password) return

    setLoading(true)
    setError('')

    const res = await fetch('/api/client/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim(), password }),
    })

    if (res.ok) {
      router.push('/client')
    } else {
      setError('Invalid email or password. If you have not set a password, use the access link instead.')
    }
    setLoading(false)
  }

  async function handleMagicLink(e: React.FormEvent) {
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
    <div className="min-h-screen flex items-center justify-center px-4 bg-pearl">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <p className="font-heading text-sm font-semibold tracking-wider text-gold mb-6">
            THE GATEKEEPERS CLUB
          </p>
          <h1 className="font-heading text-2xl font-semibold text-green mb-2">
            Your portal
          </h1>
          <p className="text-sm text-gray-500 font-body">
            {mode === 'password'
              ? 'Sign in to your account'
              : 'Enter your email and we will send you an access link'}
          </p>
        </div>

        {sent ? (
          <div className="bg-white rounded-lg border border-green/10 p-6 text-center">
            <p className="text-green font-heading font-semibold mb-2">Check your inbox</p>
            <p className="text-sm text-gray-500 font-body">
              If your email is registered with us, you will receive an access link shortly.
              The link is valid for 24 hours.
            </p>
          </div>
        ) : mode === 'magic' ? (
          <form onSubmit={handleMagicLink} className="bg-white rounded-lg border border-green/10 p-6 space-y-4">
            <div>
              <label htmlFor="email-magic" className="block text-xs text-gray-500 font-body mb-1">
                Email
              </label>
              <input
                id="email-magic"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                autoFocus
                className="w-full rounded-md border border-green/20 px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus:border-green focus:outline-none focus:ring-1 focus:ring-green/30 font-body"
              />
            </div>
            {error && <p className="text-sm text-red-500 font-body">{error}</p>}
            <button
              type="submit"
              disabled={loading || !email.trim()}
              className="w-full bg-green text-white rounded-md px-4 py-2.5 text-sm font-medium font-body hover:bg-green-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Sending...' : 'Send access link'}
            </button>
            <p className="text-center text-xs text-gray-400 font-body">
              No password needed.
            </p>
            <button
              type="button"
              onClick={() => { setMode('password'); setError(''); }}
              className="w-full text-xs text-green/60 hover:text-green font-body py-1"
            >
              Sign in with a password instead
            </button>
          </form>
        ) : (
          <form onSubmit={handlePasswordLogin} className="bg-white rounded-lg border border-green/10 p-6 space-y-4">
            <div>
              <label htmlFor="email" className="block text-xs text-gray-500 font-body mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full rounded-md border border-green/20 px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus:border-green focus:outline-none focus:ring-1 focus:ring-green/30 font-body"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-xs text-gray-500 font-body mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-md border border-green/20 px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus:border-green focus:outline-none focus:ring-1 focus:ring-green/30 font-body"
              />
            </div>
            {error && <p className="text-sm text-red-500 font-body">{error}</p>}
            <button
              type="submit"
              disabled={loading || !email.trim() || !password}
              className="w-full bg-green text-white rounded-md px-4 py-2.5 text-sm font-medium font-body hover:bg-green-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
            <button
              type="button"
              onClick={() => { setMode('magic'); setError(''); }}
              className="w-full text-xs text-green/60 hover:text-green font-body py-1"
            >
              Email me an access link instead
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

export default function ClientLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-pearl" />}>
      <ClientLoginForm />
    </Suspense>
  )
}
