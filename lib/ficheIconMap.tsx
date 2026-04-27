import { ReactElement } from 'react'
import {
  // Beds & rooms
  BedDouble, Sofa, Armchair,
  // Bathrooms & water
  Bath, Droplets, Waves,
  // Outdoor & nature
  Trees, TreePine, Leaf, Flower2, Sun, Sunrise, Sunset, Tent, Telescope,
  // Climate & comfort
  Wind, Thermometer, Flame, Snowflake,
  // Technology & connectivity
  Wifi, Monitor, Tv, Music, Zap,
  // Food & beverage
  ChefHat, Utensils, UtensilsCrossed, Wine, GlassWater, Coffee,
  // Transport & location
  Car, ParkingSquare, Plane, Anchor, Sailboat, Bike, Ship, MapPin, Navigation,
  // People & service
  Users, UserCheck, ConciergeBell, Heart, PawPrint,
  // Security & access
  Shield, Key, Lock,
  // Fitness & wellness
  Dumbbell,
  // Property & space
  Home, Building2, Building, Hotel, Landmark, Crown, Maximize2, Ruler, Layers,
  // Calendar & time
  Calendar, CalendarCheck, CalendarRange,
  // Status & awards
  Star, Trophy, Award, BadgeCheck, Gem, Diamond,
  // Misc
  Globe, Eye, Mountain, BookOpen, Shirt, Sparkles,
} from 'lucide-react'

const S = 16
const CLS = 'stroke-[1.5] shrink-0'

// ─── Keyword → icon map ────────────────────────────────────────────────────
// Ordered from most specific to most general. First match wins.
const RULES: [RegExp, ReactElement][] = [

  // ── Accommodation ─────────────────────────────────────────────────────────
  [/\bbedroom|suite|master bed|sleeping room/,         <BedDouble  size={S} className={CLS} />],
  [/\bbathroom|ensuite|en-suite|shower room/,          <Bath       size={S} className={CLS} />],
  [/\bsofa bed|pullout|sofa-bed/,                      <Sofa       size={S} className={CLS} />],
  [/\bsitting room|lounge|living room|reception room/, <Armchair   size={S} className={CLS} />],

  // ── Water & pool ──────────────────────────────────────────────────────────
  [/\bpool|plunge|lap pool|infinity pool/,             <Waves      size={S} className={CLS} />],
  [/\bhot tub|jacuzzi|whirlpool|hydro/,                <Droplets   size={S} className={CLS} />],
  [/\bsauna|steam room|hammam|bain/,                   <Thermometer size={S} className={CLS} />],
  [/\bwater|waterfront|lake|river|canal|ocean|sea|coast|beach|bay/, <Waves size={S} className={CLS} />],

  // ── Climate & comfort ─────────────────────────────────────────────────────
  [/\bair con|air-con|a\/c|aircon|climate control|cooling/, <Wind   size={S} className={CLS} />],
  [/\bheating|underfloor heat|radiant/,                <Flame      size={S} className={CLS} />],
  [/\bfireplace|open fire|log fire|woodburner|stove/,  <Flame      size={S} className={CLS} />],
  [/\binsulation|double glaz/,                        <Snowflake  size={S} className={CLS} />],
  [/\bthermostat|temperature/,                         <Thermometer size={S} className={CLS} />],

  // ── Technology ────────────────────────────────────────────────────────────
  [/\bwi-fi|wifi|wireless|internet|broadband/,         <Wifi       size={S} className={CLS} />],
  [/\bcinema|home theatre|home theater|projector|screening/, <Monitor size={S} className={CLS} />],
  [/\btv|television|smart tv/,                         <Tv         size={S} className={CLS} />],
  [/\bsound system|sonos|music system|speakers|hifi|hi-fi/, <Music  size={S} className={CLS} />],
  [/\belectric|ev charger|solar|generator/,            <Zap        size={S} className={CLS} />],
  [/\bsmart home|home automation|domotics/,             <Zap        size={S} className={CLS} />],

  // ── Kitchen & dining ──────────────────────────────────────────────────────
  [/\bchef|private chef|in-house chef/,                <ChefHat    size={S} className={CLS} />],
  [/\bcatering|meal|breakfast|lunch|dinner|board|demi-pension|full board/, <UtensilsCrossed size={S} className={CLS} />],
  [/\bkitchen|kitchenette|cooking/,                    <Utensils   size={S} className={CLS} />],
  [/\bwine cellar|wine cave|cave/,                     <Wine       size={S} className={CLS} />],
  [/\bwine|champagne|cellar/,                          <Wine       size={S} className={CLS} />],
  [/\bbar|minibar|cocktail/,                           <GlassWater size={S} className={CLS} />],
  [/\bcoffee|espresso|nespresso/,                      <Coffee     size={S} className={CLS} />],
  [/\brestaurant|dining room|brasserie|bistro/,        <Utensils   size={S} className={CLS} />],
  [/\bmichelin|star(?:red)?|rosette/,                  <Star       size={S} className={CLS} />],

  // ── Outdoor & garden ──────────────────────────────────────────────────────
  [/\bterrace|patio|deck|verandah|loggia/,             <Sunrise    size={S} className={CLS} />],
  [/\bbalcony/,                                        <Sun        size={S} className={CLS} />],
  [/\bgarden|grounds|lawn|orchard|vineyard/,           <Trees      size={S} className={CLS} />],
  [/\bforest|woodland|park|nature/,                    <TreePine   size={S} className={CLS} />],
  [/\bflower|floral|botanical/,                        <Flower2    size={S} className={CLS} />],
  [/\bleaf|green|eco|organic|sustainable/,             <Leaf       size={S} className={CLS} />],
  [/\bview|panoram|panoramic|overlook/,                <Eye        size={S} className={CLS} />],
  [/\bmountain|alpine|peak|altitude|ski/,              <Mountain   size={S} className={CLS} />],
  [/\btelescope|stargazing|observatory/,               <Telescope  size={S} className={CLS} />],
  [/\bcamping|glamping|outdoor living/,                <Tent       size={S} className={CLS} />],
  [/\bsunset|sunrise|golden hour/,                     <Sunset     size={S} className={CLS} />],

  // ── Fitness & wellness ────────────────────────────────────────────────────
  [/\bgym|fitness|weights|crossfit|sport(?:s)? facilit/,<Dumbbell  size={S} className={CLS} />],
  [/\bspa|wellness|treatment|therapy|holistic/,        <Sparkles   size={S} className={CLS} />],
  [/\byoga|pilates|meditation|mindfulness/,            <Leaf       size={S} className={CLS} />],
  [/\bmassage|osteo|physio|bodywork/,                  <Heart      size={S} className={CLS} />],
  [/\bbike|cycling|bicycle/,                           <Bike       size={S} className={CLS} />],

  // ── Access & security ─────────────────────────────────────────────────────
  [/\bexclusive hire|buyout|sole use|private hire/,    <Key        size={S} className={CLS} />],
  [/\bsecurity|alarm|cctv|gated|guard/,                <Shield     size={S} className={CLS} />],
  [/\bsafe|strong box|safety deposit/,                 <Lock       size={S} className={CLS} />],
  [/\bkey|access|entry/,                               <Key        size={S} className={CLS} />],

  // ── Transport & location ──────────────────────────────────────────────────
  [/\bparking|garage|car port|carport/,                <ParkingSquare size={S} className={CLS} />],
  [/\bcar(?! port)|vehicle|chauffeur|limousine|transfer/, <Car     size={S} className={CLS} />],
  [/\bairport|airfield|airstrip/,                      <Plane      size={S} className={CLS} />],
  [/\bhelicop|heli[- ]?pad|heliport/,                  <Plane      size={S} className={CLS} />],
  [/\byacht|sailboat|sailing|boat|marina/,             <Sailboat   size={S} className={CLS} />],
  [/\bship|ferry|cruise|vessel/,                       <Ship       size={S} className={CLS} />],
  [/\banchor|mooring|pontoon/,                         <Anchor     size={S} className={CLS} />],
  [/\blocation|address|nearest town|village/,          <MapPin     size={S} className={CLS} />],
  [/\btransfer time|drive time|distance/,              <Navigation size={S} className={CLS} />],

  // ── Service & staffing ────────────────────────────────────────────────────
  [/\bhousekeeping|cleaning|maid|turndown/,            <Sparkles   size={S} className={CLS} />],
  [/\bconcierge|butler|majordomo|estate manager/,      <ConciergeBell size={S} className={CLS} />],
  [/\blaundry|dry clean|ironing/,                      <Shirt      size={S} className={CLS} />],
  [/\bbabysitter|childcare|nanny/,                     <Heart      size={S} className={CLS} />],
  [/\bpet(?:s)?[\s-]?friendly|dog|cat allowed/,        <PawPrint   size={S} className={CLS} />],

  // ── Guests & capacity ─────────────────────────────────────────────────────
  [/\bguest|capacity|sleep|accommodat|person|people|pax/, <Users   size={S} className={CLS} />],
  [/\bstaff|personnel|employee/,                       <UserCheck  size={S} className={CLS} />],

  // ── Property type ─────────────────────────────────────────────────────────
  [/\bvilla|manoir|manor|house|cottage|chalet/,        <Home       size={S} className={CLS} />],
  [/\bhotel|resort|lodge|riad|ryad/,                   <Hotel      size={S} className={CLS} />],
  [/\bchateau|castle|palace|palazzo/,                  <Crown      size={S} className={CLS} />],
  [/\bapartment|flat|penthouse|studio/,                <Building2  size={S} className={CLS} />],
  [/\bestate|domaine|domain|property/,                 <Landmark   size={S} className={CLS} />],
  [/\bbuilding|structure|complex/,                     <Building   size={S} className={CLS} />],

  // ── Size & configuration ──────────────────────────────────────────────────
  [/\b(?:floor|level|storey|story)s?\b/,               <Layers     size={S} className={CLS} />],
  [/\bsiz|area|sqm|m²|sq ft|square|acres|hectare/,     <Maximize2  size={S} className={CLS} />],

  // ── Booking & admin ───────────────────────────────────────────────────────
  [/\bcheck.?in|arrival|check.?out|departure/,         <CalendarCheck size={S} className={CLS} />],
  [/\bminimum stay|min stay|minstay/,                  <CalendarRange size={S} className={CLS} />],
  [/\bseason|available|availability|open/,             <Calendar   size={S} className={CLS} />],
  [/\bprice|rate|cost|fee|tariff|from €|from £|from \$/, <Gem      size={S} className={CLS} />],
  [/\blanguage|spoken|english|french|spanish/,         <Globe      size={S} className={CLS} />],
  [/\baward|accolade|prize|recognition|certif/,        <Trophy     size={S} className={CLS} />],
  [/\brating|score|review/,                            <Star       size={S} className={CLS} />],
  [/\bmembership|club|member/,                         <BadgeCheck size={S} className={CLS} />],
  [/\bbook|reserv|enquir|inquiry/,                     <BookOpen   size={S} className={CLS} />],
]

// ─── Public helper ─────────────────────────────────────────────────────────

/**
 * Returns a Lucide icon element matched against the feature label.
 * Matching is case-insensitive and checks for keyword containment.
 * Falls back to Gem (luxury default) if no rule matches.
 */
export function getFeatureIcon(label: string): ReactElement {
  const key = label.toLowerCase()
  for (const [pattern, icon] of RULES) {
    if (pattern.test(key)) return icon
  }
  return <Gem size={S} className={CLS} />
}
