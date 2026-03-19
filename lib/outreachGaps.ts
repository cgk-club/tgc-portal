import { FicheTemplate, TEMPLATE_LABELS } from './ficheTemplates'

const MEETING_LINK = 'https://calendar.app.google/aAsppu4Tju2my9ST7'

/**
 * Maps template field keys to human-readable questions for suppliers.
 * Only include fields worth asking a supplier about (skip internal-only fields).
 */
const FIELD_QUESTIONS: Record<string, Record<string, string>> = {
  hospitality: {
    room_count: 'Number of rooms and suites',
    checkin_time: 'Check-in and check-out times',
    checkout_time: 'Check-in and check-out times',
    restaurants_onsite: 'Number of restaurants on-site',
    has_spa: 'Spa or wellness facilities (if any)',
    pool: 'Pool (indoor, outdoor, or both)',
    pet_policy: 'Pet policy',
  },
  dining: {
    chef_name: 'Head chef name',
    cuisine: 'Cuisine style or focus',
    covers: 'Number of covers (seats)',
    dress_code: 'Dress code',
    reservation_lead: 'How far ahead to book',
    private_dining: 'Private dining availability and capacity',
    signature_dish: 'Signature dish or tasting menu details',
  },
  real_estate: {
    bedrooms: 'Number of bedrooms',
    bathrooms: 'Number of bathrooms',
    sleeps_adults: 'Maximum number of guests',
    pool: 'Pool (heated, indoor, outdoor)',
    nearest_airport: 'Nearest airport and transfer time',
    catering: 'Catering options (self-catered, chef available, full board)',
    minimum_stay: 'Minimum stay requirement',
  },
  maker: {
    discipline: 'Primary craft or discipline',
    materials: 'Materials used',
    established: 'Year established',
    commissions: 'Whether bespoke commissions are accepted',
    lead_time: 'Typical lead time for commissions',
    ships_internationally: 'Whether you ship internationally',
  },
  experience: {
    duration: 'Typical duration of the experience',
    group_size: 'Minimum and maximum group size',
    languages: 'Languages available',
    whats_included: 'What is included in the price',
    booking_lead_time: 'How far ahead to book',
    seasonal: 'Seasonal availability (if applicable)',
    physical_level: 'Physical level required',
  },
  transport: {
    vehicle_type: 'Vehicle or fleet type',
    capacity_passengers: 'Passenger capacity',
    operating_area: 'Operating area or coverage',
    fleet_size: 'Fleet size',
    lead_time: 'Booking lead time',
    certifications: 'Certifications or licences',
  },
  wine_estate: {
    appellation: 'Appellation or wine region',
    hectares: 'Vineyard size (hectares)',
    grape_varieties: 'Principal grape varieties',
    winemaker: 'Winemaker name',
    cellar_visits: 'Cellar visit and tasting options',
    accommodation: 'On-site accommodation (if any)',
    established: 'Year established',
  },
  wellness: {
    wellness_focus: 'Primary wellness focus or philosophy',
    signature_treatment: 'Signature treatment or programme',
    facilities: 'Key facilities (pool, sauna, treatment rooms, etc.)',
    minimum_stay: 'Minimum stay requirement',
    programmes_available: 'Programmes available (detox, longevity, fitness, etc.)',
    medical_consultations: 'Whether medical consultations are included',
  },
  events_sport: {
    venue_activity_type: 'Type of venue or activity',
    capacity_seated: 'Seated capacity',
    capacity_standing: 'Standing capacity',
    indoor_outdoor: 'Indoor, outdoor, or both',
    exclusive_hire: 'Whether exclusive hire is available',
    catering_inhouse: 'In-house catering availability',
    season: 'Operating season',
  },
  arts_culture: {
    institution_type: 'Type of institution',
    specialisation: 'Area of specialisation',
    private_views: 'Whether private views can be arranged',
    visiting_hours: 'Opening hours',
    admission: 'Admission details',
  },
}

// Fields that are shared across all templates (always check these)
const COMMON_GAPS = {
  hero_image: '3 to 5 high-resolution images we can feature (hero shot, interiors, and grounds)',
}

/**
 * Detects missing fields from a fiche and returns human-readable gap descriptions.
 * Deduplicates questions (e.g. checkin_time and checkout_time produce one bullet).
 */
export function detectGaps(
  templateType: FicheTemplate,
  templateFields: Record<string, unknown> | null,
  heroImageUrl: string | null,
  galleryUrls: string[] | null,
): string[] {
  const gaps: string[] = []
  const seen = new Set<string>()

  // Check template-specific fields
  const questions = FIELD_QUESTIONS[templateType]
  if (questions) {
    const fields = templateFields || {}
    for (const [key, question] of Object.entries(questions)) {
      if (seen.has(question)) continue
      const value = fields[key]
      if (value === undefined || value === null || value === '' || value === 0) {
        gaps.push(question)
        seen.add(question)
      }
    }
  }

  // Check images
  const hasHero = !!heroImageUrl
  const hasGallery = (galleryUrls || []).length >= 3
  if (!hasHero || !hasGallery) {
    gaps.push(COMMON_GAPS.hero_image)
  }

  return gaps
}

/**
 * Returns the partner type label for the email (e.g. "hospitality partner", "dining partner").
 */
function getPartnerLabel(templateType: FicheTemplate): string {
  const labels: Record<string, string> = {
    hospitality: 'hospitality partner',
    dining: 'dining partner',
    real_estate: 'property partner',
    maker: 'artisan partner',
    experience: 'experience partner',
    transport: 'transport partner',
    wine_estate: 'wine partner',
    wellness: 'wellness partner',
    events_sport: 'events and sport partner',
    arts_culture: 'arts and culture partner',
    default: 'partner',
  }
  return labels[templateType] || 'partner'
}

/**
 * Generates the full outreach email body with dynamic gap detection.
 */
export function generateOutreachBody(
  supplierName: string,
  templateType: FicheTemplate,
  templateFields: Record<string, unknown> | null,
  heroImageUrl: string | null,
  galleryUrls: string[] | null,
): string {
  const gaps = detectGaps(templateType, templateFields, heroImageUrl, galleryUrls)
  const partnerLabel = getPartnerLabel(templateType)

  let body = `${supplierName} team,

I'm Christian de Jabrun, founder of The Gatekeepers Club, a concierge and advisory service based in the south of France. We work with independent, quality-led providers rather than mass-market options, connecting them with travelling entrepreneurs and families from the USA, Commonwealth, France and The Netherlands.

We would love to feature and market ${supplierName} to our network as a recommended ${partnerLabel}.`

  if (gaps.length > 0) {
    body += ` For purposes of accuracy and up-to-date records, we're missing a few details. If you're able to share any of the following, we'll be able to share accurate details when responding to enquiries:\n\n`
    body += gaps.map(g => `- ${g}`).join('\n')
  }

  body += `\n\nNo obligation, and no rush. If you'd prefer a quick call instead, please feel free to book a slot here: ${MEETING_LINK}`

  body += `\n\nKind regards,\n\nChristian de Jabrun\nFounder, The Gatekeepers Club\njeeves@thegatekeepers.club\nthegatekeepers.club`

  return body
}
