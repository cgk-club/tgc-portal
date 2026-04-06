-- Add visibility_settings to project_partners
ALTER TABLE project_partners ADD COLUMN IF NOT EXISTS visibility_settings JSONB DEFAULT '{
  "financials": "hidden",
  "tasks": "own_only",
  "documents": "own_only",
  "activity": "filtered",
  "guests": "hidden",
  "sponsors": "hidden",
  "budget": "hidden"
}'::jsonb;
