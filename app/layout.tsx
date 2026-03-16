import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'The Gatekeepers Club',
  description: 'Curated travel experiences by The Gatekeepers Club',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-pearl antialiased">
        {children}
      </body>
    </html>
  )
}
