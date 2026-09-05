/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    // Next 14.2 uses experimental.serverComponentsExternalPackages; the stable
    // top-level `serverExternalPackages` key is Next 15+ and is ignored on 14.2.
    serverComponentsExternalPackages: ['bcryptjs'],
    staleTimes: {
      dynamic: 0,
    },
  },
  async redirects() {
    return [
      {
        source: '/event/the-pavilion',
        destination: '/event/pavilion-terrace',
        permanent: false,
      },
      /* The Intelligence Suite moved to the main domain on 04/September/2026.
         It was never gated behind the portal's auth, so it lived on a subdomain
         only because that is the repo it was written in; on thegatekeepers.club
         it sits under /resources where the site already advertises it, and
         inherits the main domain's authority instead of splitting it.
         Permanent, because these paths were live and linked. */
      {
        source: '/intelligence',
        destination: 'https://www.thegatekeepers.club/resources/intelligence',
        permanent: true,
      },
      {
        source: '/intelligence/:path*',
        destination: 'https://www.thegatekeepers.club/resources/intelligence/:path*',
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          /*
           * NOINDEX ON EVERY RESPONSE, added 05/September/2026.
           *
           * public/robots.txt asks a crawler not to fetch. This is the half
           * that actually removes a page, because a disallowed URL can still be
           * indexed by reference when something links to it, and the routes
           * that matter here are the ones where the URL IS the credential:
           * /itinerary/<shareToken>, /quote/<quoteToken>,
           * /partner/auth/<token>. A share token in a search result is the
           * whole document.
           *
           * `noarchive` as well as `noindex`, so no cache copy survives a
           * token being detached. Archiving an itinerary does not take it
           * offline; detaching the share token does, and a cached page would
           * outlive that.
           *
           * Nothing here is an organic entry point. The marketing site is
           * thegatekeepers.club.
           */
          { key: 'X-Robots-Tag', value: 'noindex, nofollow, noarchive' },
          { key: 'Content-Security-Policy', value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://unpkg.com; img-src 'self' https://*.supabase.co https://*.tile.openstreetmap.org https://*.riv-art.fr https://res.cloudinary.com https://images.unsplash.com https://tgc-intake-proxy-production.up.railway.app https://axwwgrkdco.cloudimg.io https://image-tc.galaxy.tf https://media.timeout.com https://www.countryandtownhouse.com https://www.morganataormina.it data: blob:; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://*.supabase.co https://tgc-intake-proxy-production.up.railway.app; frame-ancestors 'none';" },
        ],
      },
      {
        source: '/api/admin/:path*',
        headers: [
          { key: 'Cache-Control', value: 'no-store, no-cache, must-revalidate, proxy-revalidate' },
          { key: 'Pragma', value: 'no-cache' },
          { key: 'Expires', value: '0' },
        ],
      },
      {
        source: '/api/partner/:path*',
        headers: [
          { key: 'Cache-Control', value: 'no-store, no-cache, must-revalidate, proxy-revalidate' },
          { key: 'Pragma', value: 'no-cache' },
          { key: 'Expires', value: '0' },
        ],
      },
      {
        source: '/api/event/:path*',
        headers: [
          { key: 'Cache-Control', value: 'no-store, no-cache, must-revalidate, proxy-revalidate' },
          { key: 'Pragma', value: 'no-cache' },
          { key: 'Expires', value: '0' },
        ],
      },
      {
        source: '/api/client/:path*',
        headers: [
          { key: 'Cache-Control', value: 'no-store, no-cache, must-revalidate, proxy-revalidate' },
          { key: 'Pragma', value: 'no-cache' },
          { key: 'Expires', value: '0' },
        ],
      },
    ]
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.supabase.co' },
      { protocol: 'https', hostname: 'tgc-intake-proxy-production.up.railway.app' },
      { protocol: 'https', hostname: 'axwwgrkdco.cloudimg.io' },
      { protocol: 'https', hostname: 'image-tc.galaxy.tf' },
      { protocol: 'https', hostname: 'media.timeout.com' },
      { protocol: 'https', hostname: 'www.countryandtownhouse.com' },
      { protocol: 'https', hostname: 'www.morganataormina.it' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },
}

export default nextConfig
