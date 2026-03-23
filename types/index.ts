export interface AirtableOrg {
  id: string
  name: string
  category: string
  categoryParent?: string
  categorySub?: string
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
  latitude: number | null
  longitude: number | null
  geocoded_at: string | null
  template_type: string | null
  template_fields: Record<string, unknown>
  show_price: boolean
  price_display: string | null
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
  client_email: string | null
  client_account_id: string | null
  title: string
  cover_image_url: string | null
  summary: string | null
  status: 'draft' | 'shared' | 'archived'
  share_token: string | null
  start_date: string | null
  is_member: boolean
  currency: string
  quote_status: 'draft' | 'sent' | 'accepted'
  quote_notes: string | null
  quote_token: string | null
  created_at: string
  updated_at: string
  days?: ItineraryDay[]
}

export interface ItineraryDay {
  id: string
  itinerary_id: string
  day_number: number
  date: string | null
  title: string | null
  notes: string | null
  sort_order: number
  items?: ItineraryItem[]
}

export type TimeOfDay = 'breakfast' | 'morning' | 'lunch' | 'afternoon' | 'evening' | 'dinner' | 'late_night'

export interface ItineraryItem {
  id: string
  day_id: string
  fiche_id: string | null
  fiche?: Fiche
  custom_title: string | null
  custom_note: string | null
  time_of_day: TimeOfDay | null
  exact_time: string | null
  sort_order: number
  item_type: 'fiche' | 'note'
  unit_price: number | null
  quantity: number
  price_note: string | null
  is_zero_margin: boolean
  is_included: boolean
}

export interface WebhookLog {
  id: string
  received_at: string
  source: string
  payload: Record<string, unknown>
  records_processed: number
  records_created: number
  records_updated: number
  records_skipped: number
  error: string | null
  duration_ms: number
}

export type RateUnit = 'per night' | 'per trip' | 'per person' | 'per day' | 'flat' | 'per hour' | 'other'
export type RateType = 'net' | 'gross' | 'inc_vat'
export type RateStatus = 'quoted' | 'confirmed' | 'expired' | 'booked' | 'cancelled'

export interface SupplierRate {
  id: string
  supplier_name: string
  service: string
  rate: number
  currency: string
  unit: RateUnit
  rate_type: RateType
  vat_rate: number | null
  commission_pct: number | null
  valid_from: string | null
  valid_to: string | null
  variant: string | null
  client_project: string | null
  source_contact: string | null
  source_date: string | null
  source_note: string | null
  cancellation_terms: string | null
  status: RateStatus
  notes: string | null
  created_at: string
  updated_at: string
}

// Payment Tracker types
export type PaymentMethod = 'bank_transfer' | 'cc_link' | 'included' | 'client_direct'
export type PaymentStatus = 'pending' | 'deposit_paid' | 'fully_paid' | 'confirmed' | 'cancelled'

export interface BankDetails {
  bank_name?: string
  iban: string
  bic: string
  reference?: string
  account_holder: string
}

export interface PaymentItem {
  id: string
  itinerary_id: string
  service_name: string
  supplier_name: string
  amount: number
  currency: string
  payment_method: PaymentMethod
  payment_status: PaymentStatus
  cc_payment_url?: string
  bank_details?: BankDetails
  deposit_deadline?: string
  notes?: string
  client_notes?: string
  sort_order: number
  created_at: string
  updated_at: string
}

export interface QuoteCalculation {
  commissionableTotal: number
  zeroMarginTotal: number
  feeRate: number
  feeAmount: number
  clientTotal: number
  pointsEarned: number
  pointsValue: number
  requiresNegotiation: boolean
}
