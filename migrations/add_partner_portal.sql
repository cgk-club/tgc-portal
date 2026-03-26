-- Partner Portal Schema Migration
-- Run in Supabase SQL Editor
-- Date: 26 March 2026

-- ============================================
-- Partner Accounts
-- ============================================
CREATE TABLE IF NOT EXISTS partner_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  password_hash TEXT,
  org_ids TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended')),
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Partner Magic Tokens
CREATE TABLE IF NOT EXISTS partner_magic_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID REFERENCES partner_accounts(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- Partner Offers
-- ============================================
CREATE TABLE IF NOT EXISTS partner_offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID REFERENCES partner_accounts(id) ON DELETE CASCADE,
  fiche_id UUID REFERENCES fiches(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  discount_type TEXT NOT NULL DEFAULT 'value_add' CHECK (discount_type IN ('percentage', 'fixed', 'value_add')),
  discount_value TEXT,
  valid_from DATE,
  valid_to DATE,
  terms TEXT,
  tier TEXT NOT NULL DEFAULT 'all' CHECK (tier IN ('all', 'members')),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'active', 'rejected', 'expired')),
  admin_note TEXT,
  content_card_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- Partner Events
-- ============================================
CREATE TABLE IF NOT EXISTS partner_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID REFERENCES partner_accounts(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Hospitality',
  date_display TEXT NOT NULL,
  date_start DATE,
  date_end DATE,
  location TEXT,
  capacity INTEGER,
  price TEXT DEFAULT 'On application',
  description TEXT,
  highlights TEXT,
  image_url TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'active', 'rejected', 'expired')),
  admin_note TEXT,
  enquiry_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- Partner Referrals
-- ============================================
CREATE TABLE IF NOT EXISTS partner_referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID REFERENCES partner_accounts(id) ON DELETE CASCADE,
  referral_code TEXT NOT NULL,
  visitor_cookie TEXT,
  visitor_email TEXT,
  visitor_name TEXT,
  source_url TEXT,
  status TEXT NOT NULL DEFAULT 'visited' CHECK (status IN ('visited', 'enquired', 'converted')),
  revenue_attributed NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  converted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_partner_referrals_code ON partner_referrals(referral_code);
CREATE INDEX IF NOT EXISTS idx_partner_referrals_partner ON partner_referrals(partner_id);

-- ============================================
-- Partner Content Submissions
-- ============================================
CREATE TABLE IF NOT EXISTS partner_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID REFERENCES partner_accounts(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'story' CHECK (type IN ('story', 'seasonal', 'update', 'highlight')),
  title TEXT NOT NULL,
  body TEXT,
  images JSONB DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'approved', 'published', 'rejected')),
  published_to TEXT,
  admin_note TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- Fiche Edit Requests
-- ============================================
CREATE TABLE IF NOT EXISTS fiche_edit_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fiche_id UUID REFERENCES fiches(id) ON DELETE CASCADE,
  partner_id UUID REFERENCES partner_accounts(id) ON DELETE CASCADE,
  changes JSONB NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_note TEXT,
  submitted_at TIMESTAMPTZ DEFAULT now(),
  reviewed_at TIMESTAMPTZ
);

-- ============================================
-- Partner Availability
-- ============================================
CREATE TABLE IF NOT EXISTS partner_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID REFERENCES partner_accounts(id) ON DELETE CASCADE,
  fiche_id UUID REFERENCES fiches(id) ON DELETE CASCADE,
  date_start DATE NOT NULL,
  date_end DATE NOT NULL,
  availability_type TEXT NOT NULL DEFAULT 'available' CHECK (availability_type IN ('available', 'blackout', 'limited')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_partner_availability_dates ON partner_availability(fiche_id, date_start, date_end);

-- ============================================
-- Alter existing tables
-- ============================================

-- Link fiches to partner accounts
ALTER TABLE fiches ADD COLUMN IF NOT EXISTS partner_account_id UUID REFERENCES partner_accounts(id);

-- Add partner source to events table
ALTER TABLE events ADD COLUMN IF NOT EXISTS partner_id UUID REFERENCES partner_accounts(id);
ALTER TABLE events ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'tgc';
ALTER TABLE events ADD COLUMN IF NOT EXISTS approval_status TEXT DEFAULT 'approved';

-- ============================================
-- RLS Policies
-- ============================================
ALTER TABLE partner_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_magic_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE fiche_edit_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_availability ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access partner_accounts" ON partner_accounts
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access partner_magic_tokens" ON partner_magic_tokens
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access partner_offers" ON partner_offers
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access partner_events" ON partner_events
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access partner_referrals" ON partner_referrals
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access partner_content" ON partner_content
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access fiche_edit_requests" ON fiche_edit_requests
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access partner_availability" ON partner_availability
  FOR ALL USING (auth.role() = 'service_role');
