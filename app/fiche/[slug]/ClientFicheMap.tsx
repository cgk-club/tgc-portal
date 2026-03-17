'use client'

import dynamic from 'next/dynamic'

const FicheMap = dynamic(() => import('@/components/maps/FicheMap'), { ssr: false })

interface ClientFicheMapProps {
  lat: number
  lng: number
  name: string
}

export default function ClientFicheMap(props: ClientFicheMapProps) {
  return <FicheMap {...props} />
}
