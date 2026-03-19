export type FicheTemplate =
  | 'hospitality'
  | 'real_estate'
  | 'dining'
  | 'maker'
  | 'experience'
  | 'transport'
  | 'wine_estate'
  | 'wellness'
  | 'events_sport'
  | 'arts_culture'
  | 'default'

export const TEMPLATE_LABELS: Record<FicheTemplate, string> = {
  hospitality: 'Hospitality',
  real_estate: 'Real Estate',
  dining: 'Dining',
  maker: 'Maker',
  experience: 'Experience',
  transport: 'Travel & Transport',
  wine_estate: 'Wine Estate',
  wellness: 'Wellness',
  events_sport: 'Events & Sport',
  arts_culture: 'Arts & Culture',
  default: 'Default',
}

// Updated after taxonomy cleanup, 19 March 2026
// Maps standardised Category Sub values to fiche template types
export const CATEGORY_TEMPLATE_MAP: Record<string, FicheTemplate> = {
  // HOSPITALITY template — hotels, lodges, resorts
  'Boutique Hotels': 'hospitality',
  'Luxury Hotels': 'hospitality',
  'Palace Hotels': 'hospitality',
  'Safari Lodges & Camps': 'hospitality',
  'Resort Hotels': 'hospitality',
  'Boutique Guesthouses': 'hospitality',
  'Bed & Breakfast': 'hospitality',
  'Vineyards, Distilleries & Breweries': 'hospitality',

  // DINING template — restaurants, chefs, food service
  'Independent Restaurants': 'dining',
  'Fine Dining': 'dining',
  'Casual Dining': 'dining',
  'Private Chefs': 'dining',
  'Cafés & Patisseries': 'dining',
  'Beach Clubs & Pool Bars': 'dining',
  'Private Dining Experiences': 'dining',

  // REAL ESTATE template — villas, estates, residences
  'Villas & Private Estates': 'real_estate',
  'Châteaux & Manor Houses': 'real_estate',
  'Apartments & City Residences': 'real_estate',
  'Land & Development': 'real_estate',
  'Property Management': 'real_estate',
  'Estate Agents': 'real_estate',

  // MAKER template — artisans, craftspeople, designers
  'Traditional Crafts': 'maker',
  'Contemporary Design': 'maker',
  'Jewellery & Accessories': 'maker',
  'Fashion & Tailoring': 'maker',
  'Ceramics & Pottery': 'maker',
  'Glasswork': 'maker',
  'Textile & Weaving': 'maker',
  'Furniture & Cabinetry': 'maker',
  'Perfumery & Beauty': 'maker',
  'Food & Artisan Produce': 'maker',

  // EXPERIENCE template — tours, adventures, activities
  'Cultural Tours & Guided Experiences': 'experience',
  'Adventure & Outdoor': 'experience',
  'Culinary Experiences & Classes': 'experience',
  'Photography Experiences': 'experience',
  'Music & Arts Experiences': 'experience',
  'Private Access & VIP Experiences': 'experience',
  'Safari & Wildlife': 'experience',

  // TRANSPORT template — aviation, yachts, transfers
  'Private Aviation': 'transport',
  'Commercial Aviation': 'transport',
  'Helicopter Services': 'transport',
  'Yacht Charters': 'transport',
  'Boat & River Cruises': 'transport',
  'Luxury Transfers': 'transport',
  'Car Rental': 'transport',
  'Luxury Car Rental': 'transport',
  'Rail & Train Travel': 'transport',
  'Chauffeur Services': 'transport',

  // WINE ESTATE template
  'Wine Estates & Domaines': 'wine_estate',

  // WELLNESS template
  'Wellness & Spa Retreats': 'wellness',
  'Wellness & Spa': 'wellness',

  // EVENTS & SPORT template
  'Event Venues': 'events_sport',
  'Event Production': 'events_sport',
  'Wedding Services': 'events_sport',
  'Golf': 'events_sport',
  'Equestrian': 'events_sport',
  'Water Sports': 'events_sport',
  'Skiing': 'events_sport',
  'Tennis': 'events_sport',

  // ARTS & CULTURE template
  'Galleries & Art Dealers': 'arts_culture',
  'Museums & Cultural Institutions': 'arts_culture',
  'Performing Arts': 'arts_culture',
  'Auction Houses': 'arts_culture',
}

export function getTemplate(categorySub?: string): FicheTemplate {
  if (!categorySub) return 'default'
  return CATEGORY_TEMPLATE_MAP[categorySub] ?? 'default'
}

// Sub-layout detection for Transport template
const AIR_SEA_CATEGORIES = [
  'Private Aviation', 'Commercial Aviation', 'Helicopter Services',
  'Yacht Charters', 'Boat & River Cruises',
]

export function isAirSeaTransport(categorySub?: string): boolean {
  return AIR_SEA_CATEGORIES.includes(categorySub ?? '')
}

// Sub-layout detection for Events & Sport template
const VENUE_CATEGORIES = ['Event Venues', 'Event Production', 'Wedding Services']

export function isVenueEvent(categorySub?: string): boolean {
  return VENUE_CATEGORIES.includes(categorySub ?? '')
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

export interface ExperienceFields {
  experience_type?: string
  duration?: string
  group_size?: string
  physical_level?: 'None' | 'Easy' | 'Moderate' | 'Challenging' | 'Strenuous'
  minimum_age?: string
  languages?: string
  whats_included?: string
  whats_not_included?: string
  booking_lead_time?: string
  seasonal?: string
}

export interface TransportFields {
  vehicle_type?: string
  capacity_passengers?: number
  capacity_crew?: number
  range_coverage?: string
  fleet_size?: string
  base_location?: string
  operating_area?: string
  lead_time?: string
  certifications?: string
  catering?: string
}

export interface WineEstateFields {
  appellation?: string
  hectares?: number
  annual_production?: string
  grape_varieties?: string
  winemaker?: string
  certifications?: string
  established?: number
  accommodation?: boolean
  accommodation_details?: string
  cellar_visits?: string
  tasting_format?: string
  restaurant_bistro?: boolean
  shipping?: string
}

export interface WellnessFields {
  wellness_focus?: string
  treatment_philosophy?: string
  signature_treatment?: string
  facilities?: string
  practitioners?: string
  minimum_stay?: string
  programmes_available?: string
  accommodation?: boolean
  suitable_for?: string
  medical_consultations?: boolean
}

export interface EventsSportFields {
  venue_activity_type?: string
  capacity_seated?: number
  capacity_standing?: number
  indoor_outdoor?: 'Indoor' | 'Outdoor' | 'Both'
  exclusive_hire?: 'Yes' | 'No' | 'On request'
  catering_inhouse?: boolean
  av_equipment?: 'Yes' | 'No' | 'External only'
  accommodation_onsite?: boolean
  accessibility?: string
  season?: string
  skill_level?: 'All levels' | 'Beginner' | 'Intermediate' | 'Advanced'
  instruction_available?: boolean
  equipment_hire?: boolean
  membership_required?: boolean
  guest_policy?: string
}

export interface ArtsCultureFields {
  institution_type?: string
  founded?: number
  specialisation?: string
  permanent_collection?: boolean
  current_programme?: string
  private_views?: boolean
  art_advisory?: boolean
  shipping_logistics?: boolean
  visiting_hours?: string
  admission?: string
}
