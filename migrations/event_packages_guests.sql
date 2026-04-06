-- Event Packages and Guests tables
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/vxmrvnmtauqqqjikhjbh/sql

-- 1. Event Packages (what you're selling)
CREATE TABLE IF NOT EXISTS event_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL,
  currency TEXT DEFAULT 'EUR',
  capacity INTEGER,
  sold_count INTEGER DEFAULT 0,
  included_services JSONB DEFAULT '[]',
  status TEXT DEFAULT 'active',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Event Guests (attendees, talent, sponsors, staff)
CREATE TABLE IF NOT EXISTS event_guests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  package_id UUID REFERENCES event_packages(id),
  name TEXT NOT NULL,
  email TEXT,
  title TEXT,
  company TEXT,
  phone TEXT,
  country TEXT,
  guest_type TEXT DEFAULT 'client',  -- client, talent, sponsor, staff, organiser
  dietary_requirements TEXT,
  status TEXT DEFAULT 'pending',  -- pending, invited, confirmed, declined, attended
  invitation_sent_at TIMESTAMPTZ,
  rsvp_at TIMESTAMPTZ,
  payment_status TEXT DEFAULT 'pending',  -- pending, deposit_paid, fully_paid, comped, sponsor_covered
  payment_amount NUMERIC,
  currency TEXT DEFAULT 'EUR',
  payment_date TIMESTAMPTZ,
  accommodation TEXT,  -- yacht_cabin, hotel, apartment, own_arrangement
  accommodation_details TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE event_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_guests ENABLE ROW LEVEL SECURITY;

-- Service role policies (admin only)
CREATE POLICY "Service role full access packages" ON event_packages
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access guests" ON event_guests
  FOR ALL USING (true) WITH CHECK (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_event_packages_event_id ON event_packages(event_id);
CREATE INDEX IF NOT EXISTS idx_event_guests_event_id ON event_guests(event_id);
CREATE INDEX IF NOT EXISTS idx_event_guests_package_id ON event_guests(package_id);
CREATE INDEX IF NOT EXISTS idx_event_guests_status ON event_guests(status);
