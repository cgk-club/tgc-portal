import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-green flex flex-col items-center justify-center px-6 text-center"
      style={{ background: 'linear-gradient(135deg, #0e4f51 0%, #0a3a3c 60%, #061f20 100%)' }}>

      {/* Brand */}
      <p className="text-[10px] tracking-[5px] text-gold uppercase mb-8 font-body">
        The Gatekeepers Club
      </p>

      <h1 className="font-heading text-3xl sm:text-4xl font-light text-white tracking-wide mb-2">
        Portal
      </h1>

      <div className="w-10 h-px bg-gold mx-auto mb-10" />

      {/* Portal options */}
      <div className="w-full max-w-sm space-y-3">
        <Link
          href="/client/login"
          className="block w-full py-3.5 px-6 rounded-lg border border-white/20 text-white text-sm font-body font-medium hover:bg-white/10 transition-colors"
        >
          Client Portal
        </Link>

        <Link
          href="/partner/login"
          className="block w-full py-3.5 px-6 rounded-lg border border-white/20 text-white text-sm font-body font-medium hover:bg-white/10 transition-colors"
        >
          Partner Portal
        </Link>

        <Link
          href="/admin"
          className="block w-full py-3.5 px-6 rounded-lg border border-gold/30 text-gold/70 text-sm font-body hover:bg-gold/5 transition-colors"
        >
          Administration
        </Link>
      </div>

      {/* Footer */}
      <p className="mt-16 text-[9px] tracking-[3px] text-white/20 uppercase font-body">
        thegatekeepers.club
      </p>
    </div>
  )
}
