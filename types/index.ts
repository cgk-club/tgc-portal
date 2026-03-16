export interface AirtableOrg {
  id: string
  name: string
  category: string
  country: string
  region: string
  city: string
  website?: string
  phone?: string
  email?: string
  tags?: string[]
}

export interface Highlight {
  icon: string
  label: string
  value: string
}

export interface Fiche {
  id: string
  airtable_record_id: string
  slug: string
  hero_image_url: string | null
  headline: string | null
  description: string | null
  highlights: Highlight[]
  gallery_urls: string[]
  tags: string[]
  tgc_note: string | null
  status: 'draft' | 'live' | 'archived'
  featured: boolean
  created_at: string
  updated_at: string
}

export interface FicheWithOrg extends Fiche {
  org: AirtableOrg
}

export interface Itinerary {
  id: string
  slug: string
  client_name: string
  title: string
  cover_image_url: string | null
  summary: string | null
  status: 'draft' | 'shared' | 'archived'
  share_token: string | null
  created_at: string
  updated_at: string
}

export interface ItineraryDay {
  id: string
  itinerary_id: string
  day_number: number
  date: string | null
  title: string | null
  notes: string | null
  sort_order: number
}

export interface ItineraryItem {
  id: string
  day_id: string
  fiche_id: string | null
  custom_title: string | null
  custom_note: string | null
  time_of_day: 'morning' | 'afternoon' | 'evening' | null
  sort_order: number
}
