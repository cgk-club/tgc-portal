-- Notifications System Migration
-- Date: 1 April 2026

-- ============================================
-- Notifications table
-- ============================================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_type TEXT NOT NULL CHECK (user_type IN ('client', 'partner', 'admin')),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  type TEXT NOT NULL CHECK (type IN ('update', 'approval', 'itinerary', 'new_partner', 'general')),
  link TEXT,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for fast lookups by user
CREATE INDEX IF NOT EXISTS idx_notifications_user
  ON notifications (user_type, user_id, read, created_at DESC);

-- ============================================
-- RLS Policies
-- ============================================
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Service role can do everything
-- Client/partner access is controlled at the API route level using JWT session verification
CREATE POLICY "Service role full access"
  ON notifications FOR ALL
  USING (true)
  WITH CHECK (true);
