import { ReactElement, ComponentType, SVGProps } from 'react'
import {
  BedDouble, Sofa, Armchair,
  Bath, Droplets, Waves,
  Trees, TreePine, Leaf, Flower2, Sun, Sunrise, Sunset, Tent, Telescope,
  Wind, Thermometer, Flame, Snowflake,
  Wifi, Monitor, Tv, Music, Zap,
  ChefHat, Utensils, UtensilsCrossed, Wine, GlassWater, Coffee,
  Car, ParkingSquare, Plane, Anchor, Sailboat, Bike, Ship, MapPin, Navigation,
  Users, UserCheck, ConciergeBell, Heart, PawPrint,
  Shield, Key, Lock,
  Dumbbell, Sparkles,
  Home, Building2, Building, Hotel, Landmark, Crown, Maximize2, Layers,
  Calendar, CalendarCheck, CalendarRange,
  Star, Trophy, BadgeCheck, Gem,
  Globe, Eye, Mountain, BookOpen, Shirt,
} from 'lucide-react'

type LucideIcon = ComponentType<SVGProps<SVGSVGElement> & { size?: number }>

const S = 16
const CLS = 'stroke-[1.5] shrink-0'

// Store component references (not JSX instances) to avoid react/jsx-key errors.
// Ordered most-specific first — first match wins.
const RULES: [RegExp, LucideIcon][] = [

  // ── Accommodation ─────────────────────────────────────────────────────────
  [/\bbedroom|suite|master bed|sleeping room/,         BedDouble],
  [/\bbathroom|ensuite|en-suite|shower room/,          Bath],
  [/\bsofa bed|pullout|sofa-bed/,                      Sofa],
  [/\bsitting room|lounge|living room|reception room/, Armchair],

  // ── Water & pool ──────────────────────────────────────────────────────────
  [/\bpool|plunge|lap pool|infinity pool/,             Waves],
  [/\bhot tub|jacuzzi|whirlpool|hydro/,                Droplets],
  [/\bsauna|steam room|hammam/,                        Thermometer],
  [/\bwater|waterfront|lake|river|canal|ocean|sea|coast|beach|bay/, Waves],

  // ── Climate & comfort ─────────────────────────────────────────────────────
  [/\bair con|air-con|a\/c|aircon|climate control|cooling/, Wind],
  [/\bheating|underfloor heat|radiant/,                Flame],
  [/\bfireplace|open fire|log fire|woodburner|stove/,  Flame],
  [/\binsulation|double glaz/,                         Snowflake],
  [/\bthermostat|temperature/,                         Thermometer],

  // ── Technology ────────────────────────────────────────────────────────────
  [/\bwi-fi|wifi|wireless|internet|broadband/,         Wifi],
  [/\bcinema|home theatre|home theater|projector|screening/, Monitor],
  [/\btv\b|television|smart tv/,                       Tv],
  [/\bsound system|sonos|music system|speakers|hifi|hi-fi/, Music],
  [/\belectric|ev charger|solar|generator|smart home/, Zap],

  // ── Kitchen & dining ──────────────────────────────────────────────────────
  [/\bchef|private chef|in-house chef/,                ChefHat],
  [/\bcatering|meal|breakfast|lunch|dinner|board|demi-pension|full board/, UtensilsCrossed],
  [/\bkitchen|kitchenette|cooking/,                    Utensils],
  [/\bwine cellar|wine cave|cave/,                     Wine],
  [/\bwine|champagne|cellar/,                          Wine],
  [/\bbar\b|minibar|cocktail/,                         GlassWater],
  [/\bcoffee|espresso|nespresso/,                      Coffee],
  [/\brestaurant|dining room|brasserie|bistro/,        Utensils],
  [/\bmichelin|starred|rosette/,                       Star],

  // ── Outdoor & garden ──────────────────────────────────────────────────────
  [/\bterrace|patio|deck|verandah|loggia/,             Sunrise],
  [/\bbalcony/,                                        Sun],
  [/\bgarden|grounds|lawn|orchard|vineyard/,           Trees],
  [/\bforest|woodland|park|nature/,                    TreePine],
  [/\bflower|floral|botanical/,                        Flower2],
  [/\bleaf|green|eco|organic|sustainable/,             Leaf],
  [/\bview|panoram|panoramic|overlook/,                Eye],
  [/\bmountain|alpine|peak|altitude|ski/,              Mountain],
  [/\btelescope|stargazing|observatory/,               Telescope],
  [/\bcamping|glamping|outdoor living/,                Tent],
  [/\bsunset|sunrise|golden hour/,                     Sunset],

  // ── Fitness & wellness ────────────────────────────────────────────────────
  [/\bgym|fitness|weights|crossfit/,                   Dumbbell],
  [/\bspa|wellness|treatment|therapy|holistic/,        Sparkles],
  [/\byoga|pilates|meditation|mindfulness/,            Leaf],
  [/\bmassage|osteo|physio|bodywork/,                  Heart],
  [/\bbike|cycling|bicycle/,                           Bike],

  // ── Access & security ─────────────────────────────────────────────────────
  [/\bexclusive hire|buyout|sole use|private hire/,    Key],
  [/\bsecurity|alarm|cctv|gated|guard/,                Shield],
  [/\bsafe\b|strong box|safety deposit/,               Lock],
  [/\bkey\b|access|entry/,                             Key],

  // ── Transport & location ──────────────────────────────────────────────────
  [/\bparking|garage|car port|carport/,                ParkingSquare],
  [/\bcar(?! port)\b|vehicle|chauffeur|limousine|transfer/, Car],
  [/\bairport|airfield|airstrip/,                      Plane],
  [/\bhelicop|heli[- ]?pad|heliport/,                  Plane],
  [/\byacht|sailboat|sailing|boat|marina/,             Sailboat],
  [/\bship|ferry|cruise|vessel/,                       Ship],
  [/\banchor|mooring|pontoon/,                         Anchor],
  [/\blocation|address|nearest town|village/,          MapPin],
  [/\btransfer time|drive time|distance/,              Navigation],

  // ── Service & staffing ────────────────────────────────────────────────────
  [/\bhousekeeping|cleaning|maid|turndown/,            Sparkles],
  [/\bconcierge|butler|majordomo|estate manager/,      ConciergeBell],
  [/\blaundry|dry clean|ironing/,                      Shirt],
  [/\bbabysitter|childcare|nanny/,                     Heart],
  [/\bpet(?:s)?[\s-]?friendly|dog\b|cat allowed/,      PawPrint],

  // ── Guests & capacity ─────────────────────────────────────────────────────
  [/\bguest|capacity|sleep|accommodat|person|people|pax/, Users],
  [/\bstaff|personnel|employee/,                       UserCheck],

  // ── Property type ─────────────────────────────────────────────────────────
  [/\bvilla|manoir|manor|house|cottage|chalet/,        Home],
  [/\bhotel|resort|lodge|riad|ryad/,                   Hotel],
  [/\bchateau|castle|palace|palazzo/,                  Crown],
  [/\bapartment|flat|penthouse|studio/,                Building2],
  [/\bestate|domaine|domain|property/,                 Landmark],
  [/\bbuilding|structure|complex/,                     Building],

  // ── Size & configuration ──────────────────────────────────────────────────
  [/\bfloor|level|storey|story/,                       Layers],
  [/\bsiz|area|sqm|m²|sq ft|square|acres|hectare/,     Maximize2],

  // ── Booking & admin ───────────────────────────────────────────────────────
  [/\bcheck.?in|arrival|check.?out|departure/,         CalendarCheck],
  [/\bminimum stay|min stay/,                          CalendarRange],
  [/\bseason|available|availability|open/,             Calendar],
  [/\bprice|rate|cost|fee|tariff|from €|from £/,       Gem],
  [/\blanguage|spoken|english|french|spanish/,         Globe],
  [/\baward|accolade|prize|recognition|certif/,        Trophy],
  [/\brating|score|review/,                            Star],
  [/\bmembership|club\b|member/,                       BadgeCheck],
  [/\bbook|reserv|enquir|inquiry/,                     BookOpen],
]

/**
 * Returns a Lucide icon element matched against the feature label.
 * Case-insensitive keyword matching, most-specific rule first.
 * Falls back to Gem (luxury default).
 */
export function getFeatureIcon(label: string): ReactElement {
  const key = label.toLowerCase()
  for (const [pattern, Icon] of RULES) {
    if (pattern.test(key)) return <Icon size={S} className={CLS} />
  }
  return <Gem size={S} className={CLS} />
}
