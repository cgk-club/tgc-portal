-- Project Clients + Event Guests Fix
-- Applied: 7 April 2026
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/vxmrvnmtauqqqjikhjbh/sql

-- 1. Fix event_guests: add project_id column for partner project views
ALTER TABLE event_guests ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES client_projects(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_event_guests_project_id ON event_guests(project_id);

-- 2. Create project_clients table (mirrors project_partners pattern)
CREATE TABLE IF NOT EXISTS project_clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES client_projects(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES client_accounts(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'attendee',
  status TEXT DEFAULT 'active',
  notes TEXT,
  visibility_settings JSONB DEFAULT '{
    "milestones": "view",
    "documents": "shared_only",
    "activity": "filtered",
    "financials": "own_only",
    "guests": "first_name_only",
    "schedule": "view",
    "budget": "hidden",
    "sponsors": "hidden",
    "tasks": "hidden",
    "partners": "hidden"
  }'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(project_id, client_id)
);

-- RLS
ALTER TABLE project_clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access project_clients" ON project_clients
  FOR ALL USING (true) WITH CHECK (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_project_clients_project_id ON project_clients(project_id);
CREATE INDEX IF NOT EXISTS idx_project_clients_client_id ON project_clients(client_id);
CREATE INDEX IF NOT EXISTS idx_project_clients_status ON project_clients(status);
