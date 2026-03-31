-- Phase 11: Payment System Enhancements
-- Adds: payment dates, click tracking, commission columns, editable bank details,
--        document uploads per payment item, digital signatures

-- 1a. New columns on payment_items
ALTER TABLE payment_items ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ;
ALTER TABLE payment_items ADD COLUMN IF NOT EXISTS deposit_paid_at TIMESTAMPTZ;
ALTER TABLE payment_items ADD COLUMN IF NOT EXISTS link_click_count INTEGER DEFAULT 0;
ALTER TABLE payment_items ADD COLUMN IF NOT EXISTS last_clicked_at TIMESTAMPTZ;
ALTER TABLE payment_items ADD COLUMN IF NOT EXISTS commission_type TEXT;
ALTER TABLE payment_items ADD COLUMN IF NOT EXISTS commission_value NUMERIC;
ALTER TABLE payment_items ADD COLUMN IF NOT EXISTS client_amount NUMERIC;

-- 1b. Admin-editable default bank details per itinerary
ALTER TABLE itineraries ADD COLUMN IF NOT EXISTS default_bank_details JSONB;

-- 1c. Payment documents table (contracts, invoices, CC auth forms)
CREATE TABLE IF NOT EXISTS payment_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_item_id UUID REFERENCES payment_items(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT,
  document_category TEXT NOT NULL DEFAULT 'other'
    CHECK (document_category IN ('contract', 'invoice', 'cc_auth_form', 'receipt', 'other')),
  uploaded_by TEXT,
  uploaded_by_type TEXT DEFAULT 'admin'
    CHECK (uploaded_by_type IN ('admin', 'client')),
  requires_signature BOOLEAN DEFAULT false,
  signature_status TEXT DEFAULT 'unsigned'
    CHECK (signature_status IN ('unsigned', 'signed')),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE payment_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access payment_documents" ON payment_documents
  FOR ALL USING (auth.role() = 'service_role');

-- 1d. Digital signatures table
CREATE TABLE IF NOT EXISTS document_signatures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_document_id UUID REFERENCES payment_documents(id) ON DELETE CASCADE,
  signed_by_name TEXT NOT NULL,
  signed_by_email TEXT NOT NULL,
  signed_at TIMESTAMPTZ DEFAULT now(),
  ip_address TEXT,
  user_agent TEXT,
  signature_data TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE document_signatures ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access document_signatures" ON document_signatures
  FOR ALL USING (auth.role() = 'service_role');
