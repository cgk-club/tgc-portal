'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SetupPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    setError('')

    const res = await fetch('/api/client/set-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })

    if (res.ok) {
      router.push('/client')
    } else {
      const data = await res.json().catch(() => ({}))
      setError(data.error || 'Something went wrong. Please try again.')
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
            Set your password
          </h1>
          <p className="text-sm text-gray-500 font-body">
            Create a password so you can sign in directly next time.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-green/10 p-6 space-y-4">
          <div>
            <label htmlFor="password" className="block text-xs text-gray-500 font-body mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              required
              minLength={8}
              className="w-full rounded-md border border-green/20 px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus:border-green focus:outline-none focus:ring-1 focus:ring-green/30 font-body"
            />
          </div>
          <div>
            <label htmlFor="confirm" className="block text-xs text-gray-500 font-body mb-1">
              Confirm password
            </label>
            <input
              id="confirm"
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              className="w-full rounded-md border border-green/20 px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus:border-green focus:outline-none focus:ring-1 focus:ring-green/30 font-body"
            />
          </div>
          {error && <p className="text-sm text-red-500 font-body">{error}</p>}
          <button
            type="submit"
            disabled={loading || !password || !confirm}
            className="w-full bg-green text-white rounded-md px-4 py-2.5 text-sm font-medium font-body hover:bg-green-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : 'Set password and continue'}
          </button>
          <button
            type="button"
            onClick={() => router.push('/client')}
            className="w-full text-xs text-green/60 hover:text-green font-body py-1"
          >
            Skip for now
          </button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-6 font-body">
          thegatekeepers.club
        </p>
      </div>
    </div>
  )
}
