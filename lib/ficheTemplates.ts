export type FicheTemplate =
  | 'hospitality'
  | 'real_estate'
  | 'dining'
  | 'maker'
  | 'default'

export const TEMPLATE_LABELS: Record<FicheTemplate, string> = {
  hospitality: 'Hospitality',
  real_estate: 'Real Estate',
  dining: 'Dining',
  maker: 'Maker',
  default: 'Default',
}

// Populated from Airtable Category Sub audit (March 2026)
export const CATEGORY_TEMPLATE_MAP: Record<string, FicheTemplate> = {
  // Hospitality
  'Boutique Hotels': 'hospitality',
  'Boutique Hotel': 'hospitality',
  'Luxury Hotel': 'hospitality',
  'Hotel': 'hospitality',
  'Accommodation': 'hospitality',
  'Safari Operators': 'hospitality',
  'Boutique Hotels / Wellness Retreat': 'hospitality',

  // Real Estate
  'Luxury Villas': 'real_estate',
  'Private Estate': 'real_estate',
  'Wine & Country Estate': 'real_estate',
  'Estate / Wine': 'real_estate',
  'Luxury Real Estate': 'real_estate',
  'Premium Real Estate': 'real_estate',

  // Dining
  'Independent Restaurants': 'dining',
  'Restaurant': 'dining',
  'Restaurant Group / Multi-Venue': 'dining',
  'Japanese / Curry': 'dining',
  'Japanese / Soba': 'dining',
  'Casual Japanese / Onigiri': 'dining',

  // Maker
  'Tailors & Bespoke': 'maker',
  'Cutlery & Bladesmith': 'maker',
  'Jewellers': 'maker',
  'Textiles': 'maker',
  'Watches & Jewellery': 'maker',
  'Gold Leaf / Restoration': 'maker',
  'Traditional Crafts': 'maker',
  'Charcutiers': 'maker',
  'Bakers & Pâtissiers': 'maker',
}

export function getTemplate(categorySub?: string): FicheTemplate {
  if (!categorySub) return 'default'
  return CATEGORY_TEMPLATE_MAP[categorySub] ?? 'default'
}

// Template-specific field definitions for the admin editor
export interface HospitalityFields {
  room_count?: number
  star_rating?: number
  checkin_time?: string
  checkout_time?: string
  restaurants_onsite?: number
  has_spa?: boolean
  pool?: 'none' | 'indoor' | 'outdoor' | 'both'
  pet_policy?: string
  minimum_stay?: string
}

export interface RealEstateFields {
  sleeps_adults?: number
  sleeps_children?: number
  bedrooms?: number
  bathrooms?: number
  pool?: 'none' | 'heated' | 'unheated' | 'indoor'
  pool_size?: string
  nearest_airport?: string
  transfer_time?: string
  catering?: 'self-catered' | 'chef-available' | 'full-board'
  events_permitted?: 'yes' | 'no' | 'on-request'
  exclusive_hire?: boolean
  minimum_stay?: string
}

export interface DiningFields {
  cuisine?: string
  chef_name?: string
  recognition?: string
  covers?: number
  signature_dish?: string
  dress_code?: 'casual' | 'smart-casual' | 'smart' | 'black-tie'
  reservation_lead?: string
  private_dining?: boolean
  private_dining_details?: string
}

export interface MakerFields {
  discipline?: string
  materials?: string
  based_in?: string
  established?: number
  commissions?: 'open' | 'closed' | 'on-request'
  ships_internationally?: boolean
  lead_time?: string
  maker_portrait_url?: string
  pull_quote?: string
  pull_quote_attribution?: string
}
