'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function DashboardRefresh() {
  const router = useRouter()

  useEffect(() => {
    // Refresh server data when navigating back to the dashboard
    router.refresh()
  }, [router])

  return null
}
