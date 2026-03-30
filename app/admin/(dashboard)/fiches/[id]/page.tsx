'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import FicheEditor from '@/components/admin/FicheEditor'
import { FicheWithOrg } from '@/types'

export default function FicheEditPage() {
  const params = useParams()
  const [fiche, setFiche] = useState<FicheWithOrg | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/admin/fiches/${params.id}`)
      if (res.ok) {
        setFiche(await res.json())
      } else {
        setError('Fiche not found')
      }
      setLoading(false)
    }
    load()
  }, [params.id])

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <p className="text-gray-500 font-body">Loading...</p>
      </div>
    )
  }

  if (error || !fiche) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <p className="text-red-600 font-body">{error || 'Fiche not found'}</p>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="font-heading text-2xl font-semibold text-green mb-6">
        {fiche.org?.name || fiche.slug}
      </h1>
      <FicheEditor fiche={fiche} />
    </div>
  )
}
