-- TGC Portal Supabase Schema
-- Run this in the Supabase SQL Editor

-- Core fiche enrichment
CREATE TABLE fiches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  airtable_record_id TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  hero_image_url TEXT,
  headline TEXT,
  description TEXT,
  highlights JSONB DEFAULT '[]',
  gallery_urls JSONB DEFAULT '[]',
  tags JSONB DEFAULT '[]',
  tgc_note TEXT,
  status TEXT DEFAULT 'draft',
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Itinerary structure (Phase 2)
CREATE TABLE itineraries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  client_name TEXT NOT NULL,
  title TEXT NOT NULL,
  cover_image_url TEXT,
  summary TEXT,
  status TEXT DEFAULT 'draft',
  share_token TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Itinerary days
CREATE TABLE itinerary_days (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  itinerary_id UUID REFERENCES itineraries(id) ON DELETE CASCADE,
  day_number INTEGER NOT NULL,
  date DATE,
  title TEXT,
  notes TEXT,
  sort_order INTEGER DEFAULT 0
);

-- Fiche items within a day
CREATE TABLE itinerary_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  day_id UUID REFERENCES itinerary_days(id) ON DELETE CASCADE,
  fiche_id UUID REFERENCES fiches(id),
  custom_title TEXT,
  custom_note TEXT,
  time_of_day TEXT,
  sort_order INTEGER DEFAULT 0
);

-- Enable Row Level Security
ALTER TABLE fiches ENABLE ROW LEVEL SECURITY;
ALTER TABLE itineraries ENABLE ROW LEVEL SECURITY;
ALTER TABLE itinerary_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE itinerary_items ENABLE ROW LEVEL SECURITY;

-- Public read access for live fiches
CREATE POLICY "Public can read live fiches" ON fiches
  FOR SELECT USING (status = 'live');

-- Service role has full access (for admin operations via service key)
CREATE POLICY "Service role full access fiches" ON fiches
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access itineraries" ON itineraries
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access itinerary_days" ON itinerary_days
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access itinerary_items" ON itinerary_items
  FOR ALL USING (auth.role() = 'service_role');
