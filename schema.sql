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

-- Public read access for shared itineraries (via share_token)
CREATE POLICY "Public can read shared itineraries" ON itineraries
  FOR SELECT USING (status = 'shared');

CREATE POLICY "Public can read itinerary days" ON itinerary_days
  FOR SELECT USING (true);

CREATE POLICY "Public can read itinerary items" ON itinerary_items
  FOR SELECT USING (true);

-- Phase 2 schema additions (run these if tables already exist)
-- ALTER TABLE itinerary_items ADD COLUMN IF NOT EXISTS item_type TEXT DEFAULT 'fiche';
-- ALTER TABLE itinerary_items ADD COLUMN IF NOT EXISTS exact_time TIME;
-- ALTER TABLE itineraries ADD COLUMN IF NOT EXISTS start_date DATE;

-- Phase 3A schema additions (run these in Supabase SQL Editor)
-- Geocoding for fiches
ALTER TABLE fiches ADD COLUMN IF NOT EXISTS latitude DECIMAL(9,6);
ALTER TABLE fiches ADD COLUMN IF NOT EXISTS longitude DECIMAL(9,6);
ALTER TABLE fiches ADD COLUMN IF NOT EXISTS geocoded_at TIMESTAMPTZ;

-- Quote fields on itinerary_items
ALTER TABLE itinerary_items ADD COLUMN IF NOT EXISTS unit_price DECIMAL(10,2);
ALTER TABLE itinerary_items ADD COLUMN IF NOT EXISTS quantity INTEGER DEFAULT 1;
ALTER TABLE itinerary_items ADD COLUMN IF NOT EXISTS price_note TEXT;
ALTER TABLE itinerary_items ADD COLUMN IF NOT EXISTS is_zero_margin BOOLEAN DEFAULT false;
ALTER TABLE itinerary_items ADD COLUMN IF NOT EXISTS is_included BOOLEAN DEFAULT true;

-- Quote fields on itineraries
ALTER TABLE itineraries ADD COLUMN IF NOT EXISTS is_member BOOLEAN DEFAULT false;
ALTER TABLE itineraries ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'EUR';
ALTER TABLE itineraries ADD COLUMN IF NOT EXISTS quote_status TEXT DEFAULT 'draft';
ALTER TABLE itineraries ADD COLUMN IF NOT EXISTS quote_notes TEXT;
ALTER TABLE itineraries ADD COLUMN IF NOT EXISTS quote_token TEXT UNIQUE;

-- Phase 4 schema additions (typed fiche templates)
ALTER TABLE fiches ADD COLUMN IF NOT EXISTS template_type TEXT DEFAULT 'default';
ALTER TABLE fiches ADD COLUMN IF NOT EXISTS template_fields JSONB DEFAULT '{}';
ALTER TABLE fiches ADD COLUMN IF NOT EXISTS show_price BOOLEAN DEFAULT false;
ALTER TABLE fiches ADD COLUMN IF NOT EXISTS price_display TEXT;

-- Phase 3B schema additions (run these in Supabase SQL Editor)

-- Client accounts
CREATE TABLE IF NOT EXISTS client_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  last_login TIMESTAMPTZ
);

-- Magic link tokens
CREATE TABLE IF NOT EXISTS magic_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES client_accounts(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Link itineraries to client accounts
ALTER TABLE itineraries ADD COLUMN IF NOT EXISTS client_email TEXT;
ALTER TABLE itineraries ADD COLUMN IF NOT EXISTS client_account_id UUID REFERENCES client_accounts(id);

-- Outreach log
CREATE TABLE IF NOT EXISTS outreach_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fiche_id UUID REFERENCES fiches(id),
  airtable_record_id TEXT,
  supplier_name TEXT,
  supplier_email TEXT,
  subject TEXT,
  sent_at TIMESTAMPTZ DEFAULT now(),
  sent_by TEXT DEFAULT 'jeeves@thegatekeepers.club'
);

-- RLS for new tables
ALTER TABLE client_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE magic_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE outreach_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access client_accounts" ON client_accounts
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access magic_tokens" ON magic_tokens
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access outreach_log" ON outreach_log
  FOR ALL USING (auth.role() = 'service_role');

-- Phase 5 schema additions (Airtable webhook automation)

-- Webhook log for auditing
CREATE TABLE IF NOT EXISTS webhook_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  received_at TIMESTAMPTZ DEFAULT now(),
  source TEXT DEFAULT 'airtable',
  payload JSONB,
  records_processed INTEGER DEFAULT 0,
  records_created INTEGER DEFAULT 0,
  records_updated INTEGER DEFAULT 0,
  records_skipped INTEGER DEFAULT 0,
  error TEXT,
  duration_ms INTEGER
);

ALTER TABLE webhook_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access webhook_log" ON webhook_log
  FOR ALL USING (auth.role() = 'service_role');

-- Phase 7 schema additions (Supplier pricing register)

CREATE TABLE IF NOT EXISTS supplier_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_name TEXT NOT NULL,
  service TEXT NOT NULL,
  rate DECIMAL(12,2) NOT NULL,
  currency TEXT DEFAULT 'EUR',
  unit TEXT DEFAULT 'per night',
  rate_type TEXT DEFAULT 'net',
  vat_rate DECIMAL(5,2),
  commission_pct DECIMAL(5,2),
  valid_from DATE,
  valid_to DATE,
  variant TEXT,
  client_project TEXT,
  source_contact TEXT,
  source_date DATE,
  source_note TEXT,
  cancellation_terms TEXT,
  status TEXT DEFAULT 'quoted',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE supplier_rates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access supplier_rates" ON supplier_rates
  FOR ALL USING (auth.role() = 'service_role');

-- Phase 8 schema additions (Payment Tracker)

CREATE TABLE IF NOT EXISTS payment_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  itinerary_id UUID REFERENCES itineraries(id) ON DELETE CASCADE,
  service_name TEXT NOT NULL,
  supplier_name TEXT NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'EUR',
  payment_method TEXT NOT NULL DEFAULT 'bank_transfer'
    CHECK (payment_method IN ('bank_transfer', 'cc_link', 'included', 'client_direct')),
  payment_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (payment_status IN ('pending', 'deposit_paid', 'fully_paid', 'confirmed', 'cancelled')),
  cc_payment_url TEXT,
  bank_details JSONB,
  deposit_deadline DATE,
  notes TEXT,
  client_notes TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE payment_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access payment_items" ON payment_items
  FOR ALL USING (auth.role() = 'service_role');

-- Phase 9 schema additions (Choice Cards)

CREATE TABLE IF NOT EXISTS choice_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  itinerary_id UUID REFERENCES itineraries(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  position_after_day INTEGER,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'decided', 'expired')),
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS choice_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES choice_groups(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT,
  price_estimate NUMERIC,
  currency TEXT DEFAULT 'EUR',
  image_url TEXT,
  details JSONB DEFAULT '[]',
  is_selected BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE choice_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE choice_options ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access choice_groups" ON choice_groups
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access choice_options" ON choice_options
  FOR ALL USING (auth.role() = 'service_role');
