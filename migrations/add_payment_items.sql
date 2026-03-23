-- Payment Tracker: payment_items table
-- Run this in the Supabase SQL Editor

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
