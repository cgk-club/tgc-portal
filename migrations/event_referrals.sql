-- Migration: Event Referrals + Affiliate Tracking
-- Date: 9 April 2026
-- Purpose: Public booking page for The Pavilion + affiliate sales tracking system

-- Add referral_code to partner_accounts (API existed but column was missing)
ALTER TABLE partner_accounts ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE;

-- Add slug and project link to events for public event pages
ALTER TABLE events ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;
ALTER TABLE events ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES client_projects(id);
ALTER TABLE events ADD COLUMN IF NOT EXISTS lead_capture_enabled BOOLEAN DEFAULT false;

-- Event referral pipeline tracking
CREATE TABLE IF NOT EXISTS event_referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE SET NULL,
  project_id UUID REFERENCES client_projects(id) ON DELETE SET NULL,
  referrer_id UUID REFERENCES partner_accounts(id) ON DELETE SET NULL,
  referrer_code TEXT,
  prospect_name TEXT,
  prospect_email TEXT,
  prospect_phone TEXT,
  prospect_company TEXT,
  stage TEXT NOT NULL DEFAULT 'prospect'
    CHECK (stage IN ('sent', 'prospect', 'lead', 'client')),
  package_interest TEXT,
  attending_as TEXT CHECK (attending_as IN ('individual', 'couple')),
  source TEXT DEFAULT 'link_click'
    CHECK (source IN ('link_click', 'manual_entry', 'enquiry_form')),
  payment_amount NUMERIC,
  payment_status TEXT DEFAULT 'pending'
    CHECK (payment_status IN ('pending', 'deposit_paid', 'fully_paid', 'cancelled')),
  notes TEXT,
  admin_notes TEXT,
  viewed_at TIMESTAMPTZ,
  enquired_at TIMESTAMPTZ,
  converted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE event_referrals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access event_referrals" ON event_referrals
  FOR ALL USING (auth.role() = 'service_role');
CREATE INDEX IF NOT EXISTS idx_event_referrals_referrer ON event_referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_event_referrals_stage ON event_referrals(stage);
CREATE INDEX IF NOT EXISTS idx_event_referrals_email ON event_referrals(prospect_email);
